import express from 'express';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

// If running natively, express may already be available, if not, user needs to run `npm i express`
const app = express();
const port = 3001;

// Update these with your provided App ID and Secret
const APP_ID = '1504312414704579';
const APP_SECRET = '46acaf706daddf243d7d47fcdb0f97a4';

// HTTPS Redirect URI compliant with Meta Security Rules
const REDIRECT_URI = `https://hashtagweb3.com/api/auth/threads/callback`;

app.get('/', (req, res) => {
 const authUrl = `https://threads.net/oauth/authorize?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=threads_basic,threads_content_publish&response_type=code`;
 
 res.send(`
 <html>
 <body style="font-family: sans-serif; padding: 2rem;">
 <h2>Threads Authentication</h2>
 <p>Click the link below to authorize your Threads account.</p>
 <p><b>Important:</b> You must have "http://localhost:3001/auth" added as a valid redirect URI in your Meta App Dashboard.</p>
 <a href="${authUrl}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Authorize Threads</a>
 </body>
 </html>
 `);
});

app.get('/auth', async (req, res) => {
 const code = req.query.code as string;
 if (!code) {
 return res.send('Error: No code received.');
 }

 try {
 // 1. Exchange code for short-lived token
 const tokenForm = new URLSearchParams({
 client_id: APP_ID,
 client_secret: APP_SECRET,
 grant_type: 'authorization_code',
 redirect_uri: REDIRECT_URI,
 code: code,
 });

 console.log('Exchanging code for short-lived token...');
 const tokenRes = await fetch('https://graph.threads.net/oauth/access_token', {
 method: 'POST',
 body: tokenForm,
 });

 if (!tokenRes.ok) {
 const errText = await tokenRes.text();
 console.error('Token fetch error:', errText);
 return res.send(`Failed to get short-lived token: ${errText}`);
 }

 const tokenData = await tokenRes.json();
 const shortLivedToken = tokenData.access_token;
 const userId = tokenData.user_id;

 // 2. Exchange short-lived token for long-lived token
 console.log('Exchanging short-lived token for long-lived token...');
 const longLivedRes = await fetch(`https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${APP_SECRET}&access_token=${shortLivedToken}`);
 
 if (!longLivedRes.ok) {
 const errText = await longLivedRes.text();
 console.error('Long-lived token fetch error:', errText);
 return res.send(`Failed to get long-lived token: ${errText}`);
 }

 const longLivedData = await longLivedRes.json();
 const longLivedToken = longLivedData.access_token;

 // Output instructions
 const envUpdate = `THREADS_USER_ID=${userId}\nTHREADS_ACCESS_TOKEN=${longLivedToken}\n`;
 
 console.log('\n=============================================');
 console.log('SUCCESS! Add these to your.env file:');
 console.log('=============================================');
 console.log(envUpdate);
 console.log('=============================================\n');

 res.send(`
 <html>
 <body style="font-family: sans-serif; padding: 2rem;">
 <h2>Success! 🎉</h2>
 <p>Your tokens have been generated. Check your terminal output.</p>
 <p>You can now safely close this window and stop the server in your terminal.</p>
 </body>
 </html>
 `);

 // Optionally stop the server
 setTimeout(() => {
 console.log('Shutting down auth server...');
 process.exit(0);
 }, 2000);

 } catch (err) {
 console.error(err);
 res.send('An error occurred during authentication.');
 }
});

app.listen(port, () => {
 console.log(`Auth server running at http://localhost:${port}`);
 console.log('Open this URL in your browser to begin the OAuth flow.');
});
