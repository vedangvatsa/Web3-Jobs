import * as fs from 'fs';
import * as path from 'path';

const token = process.env.BUFFER_ACCESS_TOKEN || 'WLGVA8tQgQ6lHyM267pKDys4EEN5kls4SAVvO-TTFtB';
const instagramId = '69c5b180af47dacb695b611e';

const urls = [
 { url: 'https://i.redd.it/lovs5ed8qrwg1.jpeg', text: '"Why do you want to work here?"\n\nAre we still pretending we don't just work for money?\n\nSkip the corporate theater. Browse transparent Web3 roles: hashtagweb3.com' },
 { url: 'https://i.redd.it/wyuhe1aohdvg1.jpeg', text: 'The traditional job market is a desert right now.\n\nBut you don\'t have to be a persistent cactus.\n\nDrink from the oasis of new Web3 roles dropping daily → t.me/web3hiring' },
 { url: 'https://i.redd.it/poryo7o3llxg1.png', text: '"Entry-level role. Requires 5 years of experience." 🚩\n\nIf a job description feels like a trap, it probably is.\n\nFind roles built for reality, not impossible wishlists: hashtagweb3.com' },
 { url: 'https://i.redd.it/sqv2tvf38jvg1.jpeg', text: 'Getting ghosted after a 4-round interview isn\'t "character building." It\'s just bad process.\n\nTime to stop settling for companies that don\'t respect your time.\n\nDiscover verified Web3 companies actively hiring → hashtagweb3.com' },
 { url: 'https://i.redd.it/mijd12brvutg1.jpeg', text: 'Some company cultures wave red flags so big they cast a shadow.\n\nIf your workplace feels like this... it\'s time to quietly start looking.\n\nWe\'ve got your exit plan right here: t.me/web3hiring' }
];

async function uploadToUguu(imageUrl: string) {
 try {
 const imgRes = await fetch(imageUrl, { headers: { 'User-Agent': 'NodeBot/1.0' } });
 if (!imgRes.ok) return null;
 const buffer = await imgRes.arrayBuffer();
 
 const formData = new FormData();
 formData.append('files[]', new Blob([buffer]), 'image.jpg');

 const uploadRes = await fetch('https://uguu.se/upload', {
 method: 'POST',
 body: formData
 });
 
 const data = await uploadRes.json() as any;
 if (data.success) {
 return data.files[0].url; 
 }
 } catch (e) {
 console.error('Error uploading to uguu:', e);
 }
 return null;
}

async function run() {
 console.log('--- Scheduling Reddit Meme Posts to INSTAGRAM ---');
 
 let currentScheduleTime = new Date();
 currentScheduleTime.setDate(currentScheduleTime.getDate() + 2); // Start May 9
 currentScheduleTime.setHours(15, 0, 0, 0); // 3:00 PM
 
 for (let i = 0; i < urls.length; i++) {
 const post = urls[i];
 console.log(`\nFetching image for post ${i+1}...`);
 let publicImageUrl = post.url;
 
 console.log(`Proxying image via uguu.se to bypass Buffer blocks...`);
 const uploadedUrl = await uploadToUguu(post.url);
 if (uploadedUrl) {
 publicImageUrl = uploadedUrl;
 console.log(`Uploaded to: ${publicImageUrl}`);
 } else {
 console.log(`Failed proxy, using original Reddit URL: ${publicImageUrl}`);
 }
 
 const dueAt = currentScheduleTime.toISOString();
 
 const input: any = {
 channelId: instagramId,
 text: post.text,
 schedulingType: 'automatic',
 mode: 'customScheduled',
 dueAt: dueAt,
 metadata: {
 instagram: {
 type: 'post',
 shouldShareToFeed: true,
 }
 }
 };

 if (publicImageUrl) {
 input.assets = {
 images: [{
 url: publicImageUrl,
 thumbnailUrl: publicImageUrl,
 }]
 };
 }

 console.log(`Scheduling to Instagram at ${dueAt}...`);
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
