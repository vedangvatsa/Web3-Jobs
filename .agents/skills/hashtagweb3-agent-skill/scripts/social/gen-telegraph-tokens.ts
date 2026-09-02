async function genTokens() {
 const tokens = [];
 for (let i = 0; i < 500; i++) {
 try {
 const r = await fetch('https://api.telegra.ph/createAccount?short_name=HashtagWeb3_' + i + '&author_name=HashtagWeb3.com');
 const d = await r.json() as any;
 if (d.ok) {
 tokens.push(d.result.access_token);
 console.log(`Token ${i+1}: ${d.result.access_token.slice(0, 5)}...`);
 if (tokens.length % 10 === 0) {
 const fs = require('fs');
 fs.writeFileSync('scripts/social/telegraph-tokens.json', JSON.stringify(tokens, null, 2));
 }
 } else {
 console.log(`Failed for ${i}: ${JSON.stringify(d)}`);
 }
 } catch (e: any) {
 console.log(`Error for ${i}: ${e.message}`);
 }
 await new Promise(r => setTimeout(r, 1000));
 }
 const fs = require('fs');
 fs.writeFileSync('scripts/social/telegraph-tokens.json', JSON.stringify(tokens, null, 2));
 console.log('Saved 20 tokens to scripts/social/telegraph-tokens.json');
}
genTokens().catch(console.error);
