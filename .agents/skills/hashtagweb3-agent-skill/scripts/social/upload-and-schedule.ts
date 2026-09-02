/**
 * Upload videos directly to Buffer's S3 and schedule LinkedIn posts.
 * This avoids URL-based issues (expired hosts, missing content-length).
 * 
 * Run: BUFFER_ACCESS_TOKEN=xxx npx tsx scripts/social/upload-and-schedule.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const TOKEN = process.env.BUFFER_ACCESS_TOKEN || '';
const LINKEDIN_ID = '69c5b139af47dacb695b5feb';
const GRAPHQL_URL = 'https://api.buffer.com/graphql';
const UPLOAD_URL = 'https://upload.buffer.com/upload';

interface VideoPost {
 id: string;
 localFile: string;
 text: string;
}

const VIDEOS: VideoPost[] = [
 {
 id: 'coinbase_pizza',
 localFile: 'scripts/social/output/generated/video_NON0euNOj3k.mp4',
 text: `The narrative is shifting in 2026.

Crypto isn't just about trading anymore. It's about moving money forward at the speed of the internet.

The industry is hiring for real infrastructure roles.

Browse 600+ Web3 roles today: hashtagweb3.com`,
 },
 {
 id: 'crypto_sweats',
 localFile: 'scripts/social/output/generated/video_kCMQ3Y-Sv_k.mp4',
 text: `Having the 'Crypto Sweats'?

Stop doomscrolling the charts and start building the infrastructure.

The best way to survive market volatility is to get paid a steady salary in fiat (or stablecoins) to build the next generation of financial rails.

Find roles: hashtagweb3.com`,
 },
 {
 id: 'self_help_singh',
 localFile: 'scripts/social/output/generated/video_DDEMr_sIsDg.mp4',
 text: `Crypto anxiety is a choice. Building is a career.

If the daily volatility is giving you anxiety, step away from the trading terminal and step into the builder economy.

Web3 companies are hiring across all departments. You don't need to be a trader to make it in this industry.

Apply today: hashtagweb3.com`,
 },
];

async function gql(query: string, variables: any) {
 const res = await fetch(GRAPHQL_URL, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
 body: JSON.stringify({ query, variables }),
 });
 return res.json() as Promise<any>;
}

async function uploadVideo(filePath: string): Promise<string | null> {
 const fullPath = path.resolve(filePath);
 const fileBuffer = fs.readFileSync(fullPath);
 const fileName = path.basename(fullPath);
 
 // Use Buffer's upload API
 const formData = new FormData();
 formData.append('file', new Blob([fileBuffer], { type: 'video/mp4' }), fileName);
 
 console.log(`  Uploading ${fileName} (${(fileBuffer.length / 1048576).toFixed(1)}MB)...`);
 
 const res = await fetch(UPLOAD_URL, {
 method: 'POST',
 headers: {
 Authorization: `Bearer ${TOKEN}`,
 },
 body: formData,
 });
 
 if (!res.ok) {
 const text = await res.text();
 console.error(`  Upload failed (${res.status}): ${text.slice(0, 200)}`);
 
 // Fallback: try using the REST API v1 upload
 console.log(' Trying REST API upload...');
 const restRes = await fetch(`https://api.bufferapp.com/1/media/upload.json?access_token=${TOKEN}`, {
 method: 'POST',
 body: formData,
 });
 
 if (!restRes.ok) {
 const restText = await restRes.text();
 console.error(`  REST upload also failed (${restRes.status}): ${restText.slice(0, 200)}`);
 return null;
 }
 
 const restData = await restRes.json();
 console.log(`  REST upload result:`, JSON.stringify(restData).slice(0, 200));
 return restData.url || restData.upload?.url || null;
 }
 
 const data = await res.json();
 console.log(`  Upload result:`, JSON.stringify(data).slice(0, 200));
 return data.url || data.upload?.url || null;
}

async function scheduleWithUpload(video: VideoPost, slot: Date) {
 // Try direct upload first
 const uploadedUrl = await uploadVideo(video.localFile);
 
 if (uploadedUrl) {
 console.log(`  Got upload URL: ${uploadedUrl}`);
 // Schedule with the uploaded URL
 const result = await gql(`
 mutation CreatePost($input: CreatePostInput!) {
 createPost(input: $input) {
... on PostActionSuccess { post { id } }
... on MutationError { message }
 }
 }
 `, {
 input: {
 channelId: LINKEDIN_ID,
 text: video.text,
 schedulingType: 'automatic',
 mode: 'customScheduled',
 dueAt: slot.toISOString(),
 assets: { videos: [{ url: uploadedUrl }] },
 },
 });

 const post = result.data?.createPost;
 if (post?.post?.id) {
 console.log(`  ✅ Scheduled (ID: ${post.post.id})`);
 return true;
 }
 console.log(`  ❌ Schedule failed: ${post?.message || JSON.stringify(result.errors)}`);
 }
 
 // Fallback: try creating post with video upload inline via GraphQL
 console.log(' Trying inline GraphQL upload...');
 
 const fileBuffer = fs.readFileSync(path.resolve(video.localFile));
 const fileName = path.basename(video.localFile);
 
 // GraphQL multipart request (follows graphql-multipart-request-spec)
 const operations = JSON.stringify({
 query: `mutation CreatePost($input: CreatePostInput!) {
 createPost(input: $input) {
... on PostActionSuccess { post { id } }
... on MutationError { message }
 }
 }`,
 variables: {
 input: {
 channelId: LINKEDIN_ID,
 text: video.text,
 schedulingType: 'automatic',
 mode: 'customScheduled',
 dueAt: slot.toISOString(),
 assets: { videos: [{ file: null }] },
 },
 },
 });
 
 const map = JSON.stringify({ '0': ['variables.input.assets.videos.0.file'] });
 
 const form = new FormData();
 form.append('operations', operations);
 form.append('map', map);
 form.append('0', new Blob([fileBuffer], { type: 'video/mp4' }), fileName);
 
 const res = await fetch(GRAPHQL_URL, {
 method: 'POST',
 headers: { Authorization: `Bearer ${TOKEN}` },
 body: form,
 });
 
 const data = await res.json();
 const post = data.data?.createPost;
 if (post?.post?.id) {
 console.log(`  ✅ Scheduled via multipart (ID: ${post.post.id})`);
 return true;
 }
 
 console.log(`  ❌ All methods failed: ${post?.message || JSON.stringify(data.errors || data)}`);
 return false;
}

async function run() {
 if (!TOKEN) { console.error('BUFFER_ACCESS_TOKEN required'); process.exit(1); }

 const baseDate = new Date();
 baseDate.setDate(baseDate.getDate() + 1);
 baseDate.setUTCHours(4, 0, 0, 0);

 for (let i = 0; i < VIDEOS.length; i++) {
 const video = VIDEOS[i];
 const slot = new Date(baseDate.getTime() + i * 8 * 60 * 60 * 1000);
 console.log(`\n📹 Scheduling: ${video.id} at ${slot.toISOString()}`);
 await scheduleWithUpload(video, slot);
 }

 console.log('\nDone.');
}

run().catch(console.error);
