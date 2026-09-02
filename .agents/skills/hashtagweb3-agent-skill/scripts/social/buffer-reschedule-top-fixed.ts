import * as fs from 'fs';
import * as path from 'path';

const token = process.env.BUFFER_ACCESS_TOKEN || 'WLGVA8tQgQ6lHyM267pKDys4EEN5kls4SAVvO-TTFtB';
const linkedinId = '69c5b139af47dacb695b5feb';

const urls = [
 { url: 'https://www.linkedin.com/feed/update/urn:li:activity:7436498422892953600', text: 'This illusion takes a second...\n\nBut finding a Web3 job doesn't.\n\nBrowse roles: hashtagweb3.com' },
 { url: 'https://www.linkedin.com/feed/update/urn:li:activity:7431610715108507648', text: 'Honest OOOs are the best OOOs.\n\nJob searches should be the same. No fluff, just reality.\n\nFind your next role: hashtagweb3.com' },
 { url: 'https://www.linkedin.com/feed/update/urn:li:activity:7337679207553974272', text: 'CT scan of people who held Bitcoin when it was $15K in 2022. 🧠💎\n\nFind roles where this mindset is rewarded: hashtagweb3.com' },
 { url: 'https://www.linkedin.com/feed/update/urn:li:activity:7416834403831595008', text: 'If your boss is using ChatGPT to email you, it might be time to move on.\n\nFresh remote roles: t.me/web3hiring' },
 { url: 'https://www.linkedin.com/feed/update/urn:li:activity:7432314836602228736', text: 'We fear risks that don't exist anymore, and follow rules from a different era.\n\nThe market changed. Your opportunities did too.\n\nRemote roles: t.me/web3hiring' }
];

async function fetchOgImage(url: string) {
 try {
 const res = await fetch(url);
 const html = await res.text();
 const match = html.match(/property="og:image"\s+content="([^"]+)"/);
 if (match && match[1]) {
 return match[1].replace(/&amp;/g, '&');
 }
 } catch (e) {
 console.error('Error fetching', url);
 }
 return null;
}

async function uploadToUguu(imageUrl: string) {
 try {
 const imgRes = await fetch(imageUrl);
 const buffer = await imgRes.arrayBuffer();
 
 const formData = new FormData();
 formData.append('files[]', new Blob([buffer]), 'image.jpg');

 const uploadRes = await fetch('https://uguu.se/upload', {
 method: 'POST',
 body: formData
 });
 
 const data = await uploadRes.json() as any;
 if (data.success) {
 return data.files[0].url; // Usually tmpfiles or uguu provides direct URLs
 }
 } catch (e) {
 console.error('Error uploading to uguu:', e);
 }
 return null;
}

async function run() {
 console.log('--- Rescheduling Top Posts ---');
 
 let currentScheduleTime = new Date();
 currentScheduleTime.setDate(currentScheduleTime.getDate() + 1);
 currentScheduleTime.setHours(9, 0, 0, 0); 
 
 for (let i = 0; i < urls.length; i++) {
 const post = urls[i];
 console.log(`\nFetching image for post ${i+1}...`);
 const originalImageUrl = await fetchOgImage(post.url);
 let publicImageUrl = originalImageUrl;
 
 if (originalImageUrl) {
 console.log('Proxying image via uguu.se to bypass LinkedIn blocking Buffer...');
 const uploadedUrl = await uploadToUguu(originalImageUrl);
 if (uploadedUrl) {
 publicImageUrl = uploadedUrl;
 console.log(`Uploaded to: ${publicImageUrl}`);
 } else {
 console.log('Fallback to original image URL (might fail).');
 }
 }
 
 const dueAt = currentScheduleTime.toISOString();
 
 const input: any = {
 channelId: linkedinId,
 text: post.text,
 schedulingType: 'automatic',
 mode: 'customScheduled',
 dueAt: dueAt,
 };

 if (publicImageUrl) {
 input.assets = {
 images: [{
 url: publicImageUrl,
 thumbnailUrl: publicImageUrl,
 }]
 };
 }

 console.log(`Scheduling to LinkedIn at ${dueAt}...`);
 const res = await fetch('https://api.buffer.com/graphql', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}`,
 },
 body: JSON.stringify({
 query: `
 mutation CreatePost($input: CreatePostInput!) {
 createPost(input: $input) {
... on PostActionSuccess {
 post { id }
 }
... on MutationError { message }
 }
 }
 `,
 variables: { input }
 })
 });

 const data = await res.json() as any;
 if (data.errors) {
 console.error(' ERROR:', JSON.stringify(data.errors));
 } else {
 const result = data.data?.createPost;
 if (result?.post?.id) {
 console.log(`  ✅ SUCCESS (ID: ${result.post.id})`);
 } else if (result?.message) {
 console.log(`  ❌ FAILED: ${result.message}`);
 }
 }
 
 currentScheduleTime.setHours(currentScheduleTime.getHours() + 6);
 }
}

run().catch(console.error);
