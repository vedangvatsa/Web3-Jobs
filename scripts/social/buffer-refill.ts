/**
 * Buffer Auto-Refill Script
 * 
 * Checks how many posts are pending in Buffer queue.
 * If fewer than threshold, schedules the next batch of posts.
 * 
 * Fixes applied:
 * - Always advance lastIndex even on failure (prevents stuck loop)
 * - Use content hashing to detect duplicates before submitting
 * - Skip posts without imageUrl for Instagram
 * - Improved queue count query with fallback
 * 
 * Run with: npx tsx scripts/social/buffer-refill.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const TOKEN = process.env.BUFFER_ACCESS_TOKEN || '';
const ORG_ID = process.env.BUFFER_ORG_ID || '69c5b0f799d3bd8de475e25a';
const LINKEDIN_ID = '69c5b139af47dacb695b5feb';
const INSTAGRAM_ID = '69c5b180af47dacb695b611e';
const GRAPHQL_URL = 'https://api.buffer.com/graphql';

const STATE_FILE = path.join(__dirname, 'buffer-refill-state.json');
const SCHEDULE_FILE = path.join(__dirname, 'content-schedule.json');

interface RefillState {
 linkedin: { lastIndex: number; lastScheduledAt: string; postedHashes: string[] };
 instagram: { lastIndex: number; lastScheduledAt: string; postedHashes: string[] };
}

function loadState(): RefillState {
 if (fs.existsSync(STATE_FILE)) {
 const s = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
 // Migrate: add postedHashes if missing
 if (!s.linkedin.postedHashes) s.linkedin.postedHashes = [];
 if (!s.instagram.postedHashes) s.instagram.postedHashes = [];
 return s;
 }
 return {
 linkedin: { lastIndex: -1, lastScheduledAt: '', postedHashes: [] },
 instagram: { lastIndex: -1, lastScheduledAt: '', postedHashes: [] },
 };
}

function saveState(state: RefillState) {
 fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function hashText(text: string): string {
 return crypto.createHash('md5').update(text).digest('hex').slice(0, 12);
}

async function gqlRequest(query: string, variables: any) {
 const res = await fetch(GRAPHQL_URL, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${TOKEN}`,
 },
 body: JSON.stringify({ query, variables }),
 });
 return res.json() as Promise<any>;
}

function cleanAndCompareText(candidate: string, existing: string): boolean {
 const normalize = (t: string) => {
 return t
.toLowerCase()
.replace(/https?:\/\/[^\s]+/g, '')
.replace(/#\w+/g, '')
.replace(/[^a-z0-9]/g, '')
.substring(0, 80);
 };
 
 const normCandidate = normalize(candidate);
 const normExisting = normalize(existing);
 
 if (normCandidate.length < 15 || normExisting.length < 15) return false;
 return normCandidate === normExisting || normExisting.includes(normCandidate) || normCandidate.includes(normExisting);
}

async function getQueueTexts(channelId: string): Promise<string[]> {
 const query = `query GetPosts($channelId: String!) {
 posts(input: { channelId: $channelId, status: "scheduled" }) {
 edges { node { text } }
 }
 }`;
 try {
 const data = await gqlRequest(query, { channelId });
 if (!data.errors) {
 const edges = data.data?.posts?.edges || [];
 return edges.map((e: any) => e.node?.text || '');
 }
 } catch (err) {
 console.warn(`[Pre-flight] Buffer fetch queue texts failed for ${channelId}:`, err);
 }
 return [];
}

async function getQueueCount(channelId: string): Promise<number> {
 // Try multiple query patterns since Buffer's GraphQL schema changes
 const queries = [
 // Pattern 1: posts query with status filter
 {
 query: `query GetPosts($channelId: String!) {
 posts(input: { channelId: $channelId, status: "scheduled" }) {
 edges { node { id } }
 totalCount
 }
 }`,
 variables: { channelId },
 },
 // Pattern 2: channel-level queue info
 {
 query: `query GetChannel($channelId: String!) {
 channel(input: { id: $channelId }) {
 pendingCount
 }
 }`,
 variables: { channelId },
 },
 ];

 for (const q of queries) {
 try {
 const data = await gqlRequest(q.query, q.variables);
 if (!data.errors) {
 const count = data.data?.posts?.totalCount
 ?? data.data?.posts?.edges?.length
 ?? data.data?.channel?.pendingCount
 ?? null;
 if (count !== null) {
 console.log(`Queue count for ${channelId}: ${count}`);
 return count;
 }
 }
 } catch {
 // Try next pattern
 }
 }

 // If all queries fail, assume we need to refill but only schedule a small batch
 console.log(`Could not query queue count for ${channelId}, assuming needs refill`);
 return 0;
}

async function schedulePost(
 channelId: string,
 text: string,
 imageUrl: string,
 dueAt: string,
 isInstagram: boolean,
 videoUrl?: string
): Promise<{ success: boolean; duplicate: boolean }> {
 const input: any = {
 channelId,
 text,
 schedulingType: 'automatic',
 mode: 'customScheduled',
 dueAt,
 };

 if (videoUrl) {
 input.assets = {
 videos: [{ url: videoUrl }],
 };
 } else if (imageUrl) {
 input.assets = {
 images: [{ url: imageUrl, thumbnailUrl: imageUrl }],
 };
 }

 if (isInstagram) {
 input.metadata = {
 instagram: { type: 'post', shouldShareToFeed: true },
 };
 }

 const data = await gqlRequest(`
 mutation CreatePost($input: CreatePostInput!) {
 createPost(input: $input) {
... on PostActionSuccess { post { id } }
... on MutationError { message }
 }
 }
 `, { input });

 if (data.errors) {
 const errorMsg = JSON.stringify(data.errors);
 console.error(' ERROR:', errorMsg);
 return { success: false, duplicate: false };
 }

 const result = data.data?.createPost;
 if (result?.post?.id) {
 console.log(`  SUCCESS (ID: ${result.post.id})`);
 return { success: true, duplicate: false };
 } else {
 const msg = result?.message || 'unknown';
 const isDuplicate = msg.toLowerCase().includes('posted that one recently') ||
 msg.toLowerCase().includes('same thing again');
 console.log(`  FAILED: ${msg}${isDuplicate ? ' [DUPLICATE - will skip]' : ''}`);
 return { success: false, duplicate: isDuplicate };
 }
}

async function run() {
 if (!TOKEN) {
 console.error('BUFFER_ACCESS_TOKEN is required');
 process.exit(1);
 }

 const schedule = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8'));
 const state = loadState();

 console.log('--- Buffer Auto-Refill ---');
 console.log(`Total posts in schedule: ${schedule.length}`);
 console.log(`LinkedIn lastIndex: ${state.linkedin.lastIndex}, posted hashes: ${state.linkedin.postedHashes.length}`);
 console.log(`Instagram lastIndex: ${state.instagram.lastIndex}, posted hashes: ${state.instagram.postedHashes.length}`);

 // Check queue counts
 const liCount = await getQueueCount(LINKEDIN_ID);
 const igCount = await getQueueCount(INSTAGRAM_ID);

 console.log(`LinkedIn queue: ${liCount} pending`);
 console.log(`Instagram queue: ${igCount} pending`);

 // Buffer free plan = 10 posts per channel
 // Refill if fewer than 5 pending
 const REFILL_THRESHOLD = 5;
 const BATCH_SIZE = 5;

 // Generate time slots starting from a given time
 const generateSlots = (count: number, startTimeStr: string): Date[] => {
 const slots: Date[] = [];
 const hours = [1, 9, 17]; // IST hours
 
 let d = new Date();
 let strictlyAfter = new Date();
 if (startTimeStr) {
 const st = new Date(startTimeStr);
 if (!isNaN(st.getTime()) && st > d) {
 d = new Date(st);
 strictlyAfter = new Date(st);
 }
 }
 
 d.setMinutes(0, 0, 0);

 while (slots.length < count) {
 for (const h of hours) {
 // Convert IST hour to UTC: IST = UTC+5:30
 // So IST 1:00 = UTC 19:30 (prev day), IST 9:00 = UTC 3:30, IST 17:00 = UTC 11:30
 const slot = new Date(d);
 const utcHour = h < 6 ? (h - 6 + 24) : (h - 6);
 const utcMin = h < 6 ? 30 : 30;
 slot.setUTCHours(utcHour, utcMin, 0, 0);

 // If IST hour < 6, slot is on previous UTC day but we started from current day,
 // so for IST 1am, the UTC time is 19:30 previous day
 if (h < 6) {
 // IST 1am = UTC 19:30 same calendar day minus 1
 // Actually: IST 1:00 Mar 31 = UTC 19:30 Mar 30
 // But we want future slots, so if IST 1am today already passed, skip
 slot.setUTCHours(19, 30, 0, 0);
 slot.setDate(slot.getDate() - 1);
 }

 const now = new Date();
 if (slot > now && slot > strictlyAfter && slots.length < count) {
 slots.push(new Date(slot));
 }
 }
 d.setDate(d.getDate() + 1);
 }
 return slots;
 };

 // Refill LinkedIn
 if (liCount < REFILL_THRESHOLD) {
 const toSchedule = Math.min(BATCH_SIZE, 10 - liCount);
 console.log(`\nRefilling LinkedIn: scheduling up to ${toSchedule} posts...`);
 
 console.log('🔍 Fetching scheduled Buffer queue texts for LinkedIn...');
 const queueTexts = await getQueueTexts(LINKEDIN_ID);
 
 const slots = generateSlots(toSchedule, state.linkedin.lastScheduledAt);
 let scheduled = 0;

 for (let i = 0; i < toSchedule; i++) {
 const idx = (state.linkedin.lastIndex + 1 + i) % schedule.length;
 const post = schedule[idx];
 const textHash = hashText(post.linkedin.text);

 // Skip if we already posted this exact content recently or if it's already in the queue
 const isAlreadyInQueue = queueTexts.some(qt => cleanAndCompareText(post.linkedin.text, qt));
 if (isAlreadyInQueue || state.linkedin.postedHashes.includes(textHash)) {
 console.log(`  SKIP ${post.id} (already in queue or posted recently, hash: ${textHash})`);
 if (isAlreadyInQueue && !state.linkedin.postedHashes.includes(textHash)) {
 state.linkedin.postedHashes.push(textHash);
 }
 continue;
 }

 const dueAt = slots[scheduled].toISOString();
 console.log(`  ${post.id} at ${dueAt}`);
  const uniqueText = post.linkedin.text.replace(/hashtagweb3\.com\/th/g, 'hashtagweb3.com/li')
                                      .replace(/hashtagweb3\.com(?!\/)/g, 'hashtagweb3.com/li');
 const result = await schedulePost(
 LINKEDIN_ID,
 uniqueText,
 post.imageUrl || '',
 dueAt,
 false,
 post.videoUrl || undefined
 );

 if (result.success) {
 state.linkedin.postedHashes.push(textHash);
 state.linkedin.lastScheduledAt = dueAt;
 scheduled++;
 } else if (result.duplicate) {
 // Mark as posted so we skip it next time
 state.linkedin.postedHashes.push(textHash);
 }
 }

 // ALWAYS advance the index, even if all posts failed
 // This prevents the stuck loop where we keep retrying the same posts
 state.linkedin.lastIndex = (state.linkedin.lastIndex + toSchedule) % schedule.length;
 console.log(`  LinkedIn index advanced to: ${state.linkedin.lastIndex} (scheduled ${scheduled}/${toSchedule})`);
 } else {
 console.log('LinkedIn queue OK, no refill needed');
 }

 // Refill Instagram (with offset for shuffling)
 if (igCount < REFILL_THRESHOLD) {
 const toSchedule = Math.min(BATCH_SIZE, 10 - igCount);
 console.log(`\nRefilling Instagram: scheduling up to ${toSchedule} posts...`);
 
 console.log('🔍 Fetching scheduled Buffer queue texts for Instagram...');
 const queueTexts = await getQueueTexts(INSTAGRAM_ID);
 
 const slots = generateSlots(toSchedule, state.instagram.lastScheduledAt);
 let scheduled = 0;
 let skippedNoImage = 0;

 for (let i = 0; i < toSchedule; i++) {
 const baseIdx = (state.instagram.lastIndex + 1 + i) % schedule.length;
 // Instagram uses offset 3 for shuffling
 const shuffledIdx = (baseIdx + 3) % schedule.length;
 const post = schedule[shuffledIdx];

 // Skip posts without imageUrl or videoUrl - Instagram requires media
 if (!post.imageUrl && !post.videoUrl) {
 console.log(`  SKIP ${post.id} (no imageUrl/videoUrl - Instagram requires media)`);
 skippedNoImage++;
 continue;
 }

 const textHash = hashText(post.instagram.text);

 // Skip if already posted recently or if it's already in the queue
 const isAlreadyInQueue = queueTexts.some(qt => cleanAndCompareText(post.instagram.text, qt));
 if (isAlreadyInQueue || state.instagram.postedHashes.includes(textHash)) {
 console.log(`  SKIP ${post.id} (already in queue or posted recently, hash: ${textHash})`);
 if (isAlreadyInQueue && !state.instagram.postedHashes.includes(textHash)) {
 state.instagram.postedHashes.push(textHash);
 }
 continue;
 }

 const dueAt = slots[scheduled].toISOString();
 console.log(`  ${post.id} at ${dueAt}`);
 const result = await schedulePost(
 INSTAGRAM_ID,
 post.instagram.text,
 post.imageUrl || '',
 dueAt,
 true,
 post.videoUrl || undefined
 );

 if (result.success) {
 state.instagram.postedHashes.push(textHash);
 state.instagram.lastScheduledAt = dueAt;
 scheduled++;
 } else if (result.duplicate) {
 state.instagram.postedHashes.push(textHash);
 }
 }

 // ALWAYS advance the index
 state.instagram.lastIndex = (state.instagram.lastIndex + toSchedule) % schedule.length;
 console.log(`  Instagram index advanced to: ${state.instagram.lastIndex} (scheduled ${scheduled}/${toSchedule}, skipped ${skippedNoImage} no-image)`);
 } else {
 console.log('Instagram queue OK, no refill needed');
 }

 // Keep postedHashes from growing unbounded and preventing looping
 // Keep fewer items than the total schedule length (e.g. 20) so the loop can start over
 state.linkedin.postedHashes = state.linkedin.postedHashes.slice(-20);
 state.instagram.postedHashes = state.instagram.postedHashes.slice(-20);

 saveState(state);
 console.log('\nRefill complete. State saved.');
}

run().catch(console.error);
