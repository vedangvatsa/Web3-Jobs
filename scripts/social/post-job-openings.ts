#!/usr/bin/env npx tsx
/**
 * Automated Social Job Opening Poster (X / Twitter & Threads)
 *
 * Posts verified job openings to X and Threads in the exact format:
 *
 *   Company is hiring role
 *
 *   https://hashtagweb3.com/<slug>/x (for X)
 *   https://hashtagweb3.com/<slug>/th (for Threads)
 *
 * Features:
 *   - Automatically cycles through active, high-quality jobs
 *   - Verifies dynamic OG image availability prior to posting
 *   - Attaches public OG image container on Threads so images are always visible
 *   - Tracks posted slugs in scripts/social/jobs-social-posted.json to prevent repeats
 *   - Supports --dry-run for zero-risk testing without making API calls
 *
 * Usage:
 *   npx tsx scripts/social/post-job-openings.ts --platform x --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform threads --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform both --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform x
 *   npx tsx scripts/social/post-job-openings.ts --platform threads
 *   npx tsx scripts/social/post-job-openings.ts --platform both
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(rootDir, '.env.local'), override: true });

const JOBS_CACHE_FILE = path.join(rootDir, 'content/jobs-cache.json');
const STATE_FILE = path.join(__dirname, 'jobs-social-posted.json');
const SITE_URL = 'https://hashtagweb3.com';

interface Job {
  id?: string;
  slug: string;
  title: string;
  company: string;
  location?: string;
  department?: string | { name?: string };
  link: string;
}

interface SocialState {
  lastIndex: number;
  postedSlugs: string[];
  history: Array<{
    slug: string;
    company: string;
    title: string;
    platform: string;
    postedAt: string;
    postId?: string;
  }>;
}

function loadJobs(): Job[] {
  if (!fs.existsSync(JOBS_CACHE_FILE)) {
    throw new Error(`Jobs cache not found at ${JOBS_CACHE_FILE}`);
  }
  const raw: Job[] = JSON.parse(fs.readFileSync(JOBS_CACHE_FILE, 'utf-8'));
  return raw.filter((j) => {
    if (!j.slug || !j.title || !j.company || !j.link) return false;
    const titleLower = j.title.toLowerCase();
    if (
      titleLower.includes('general application') ||
      titleLower.includes('talent pool') ||
      titleLower.includes('speculative') ||
      titleLower.includes('future opportunities')
    ) {
      return false;
    }
    return true;
  });
}

function loadState(): SocialState {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch {
      // Fallback if file corrupted
    }
  }
  return {
    lastIndex: 0,
    postedSlugs: [],
    history: [],
  };
}

function saveState(state: SocialState) {
  state.postedSlugs = state.postedSlugs.slice(-1000);
  state.history = state.history.slice(-1000);
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ── OAuth 1.0a Helpers for X / Twitter ──

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

function generateOAuthNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map((k) => `${percentEncode(k)}=${percentEncode(params[k])}`).join('&');
  const baseString = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramString)}`;
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
}

function buildOAuthHeader(params: Record<string, string>): string {
  const entries = Object.keys(params)
    .filter((k) => k.startsWith('oauth_'))
    .sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(params[k])}"`);
  return `OAuth ${entries.join(', ')}`;
}

async function postToX(text: string): Promise<string> {
  const consumerKey = process.env.X_CONSUMER_KEY;
  const consumerSecret = process.env.X_CONSUMER_SECRET;
  const oauthToken = process.env.X_ACCESS_TOKEN;
  const oauthTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!consumerKey || !consumerSecret || !oauthToken || !oauthTokenSecret) {
    throw new Error('X API credentials missing (X_CONSUMER_KEY, X_CONSUMER_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET)');
  }

  const tweetUrl = 'https://api.twitter.com/2/tweets';
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateOAuthNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: oauthToken,
    oauth_version: '1.0',
  };
  oauthParams.oauth_signature = generateOAuthSignature('POST', tweetUrl, oauthParams, consumerSecret, oauthTokenSecret);

  const res = await fetch(tweetUrl, {
    method: 'POST',
    headers: {
      Authorization: buildOAuthHeader(oauthParams),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  const responseText = await res.text();
  if (!res.ok) {
    throw new Error(`X API error ${res.status}: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  return data.data?.id || 'unknown';
}

async function postToThreads(text: string, imageUrl: string): Promise<string> {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  const threadsUserId = process.env.THREADS_USER_ID;

  if (!accessToken || !threadsUserId) {
    throw new Error('Threads credentials missing (THREADS_ACCESS_TOKEN, THREADS_USER_ID)');
  }

  const urlParams = new URLSearchParams();
  urlParams.append('access_token', accessToken);
  urlParams.append('text', text);

  if (imageUrl) {
    urlParams.append('media_type', 'IMAGE');
    urlParams.append('image_url', imageUrl);
  } else {
    urlParams.append('media_type', 'TEXT');
  }

  // Step 1: Create media container
  const createRes = await fetch(`https://graph.threads.net/v1.0/${threadsUserId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: urlParams.toString(),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Threads container creation failed: ${createRes.status} ${err}`);
  }

  const { id: containerId } = await createRes.json();

  // Wait 5 seconds for Meta media processing
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Step 2: Publish media container
  const publishRes = await fetch(`https://graph.threads.net/v1.0/${threadsUserId}/threads_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      creation_id: containerId,
      access_token: accessToken,
    }).toString(),
  });

  if (!publishRes.ok) {
    const err = await publishRes.text();
    throw new Error(`Threads publish failed: ${publishRes.status} ${err}`);
  }

  const { id: mediaId } = await publishRes.json();
  return mediaId;
}

// ── Main Scheduling & Selection ──

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const platformIdx = args.indexOf('--platform');
  const platform = platformIdx !== -1 ? args[platformIdx + 1]?.toLowerCase() : 'both';
  const slugIdx = args.indexOf('--slug');
  const targetSlug = slugIdx !== -1 ? args[slugIdx + 1] : null;

  console.log(`\n========================================`);
  console.log(` Social Job Poster [${isDryRun ? 'DRY RUN' : 'LIVE'}]`);
  console.log(` Target Platform: ${platform.toUpperCase()}`);
  console.log(`========================================\n`);

  const jobs = loadJobs();
  const state = loadState();

  const postedSet = new Set(state.postedSlugs);

  // Find next unposted job
  let selectedJob: Job | null = null;

  if (targetSlug) {
    selectedJob = jobs.find((j) => j.slug === targetSlug) || null;
    if (!selectedJob) {
      console.error(`Requested job slug "${targetSlug}" not found in cache.`);
      process.exit(1);
    }
  } else {
    const totalJobs = jobs.length;
    for (let i = 0; i < totalJobs; i++) {
      const idx = (state.lastIndex + i) % totalJobs;
      const candidate = jobs[idx];
      if (!postedSet.has(candidate.slug)) {
        selectedJob = candidate;
        state.lastIndex = (idx + 1) % totalJobs;
        break;
      }
    }

    if (!selectedJob) {
      console.log('All jobs have been posted. Resetting cycle history...');
      state.postedSlugs = [];
      selectedJob = jobs[0];
      state.lastIndex = 1;
    }
  }

  const { company, title, slug, location } = selectedJob;

  // Build OG image URL
  const ogImageUrl = `${SITE_URL}/api/og?type=job&title=${encodeURIComponent(title)}&company=${encodeURIComponent(company)}&location=${encodeURIComponent(location || 'Remote')}`;

  // Formats strictly adhering to:
  //   Company is hiring role
  //
  //   URL/x
  const xPostText = `${company} is hiring ${title}\n\n${SITE_URL}/${slug}/x`;
  const threadsPostText = `${company} is hiring ${title}\n\n${SITE_URL}/${slug}/th`;

  console.log(`Selected Job:`);
  console.log(`  Company : ${company}`);
  console.log(`  Role    : ${title}`);
  console.log(`  Slug    : ${slug}`);
  console.log(`  OG Image: ${ogImageUrl}\n`);

  // Verify OG Image responds with 200
  try {
    const ogCheck = await fetch(ogImageUrl, { method: 'HEAD' });
    console.log(`OG Image Health Check: HTTP ${ogCheck.status} (${ogCheck.headers.get('content-type') || 'unknown'})`);
  } catch (err) {
    console.warn(`Warning: OG Image check encountered error:`, (err as Error).message);
  }

  console.log(`\n--- Preview: X (Twitter) Post ---`);
  console.log(xPostText);
  console.log(`---------------------------------`);

  console.log(`\n--- Preview: Threads Post ---`);
  console.log(threadsPostText);
  console.log(`-----------------------------\n`);

  if (isDryRun) {
    console.log('DRY RUN active: No external network requests were made to X or Threads.');
    return;
  }

  const now = new Date().toISOString();

  if (platform === 'x' || platform === 'both') {
    try {
      console.log('Publishing to X...');
      const tweetId = await postToX(xPostText);
      console.log(`✓ Successfully published to X! Tweet ID: ${tweetId}`);
      state.history.push({
        slug,
        company,
        title,
        platform: 'x',
        postedAt: now,
        postId: tweetId,
      });
    } catch (err) {
      console.error(`✗ Failed to post to X:`, (err as Error).message);
    }
  }

  if (platform === 'threads' || platform === 'both') {
    try {
      console.log('Publishing to Threads...');
      const threadsId = await postToThreads(threadsPostText, ogImageUrl);
      console.log(`✓ Successfully published to Threads! Media ID: ${threadsId}`);
      state.history.push({
        slug,
        company,
        title,
        platform: 'threads',
        postedAt: now,
        postId: threadsId,
      });
    } catch (err) {
      console.error(`✗ Failed to post to Threads:`, (err as Error).message);
    }
  }

  state.postedSlugs.push(slug);
  saveState(state);
  console.log('\nState saved. Done.');
}

main().catch((err) => {
  console.error('Fatal error in social job poster:', err);
  process.exit(1);
});
