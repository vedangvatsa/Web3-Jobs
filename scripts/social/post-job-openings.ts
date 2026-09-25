#!/usr/bin/env npx tsx
/**
 * Automated Social Job Opening Poster (X, Threads, Bluesky, Farcaster, LinkedIn, Facebook & Instagram)
 *
 * Posting Strategy:
 *   - Instagram: ONLY platform that posts an image upload (Instagram feed does not support clickable links or native link cards).
 *   - LinkedIn, X, Bluesky, Farcaster, Facebook, Threads: Pure link preview cards (no image uploads).
 *     Posts the clean job URL with platform suffix so native crawlers unfurl og:image, title, and description.
 *
 * Posts verified job openings to social networks in the exact format:
 *
 *   Company is hiring role
 *
 *   https://hashtagweb3.com/<slug>/x      (for X via Buffer)
 *   https://hashtagweb3.com/<slug>/fc     (for Farcaster)
 *   Company is hiring role: https://hashtagweb3.com/<slug>/th     (for Threads)
 *   Company is hiring role: https://hashtagweb3.com/<slug>/bsky   (for Bluesky)
 *   Company is hiring role: https://hashtagweb3.com/<slug>/li     (for LinkedIn via Buffer)
 *   Company is hiring role: https://hashtagweb3.com/<slug>/fb     (for Facebook Page via Meta Graph API)
  *   (Standard landscape OG image reused for Instagram feed)
 *
 * Features:
 *   - Automatically cycles through active, high-quality jobs
 *   - Verifies dynamic OG image availability prior to posting
 *   - Strips social suffix to automatically append UTM tracking (e.g. utm_source=facebook)
 *   - Tracks posted slugs in scripts/social/jobs-social-posted.json to prevent repeats
 *   - Supports --dry-run for zero-risk testing without making API calls
 *
 * Usage:
 *   npx tsx scripts/social/post-job-openings.ts --platform x --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform threads --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform bluesky --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform farcaster --dry-run
 *
 * Farcaster targets (env):
 *   FARCASTER_CHANNEL_IDS — comma-separated channel ids (default: jobs), e.g. jobs,web3
 *   FARCASTER_POST_TO_PROFILE — also cast to main profile feed (default: true; set false to disable)
 *   npx tsx scripts/social/post-job-openings.ts --platform linkedin --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform facebook --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform instagram --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform all --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform all
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { BufferXClient, BUFFER_X_CHANNEL_ID, BUFFER_X_ACCOUNT } from './buffer-x';
import { buildUniqueJobMetaDescription } from '../../src/lib/job-guides';
import { buildJobOgImageUrl, buildJobInstagramImageUrl, JOB_OG_VERSION, SITE_URL } from '../../src/lib/job-og';

// Load environment variables
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(rootDir, '.env.local'), override: true });

const JOBS_CACHE_FILE = path.join(rootDir, 'content/jobs-cache.json');
const STATE_FILE = path.join(__dirname, 'jobs-social-posted.json');

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
  pendingSlugs: string[];
  history: SocialHistoryEntry[];
}

interface SocialHistoryEntry {
  slug: string;
  company: string;
  title: string;
  platform: string;
  postedAt: string;
  postId?: string;
  permalink?: string;
  account?: string;
  verification?: 'pending' | 'verified';
  expectedText?: string;
  provider?: 'buffer';
}

const SOCIAL_PLATFORMS = ['x', 'threads', 'bluesky', 'farcaster', 'linkedin', 'facebook', 'instagram'] as const;
type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

/** Link-preview feeds; Instagram is handled separately and must not block these. */
const LINK_CARD_PLATFORMS: readonly SocialPlatform[] = [
  'x',
  'threads',
  'bluesky',
  'farcaster',
  'linkedin',
  'facebook',
];

function buildSocialShareUrl(slug: string, suffix: string): string {
  const url = new URL(`${SITE_URL}/${slug}/${suffix}`);
  // Keep a unique cache key for each OG renderer version.
  url.searchParams.set('og', JOB_OG_VERSION);
  return url.toString();
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
      const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) as Partial<SocialState>;
      if (!Number.isInteger(state.lastIndex) || !Array.isArray(state.postedSlugs) || !Array.isArray(state.history)) {
        throw new Error('state is missing lastIndex, postedSlugs, or history');
      }
      return {
        lastIndex: state.lastIndex,
        postedSlugs: state.postedSlugs,
        pendingSlugs: Array.isArray(state.pendingSlugs) ? state.pendingSlugs : [],
        history: state.history,
      };
    } catch (error) {
      throw new Error(`Unable to load social posting state: ${(error as Error).message}`);
    }
  }
  return {
    lastIndex: 0,
    postedSlugs: [],
    pendingSlugs: [],
    history: [],
  };
}

function saveState(state: SocialState) {
  state.postedSlugs = [...new Set(state.postedSlugs)].slice(-1000);
  state.pendingSlugs = [...new Set(state.pendingSlugs)];

  if (state.history.length > 1000) {
    const pendingSlugs = new Set(state.pendingSlugs);
    const pendingEntries = state.history.filter((entry) => pendingSlugs.has(entry.slug));
    const completedEntries = state.history.filter((entry) => !pendingSlugs.has(entry.slug));
    const completedSlots = Math.max(0, 1000 - pendingEntries.length);
    const retainedCompletedEntries = new Set(
      completedSlots === 0 ? [] : completedEntries.slice(-completedSlots)
    );
    state.history = state.history.filter(
      (entry) => pendingSlugs.has(entry.slug) || retainedCompletedEntries.has(entry)
    );
  }

  const tempStateFile = `${STATE_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tempStateFile, JSON.stringify(state, null, 2));
  fs.renameSync(tempStateFile, STATE_FILE);
}

const LEGACY_INVALID_POST_IDS = new Set(['unknown', 'published']);

function isSocialPlatform(platform: string): platform is SocialPlatform {
  return (SOCIAL_PLATFORMS as readonly string[]).includes(platform);
}

function hasVerifiedPostReceipt(entry: SocialHistoryEntry): boolean {
  if (entry.verification === 'pending') return false;
  if (entry.verification === 'verified') return true;

  // Legacy state predates explicit verification. Retain real receipts while
  // rejecting the placeholder values previously used after malformed replies.
  return Boolean(entry.postId?.trim()) && !LEGACY_INVALID_POST_IDS.has(entry.postId!);
}

function verifiedPlatformsForSlug(state: SocialState, slug: string): Set<SocialPlatform> {
  const platforms = new Set<SocialPlatform>();
  for (const entry of state.history) {
    if (
      entry.slug === slug &&
      isSocialPlatform(entry.platform) &&
      entry.platform !== 'farcaster' &&
      hasVerifiedPostReceipt(entry) &&
      !(entry.platform === 'threads' && state.pendingSlugs.includes(slug) && entry.verification !== 'verified')
    ) {
      platforms.add(entry.platform);
    }
  }
  if (isFarcasterComplete(state, slug)) {
    platforms.add('farcaster');
  }
  return platforms;
}

function missingRequestedPlatforms(
  state: SocialState,
  slug: string,
  requested: readonly SocialPlatform[],
): SocialPlatform[] {
  const verified = verifiedPlatformsForSlug(state, slug);
  return requested.filter((name) => !verified.has(name));
}

function findPendingJob(
  state: SocialState,
  jobs: Job[],
  requestedPlatforms: readonly SocialPlatform[],
  mode: 'link-cards' | 'instagram-only',
): Job | null {
  for (const slug of state.pendingSlugs) {
    const job = jobs.find((entry) => entry.slug === slug);
    if (!job) continue;
    const missing = missingRequestedPlatforms(state, job.slug, requestedPlatforms);
    if (missing.length === 0) continue;
    const missingLinkCards = missing.filter((name) => LINK_CARD_PLATFORMS.includes(name));
    if (mode === 'link-cards' && missingLinkCards.length === 0) continue;
    if (mode === 'instagram-only' && missingLinkCards.length > 0) continue;
    return job;
  }
  return null;
}

function isFreshRotationJob(state: SocialState, slug: string, postedSet: Set<string>): boolean {
  if (postedSet.has(slug)) return false;
  // Partially posted pending jobs (e.g. LinkedIn done, Instagram missing) must
  // not be treated as fresh rotations or LinkedIn/Facebook stay skipped forever.
  return verifiedPlatformsForSlug(state, slug).size === 0;
}

function pickNextUnpostedJob(
  jobs: Job[],
  state: SocialState,
  postedSet: Set<string>,
): Job | null {
  const totalJobs = jobs.length;
  const lastPostedCompany = state.history.length > 0
    ? state.history[state.history.length - 1].company.toLowerCase()
    : null;

  for (let i = 0; i < totalJobs; i++) {
    const idx = (state.lastIndex + i) % totalJobs;
    const candidate = jobs[idx];
    if (
      isFreshRotationJob(state, candidate.slug, postedSet) &&
      candidate.company.toLowerCase() !== lastPostedCompany
    ) {
      state.lastIndex = (idx + 1) % totalJobs;
      return candidate;
    }
  }
  for (let i = 0; i < totalJobs; i++) {
    const idx = (state.lastIndex + i) % totalJobs;
    const candidate = jobs[idx];
    if (isFreshRotationJob(state, candidate.slug, postedSet)) {
      state.lastIndex = (idx + 1) % totalJobs;
      return candidate;
    }
  }
  return null;
}

function isSlugComplete(state: SocialState, slug: string): boolean {
  const verifiedPlatforms = verifiedPlatformsForSlug(state, slug);
  return SOCIAL_PLATFORMS.every((platform) => verifiedPlatforms.has(platform));
}

function markSlugPending(state: SocialState, slug: string): boolean {
  let changed = false;
  if (!state.pendingSlugs.includes(slug)) {
    state.pendingSlugs.push(slug);
    changed = true;
  }
  if (state.postedSlugs.includes(slug)) {
    state.postedSlugs = state.postedSlugs.filter((value) => value !== slug);
    changed = true;
  }
  return changed;
}

function markSlugComplete(state: SocialState, slug: string): boolean {
  let changed = false;
  if (state.pendingSlugs.includes(slug)) {
    state.pendingSlugs = state.pendingSlugs.filter((value) => value !== slug);
    changed = true;
  }
  if (!state.postedSlugs.includes(slug)) {
    state.postedSlugs.push(slug);
    changed = true;
  }
  return changed;
}

function reconcileCompletedPendingSlugs(state: SocialState): boolean {
  let changed = false;
  for (const slug of [...state.pendingSlugs]) {
    if (isSlugComplete(state, slug) && markSlugComplete(state, slug)) {
      changed = true;
    }
  }
  return changed;
}

function recordVerifiedPost(state: SocialState, entry: SocialHistoryEntry): void {
  state.history.push({ ...entry, verification: 'verified' });
  saveState(state);
}

function xBufferClient(): BufferXClient {
  return new BufferXClient(process.env.BUFFER_ACCESS_TOKEN || '', process.env.BUFFER_X_CHANNEL_ID || BUFFER_X_CHANNEL_ID);
}

async function reconcilePendingXPosts(state: SocialState): Promise<void> {
  for (const entry of state.history) {
    if (entry.platform !== 'x' || entry.provider !== 'buffer' || entry.verification !== 'pending') continue;
    try {
      if (!entry.postId || !entry.expectedText) throw new Error('Pending Buffer X receipt is incomplete');
      entry.permalink = await xBufferClient().verify(entry.postId, entry.expectedText, 1);
      entry.verification = 'verified';
      saveState(state);
      console.log(`X post confirmed through Buffer: ${entry.permalink}`);
    } catch (error) {
      console.warn(`X receipt remains pending for ${entry.slug}: ${(error as Error).message}`);
    }
  }
}

function getThreadsCredentials() {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  const threadsUserId = process.env.THREADS_USER_ID;

  if (!accessToken || !threadsUserId) {
    throw new Error('Threads credentials missing (THREADS_ACCESS_TOKEN, THREADS_USER_ID)');
  }

  return { accessToken, threadsUserId };
}

interface ThreadsAccount {
  id: string;
  username: string;
}

interface ThreadsPost {
  id: string;
  permalink: string;
  username: string;
  text: string;
}

interface ThreadsPostExpectation {
  slug: string;
  company: string;
  title: string;
  expectedText?: string;
}

async function getThreadsAccount(accessToken: string): Promise<ThreadsAccount> {
  const response = await fetch('https://graph.threads.net/v1.0/me?fields=id,username', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await response.json()) as { id?: string; username?: string; error?: unknown };
  if (!response.ok || !data.id || !data.username) {
    throw new Error(`Threads account lookup failed: ${JSON.stringify(data.error || data)}`);
  }
  return { id: data.id, username: data.username };
}

function hasExpectedThreadsPostText(text: string, expected: ThreadsPostExpectation): boolean {
  if (expected.expectedText && text === expected.expectedText) return true;

  const prefix = `${expected.company} is hiring ${expected.title}: `;
  if (!text.startsWith(prefix)) return false;
  try {
    const url = new URL(text.slice(prefix.length).trim());
    return url.origin === new URL(SITE_URL).origin && url.pathname === `/${expected.slug}/th`;
  } catch {
    return false;
  }
}

async function verifyThreadsPost(mediaId: string, expected: ThreadsPostExpectation): Promise<ThreadsPost> {
  const { accessToken, threadsUserId } = getThreadsCredentials();
  const account = await getThreadsAccount(accessToken);
  if (account.id !== threadsUserId) {
    throw new Error(`Threads account mismatch: configured ${threadsUserId}, token belongs to ${account.id} (@${account.username})`);
  }

  let lastError = 'post did not become visible';
  for (let attempt = 1; attempt <= 6; attempt++) {
    const response = await fetch(
      `https://graph.threads.net/v1.0/${mediaId}?fields=id,permalink,username,text&access_token=${encodeURIComponent(accessToken)}`
    );
    const data = (await response.json()) as { id?: string; permalink?: string; username?: string; text?: string; error?: unknown };
    if (
      response.ok &&
      data.id === mediaId &&
      data.permalink &&
      data.username === account.username &&
      data.text &&
      hasExpectedThreadsPostText(data.text, expected)
    ) {
      return { id: data.id, permalink: data.permalink, username: data.username, text: data.text };
    }
    lastError = JSON.stringify(data.error || data);
    if (attempt < 6) await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`Threads post ${mediaId} could not be verified: ${lastError}`);
}

async function reconcilePendingThreadsPosts(state: SocialState): Promise<void> {
  const pendingSlugs = new Set(state.pendingSlugs);
  const pending = state.history.filter((entry) => (
    entry.platform === 'threads' &&
    entry.postId &&
    (entry.verification === 'pending' || (pendingSlugs.has(entry.slug) && !entry.verification))
  ));
  if (pending.length === 0) return;

  let changed = false;
  for (const entry of pending) {
    try {
      const verified = await verifyThreadsPost(entry.postId!, {
        slug: entry.slug,
        company: entry.company,
        title: entry.title,
        expectedText: entry.expectedText,
      });
      entry.permalink = verified.permalink;
      entry.account = verified.username;
      entry.expectedText = verified.text;
      entry.verification = 'verified';
      changed = true;
      console.log(`Recovered pending Threads post: ${verified.permalink}`);
    } catch (error) {
      if (entry.verification !== 'pending') {
        entry.verification = 'pending';
        changed = true;
      }
      console.warn(`Threads post ${entry.postId} remains pending: ${(error as Error).message}`);
    }
  }
  if (changed) saveState(state);
}

async function postToThreads(text: string, linkAttachment?: string): Promise<string> {
  const { accessToken, threadsUserId } = getThreadsCredentials();
  const account = await getThreadsAccount(accessToken);
  if (account.id !== threadsUserId) {
    throw new Error(`Threads account mismatch: configured ${threadsUserId}, token belongs to ${account.id} (@${account.username})`);
  }

  const urlParams = new URLSearchParams();
  urlParams.append('access_token', accessToken);
  urlParams.append('media_type', 'TEXT');
  urlParams.append('text', text);

  if (linkAttachment) {
    urlParams.append('link_attachment', linkAttachment);
  }

  // Step 1: Create media container (text post with native link attachment)
  const createRes = await fetch(`https://graph.threads.net/v1.0/${threadsUserId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: urlParams.toString(),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Threads container creation failed: ${createRes.status} ${err}`);
  }

  const containerData = (await createRes.json()) as { id?: string };
  const containerId = containerData.id;
  if (!containerId) throw new Error('Threads container creation response did not include an ID');

  // Wait 3 seconds for Meta container processing
  await new Promise((resolve) => setTimeout(resolve, 3000));

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
  if (!mediaId) throw new Error('Threads publish response did not include a media ID');
  return mediaId;
}

// ── Bluesky / AT Protocol ──

async function postToBluesky(
  text: string,
  linkUrl: string,
  ogImageUrl: string,
  company: string,
  title: string,
  description?: string
): Promise<string> {
  const handle = process.env.BLUESKY_HANDLE || 'hashtagweb3.bsky.social';
  const appPassword = process.env.BLUESKY_APP_PASSWORD;

  if (!appPassword) {
    throw new Error('Bluesky credentials missing (BLUESKY_APP_PASSWORD)');
  }

  // 1. Create ATProto session
  const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: handle, password: appPassword }),
  });

  if (!sessionRes.ok) {
    throw new Error(`Bluesky auth failed: ${await sessionRes.text()}`);
  }

  const session = (await sessionRes.json()) as any;
  const { accessJwt, did } = session;

  // 2. Fetch OG image and upload as blob to Bluesky for rich link card thumbnail
  let imageBlob: any = null;
  try {
    const imgRes = await fetch(ogImageUrl);
    if (imgRes.ok) {
      const buffer = await imgRes.arrayBuffer();
      const uploadRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png',
          Authorization: `Bearer ${accessJwt}`,
        },
        body: new Uint8Array(buffer),
      });

      if (uploadRes.ok) {
        const uploadData = (await uploadRes.json()) as any;
        imageBlob = uploadData.blob;
      }
    }
  } catch (err) {
    console.warn('Failed to upload image blob to Bluesky:', (err as Error).message);
  }

  // 3. Parse facets for clickable links in Bluesky
  const facets: any[] = [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const byteStart = new TextEncoder().encode(text.substring(0, match.index)).length;
    const byteEnd = byteStart + new TextEncoder().encode(match[0]).length;
    facets.push({
      index: { byteStart, byteEnd },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: match[0] }],
    });
  }

  // 4. Create post record with interactive external link card
  const record: any = {
    $type: 'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
  };

  if (facets.length > 0) record.facets = facets;

  if (imageBlob) {
    record.embed = {
      $type: 'app.bsky.embed.external',
      external: {
        uri: linkUrl,
        title: `${company} is hiring ${title}`,
        description: description || `Apply now for ${title} at ${company} on Hashtag Web3`,
        thumb: imageBlob,
      },
    };
  }

  const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessJwt}`,
    },
    body: JSON.stringify({
      repo: did,
      collection: 'app.bsky.feed.post',
      record,
    }),
  });

  if (!postRes.ok) {
    throw new Error(`Bluesky post failed: ${await postRes.text()}`);
  }

  const postData = (await postRes.json()) as { uri?: unknown };
  if (typeof postData.uri !== 'string' || !postData.uri.startsWith('at://')) {
    throw new Error(`Bluesky post response did not include a valid URI: ${JSON.stringify(postData)}`);
  }
  return postData.uri;
}

// ── Farcaster / Neynar ──

interface FarcasterCastTarget {
  /** Stable key stored in history.account for idempotent retries. */
  key: string;
  /** Omit for main profile feed; set for channel casts (e.g. jobs → /jobs). */
  channelId?: string;
}

/**
 * Full static set of top Farcaster channels to maximize reach on every job cast.
 * Includes major general Web3, hiring, builder, developer, and ecosystem hubs.
 */
const DEFAULT_FARCASTER_CHANNELS = [
  'jobs',
  'web3',
  'bounties',
  'crypto',
  'dev',
  'developers',
  'build',
  'founders',
  'base',
  'ethereum',
  'solana',
  'defi',
  'ai',
  'product',
  'design',
  'growth',
].join(',');

function parseFarcasterCastTargets(): FarcasterCastTarget[] {
  const targets: FarcasterCastTarget[] = [];
  const postProfile = process.env.FARCASTER_POST_TO_PROFILE !== 'false';
  if (postProfile) {
    targets.push({ key: 'profile' });
  }

  const raw = process.env.FARCASTER_CHANNEL_IDS ?? DEFAULT_FARCASTER_CHANNELS;
  const seen = new Set<string>();

  for (const part of raw.split(',')) {
    const clean = part.trim().toLowerCase().replace(/^\//, '');
    if (!clean) continue;
    const key = `channel:${clean}`;
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push({ key, channelId: clean });
  }

  return targets;
}

function farcasterTargetLabel(target: FarcasterCastTarget): string {
  return target.channelId ? `/${target.channelId}` : 'main profile';
}

function isFarcasterTargetVerified(state: SocialState, slug: string, target: FarcasterCastTarget): boolean {
  for (const entry of state.history) {
    if (entry.slug !== slug || entry.platform !== 'farcaster' || !hasVerifiedPostReceipt(entry)) {
      continue;
    }
    const account = entry.account ?? 'legacy';
    if (account === target.key) return true;
    // Runs before multi-target support: single cast to /jobs only.
    if (account === 'legacy' && target.key === 'channel:jobs') return true;
  }
  return false;
}

function isFarcasterComplete(state: SocialState, slug: string): boolean {
  const targets = parseFarcasterCastTargets();
  if (targets.length === 0) return true;
  return targets.every((target) => isFarcasterTargetVerified(state, slug, target));
}

async function postToFarcaster(
  text: string,
  linkUrl: string,
  channelId?: string,
): Promise<string> {
  const apiKey = process.env.NEYNAR_API_KEY;
  const signerUuid = process.env.FARCASTER_SIGNER_UUID;

  if (!apiKey) {
    throw new Error('Neynar API key missing (NEYNAR_API_KEY)');
  }
  if (!signerUuid) {
    throw new Error('Farcaster Signer UUID missing (FARCASTER_SIGNER_UUID)');
  }

  const payload: any = {
    signer_uuid: signerUuid,
    text,
    embeds: [
      { url: linkUrl },
    ],
  };

  if (channelId) {
    payload.channel_id = channelId;
  }

  const res = await fetch('https://api.neynar.com/v2/farcaster/cast', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Farcaster cast failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { cast?: { hash?: unknown } };
  const castHash = data.cast?.hash;
  if (typeof castHash !== 'string' || !/^0x[0-9a-f]+$/i.test(castHash)) {
    throw new Error(`Farcaster response did not include a valid cast hash: ${JSON.stringify(data)}`);
  }
  return castHash;
}

// ── LinkedIn / Buffer ──

async function postToLinkedInBuffer(
  text: string,
  link?: { url: string; title?: string; description?: string; thumbnail?: string }
): Promise<string> {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  const channelId = process.env.BUFFER_LINKEDIN_CHANNEL_ID || '69c5b139af47dacb695b5feb';

  if (!token) {
    throw new Error('Buffer Access Token missing (BUFFER_ACCESS_TOKEN)');
  }
  if (!channelId) {
    throw new Error('Buffer LinkedIn Channel ID missing (BUFFER_LINKEDIN_CHANNEL_ID)');
  }

  // Pure link post: Buffer passes text containing the link to LinkedIn.
  // An explicit linkAttachment (resolved title/description/thumbnail) makes
  // LinkedIn render the card deterministically instead of depending on its
  // async scraper visiting the URL later (which fails during our deploys and
  // is then cached missing for days).
  const input: any = {
    channelId,
    text,
    schedulingType: 'automatic',
    mode: 'shareNow',
  };
  if (link && link.url) {
    input.metadata = {
      linkedin: {
        linkAttachment: {
          url: link.url,
          ...(link.title ? { title: link.title } : {}),
          ...(link.description ? { description: link.description } : {}),
          ...(link.thumbnail ? { thumbnail: { url: link.thumbnail } } : {}),
        },
      },
    };
  }

  const query = `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post {
            id
          }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;

  const res = await fetch('https://api.buffer.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables: { input } }),
  });

  const data = await res.json();
  if (data.errors) {
    throw new Error(`Buffer GraphQL error: ${JSON.stringify(data.errors)}`);
  }

  const result = data.data?.createPost;
  if (result?.post?.id) {
    return result.post.id;
  }
  throw new Error(`Buffer post creation failed: ${result?.message || 'unknown error'}`);
}

const LINKEDIN_BOT_UA = 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient)';

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

/** Normalize titles so em/en dashes and whitespace do not fail OG readiness. */
function normalizeTitleForCompare(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-') // dashes → hyphen
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const SITE_TITLE_SUFFIX = ' | hashtag web3';

/** Match preview shells and Next.js metadata (root layout may append site name). */
function jobPreviewTitleMatches(resolvedTitle: string, title: string, company: string): boolean {
  const expected = normalizeTitleForCompare(`${title} at ${company}`);
  const normalized = normalizeTitleForCompare(resolvedTitle);
  if (normalized === expected) return true;
  if (normalized.endsWith(SITE_TITLE_SUFFIX)) {
    return normalized.slice(0, -SITE_TITLE_SUFFIX.length).trimEnd() === expected;
  }
  return false;
}

export interface LinkedInPreview {
  title: string;
  description: string;
  image: string;
}

// Readiness gate: fetch the exact suffix URL and assert that it resolves to
// this job's metadata and a direct, non-redirected image. A generic fallback
// or a page from an older deployment must never be handed to a social API.
async function verifySocialServing(
  slug: string,
  company: string,
  title: string,
  suffix: string,
  userAgent: string,
): Promise<LinkedInPreview | null> {
  const pageUrl = buildSocialShareUrl(slug, suffix);
  try {
    const res = await fetch(pageUrl, {
      cache: 'no-store',
      headers: { 'User-Agent': userAgent },
    });
    if (res.status !== 200) {
      console.error(`Preview readiness: page HTTP ${res.status} for ${pageUrl} — aborting publish`);
      return null;
    }
    const html = await res.text();
    if (html.length > 150000) {
      console.error(`Preview readiness: page ${html.length}b exceeds crawler comfort zone — aborting publish`);
      return null;
    }
    const titleMatch = html.match(/<meta property="og:title"[^>]+content="([^"]{10,})"/);
    if (!titleMatch) {
      console.error('Preview readiness: og:title missing/empty — aborting publish');
      return null;
    }
    const resolvedTitle = decodeEntities(titleMatch[1]);
    if (!jobPreviewTitleMatches(resolvedTitle, title, company)) {
      console.error(`Preview readiness: wrong og:title "${resolvedTitle}" for ${pageUrl} — aborting publish`);
      return null;
    }
    const m = html.match(/<meta property="og:image"[^>]+content="([^"]+)"/);
    if (!m) {
      console.error('Preview readiness: og:image missing — aborting publish');
      return null;
    }
    const image = m[1].replace(/&amp;/g, '&');
    const imageUrl = new URL(image, SITE_URL);
    // Per-job PNGs from build: /og/jobs/{slug}.png (no request-time /api/og).
    const isJobOg =
      imageUrl.origin === SITE_URL &&
      (/^\/og\/jobs\/[^/]+\.png$/.test(imageUrl.pathname) ||
        imageUrl.pathname === '/og-image-jobs.png');
    if (!isJobOg) {
      console.error(`Preview readiness: og:image is not a job OG asset for ${company}/${title} — aborting publish`);
      return null;
    }
    const imgRes = await fetch(imageUrl, {
      cache: 'no-store',
      redirect: 'manual',
      headers: { 'User-Agent': userAgent },
    });
    const ct = imgRes.headers.get('content-type') || '';
    const imageBytes = await imgRes.arrayBuffer();
    if (!imgRes.ok || !ct.startsWith('image/') || imageBytes.byteLength < 1000) {
      console.error(`Preview readiness: image HTTP ${imgRes.status} ${ct} ${imageBytes.byteLength}b — aborting publish`);
      return null;
    }
    const descMatch = html.match(/<meta property="og:description"[^>]+content="([^"]+)"/);
    const preview = {
      title: resolvedTitle.slice(0, 200),
      description: decodeEntities(descMatch ? descMatch[1] : '').slice(0, 300),
      image,
    };
    console.log(`Preview readiness: ${suffix} page 200 (${html.length}b) + exact OG image ${imgRes.status} ${ct} — servable`);
    return preview;
  } catch (err) {
    console.error('Preview readiness check failed:', (err as Error).message, '— aborting publish');
    return null;
  }
}

// ── Facebook Page (Meta Graph API) ──

function getFacebookPageCredentials() {
  const pageId = process.env.META_PAGE_ID || process.env.FACEBOOK_PAGE_ID;
  const pageToken = process.env.META_PAGE_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId) {
    throw new Error('Facebook Page ID missing (META_PAGE_ID or FACEBOOK_PAGE_ID)');
  }
  if (!pageToken) {
    throw new Error('Facebook Page Access Token missing (META_PAGE_TOKEN or FACEBOOK_PAGE_ACCESS_TOKEN)');
  }

  return { pageId, pageToken };
}

function hasExpectedJobOgImage(imageUrl: string, expectedImageUrl: string): boolean {
  const actual = new URL(imageUrl, SITE_URL);
  const expected = new URL(expectedImageUrl, SITE_URL);
  if (actual.origin !== expected.origin || actual.pathname !== expected.pathname) return false;

  return ['type', 'v', 'title', 'company', 'location', 'department', 'logo'].every(
    (key) => actual.searchParams.get(key) === expected.searchParams.get(key)
  );
}

async function refreshFacebookPreview(linkUrl: string, expectedPreview: LinkedInPreview): Promise<void> {
  const { pageId, pageToken } = getFacebookPageCredentials();
  const accountRes = await fetch(
    `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${encodeURIComponent(pageToken)}`
  );
  const account = (await accountRes.json()) as { id?: string; name?: string; error?: unknown };
  if (!accountRes.ok || account.id !== pageId) {
    throw new Error(`Facebook Page token mismatch: ${JSON.stringify(account.error || account)}`);
  }

  const params = new URLSearchParams({ id: linkUrl, scrape: 'true', access_token: pageToken });
  const scrapeRes = await fetch('https://graph.facebook.com/v21.0/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const scrape = (await scrapeRes.json()) as { title?: string; image?: Array<{ url?: string }>; error?: unknown };
  const image = scrape.image?.[0]?.url;
  if (!scrapeRes.ok || scrape.title !== expectedPreview.title || !image || !hasExpectedJobOgImage(image, expectedPreview.image)) {
    throw new Error(`Facebook scraper returned incorrect metadata: ${JSON.stringify(scrape.error || scrape)}`);
  }

  console.log(`Facebook scraper verified @${account.name || pageId}: ${scrape.title}`);
}

async function postToFacebook(text: string, linkUrl?: string): Promise<string> {
  const { pageId, pageToken } = getFacebookPageCredentials();

  // Publish to Page feed with link attachment so Facebook crawler fetches og:image
  const endpoint = `https://graph.facebook.com/v21.0/${pageId}/feed`;

  const params = new URLSearchParams();
  params.append('access_token', pageToken);
  params.append('message', text);
  if (linkUrl) {
    params.append('link', linkUrl);
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    body: params,
  });

  const data = (await res.json()) as { id?: unknown; post_id?: unknown; error?: unknown };
  if (!res.ok || data.error) {
    throw new Error(`Facebook API error: ${JSON.stringify(data.error || data)}`);
  }

  const postId = data.id || data.post_id;
  if (typeof postId !== 'string' || postId.trim().length === 0) {
    throw new Error(`Facebook API response did not include a post ID: ${JSON.stringify(data)}`);
  }
  return postId;
}

// ── Instagram Media / Carousel (Meta Graph API v21.0) ──

async function waitForInstagramContainer(
  containerId: string,
  pageToken: string,
  maxAttempts = 15,
  intervalMs = 3000
): Promise<void> {
  console.log(`[Instagram] Waiting for container ${containerId} to finish processing...`);
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    const checkRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code,status&access_token=${pageToken}`
    );
    const checkData = (await checkRes.json()) as { status_code?: string; status?: string; error?: any };

    if (!checkRes.ok || checkData.error) {
      console.warn(
        `[Instagram] Status check attempt ${attempt}/${maxAttempts} warning: ${JSON.stringify(checkData.error || checkData)}`
      );
      continue;
    }

    const statusCode = checkData.status_code;
    if (statusCode === 'FINISHED') {
      console.log(`✓ [Instagram] Container ${containerId} is ready (status: FINISHED)`);
      return;
    }

    if (statusCode === 'ERROR') {
      throw new Error(`Instagram container ${containerId} processing failed: ${JSON.stringify(checkData)}`);
    }

    if (statusCode === 'EXPIRED') {
      throw new Error(`Instagram container ${containerId} expired.`);
    }

    console.log(`[Instagram] Container ${containerId} status: ${statusCode || 'IN_PROGRESS'} (${attempt}/${maxAttempts})...`);
  }

  throw new Error(`Instagram container ${containerId} processing timed out after ${maxAttempts * (intervalMs / 1000)} seconds.`);
}

async function publishInstagramContainer(
  igAccountId: string,
  containerId: string,
  pageToken: string,
  maxAttempts = 3
): Promise<string> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const publishRes = await fetch(`https://graph.facebook.com/v21.0/${igAccountId}/media_publish`, {
      method: 'POST',
      body: new URLSearchParams({
        access_token: pageToken,
        creation_id: containerId,
      }),
    });
    const publishData = (await publishRes.json()) as { id?: string; error?: any };

    if (publishRes.ok && publishData.id && !publishData.error) {
      return publishData.id;
    }

    // If Meta still says media is not ready (subcode 2207027), wait and retry
    if (attempt < maxAttempts && publishData.error?.error_subcode === 2207027) {
      console.warn(`[Instagram] Media not ready on publish attempt ${attempt}/${maxAttempts}, retrying in 5s...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }

    throw new Error(`Instagram publish failed: ${JSON.stringify(publishData.error || publishData)}`);
  }
  throw new Error(`Instagram publish failed for container ${containerId}`);
}

async function postToInstagram(
  caption: string,
  imageUrls: string[],
  igAccountId: string = process.env.INSTAGRAM_ACCOUNT_ID || '17841473830256790'
): Promise<string> {
  const pageToken = process.env.META_PAGE_TOKEN;

  if (!pageToken) {
    throw new Error('Meta Page Token missing (META_PAGE_TOKEN)');
  }
  if (!igAccountId) {
    throw new Error('Instagram Account ID missing (INSTAGRAM_ACCOUNT_ID)');
  }

  if (imageUrls.length === 1) {
    // Single image container
    const containerRes = await fetch(`https://graph.facebook.com/v21.0/${igAccountId}/media`, {
      method: 'POST',
      body: new URLSearchParams({
        access_token: pageToken,
        image_url: imageUrls[0],
        caption,
      }),
    });
    const containerData = (await containerRes.json()) as { id?: string; error?: any };
    if (!containerRes.ok || containerData.error || !containerData.id) {
      throw new Error(`Instagram container creation failed: ${JSON.stringify(containerData.error || containerData)}`);
    }

    // Wait for Meta to finish downloading and processing media
    await waitForInstagramContainer(containerData.id, pageToken);

    // Publish container with retry fallback
    return await publishInstagramContainer(igAccountId, containerData.id, pageToken);
  } else {
    // Multi-image carousel container
    const childIds: string[] = [];
    for (const url of imageUrls) {
      const childRes = await fetch(`https://graph.facebook.com/v21.0/${igAccountId}/media`, {
        method: 'POST',
        body: new URLSearchParams({
          access_token: pageToken,
          image_url: url,
          is_carousel_item: 'true',
        }),
      });
      const childData = (await childRes.json()) as { id?: string; error?: any };
      if (!childRes.ok || childData.error || !childData.id) {
        throw new Error(`Instagram carousel child creation failed: ${JSON.stringify(childData.error || childData)}`);
      }
      childIds.push(childData.id);
    }

    // Wait for all carousel items to be ready
    for (const childId of childIds) {
      await waitForInstagramContainer(childId, pageToken);
    }

    // Create Carousel parent container
    const carouselRes = await fetch(`https://graph.facebook.com/v21.0/${igAccountId}/media`, {
      method: 'POST',
      body: new URLSearchParams({
        access_token: pageToken,
        media_type: 'CAROUSEL',
        children: childIds.join(','),
        caption,
      }),
    });
    const carouselData = (await carouselRes.json()) as { id?: string; error?: any };
    if (!carouselRes.ok || carouselData.error || !carouselData.id) {
      throw new Error(`Instagram carousel parent creation failed: ${JSON.stringify(carouselData.error || carouselData)}`);
    }

    // Wait for carousel parent container to be ready
    await waitForInstagramContainer(carouselData.id, pageToken);

    // Publish carousel
    return await publishInstagramContainer(igAccountId, carouselData.id, pageToken);
  }
}

// ── Deploy-quiet gate ──

// Social crawlers scrape new post URLs within minutes of publishing. If an
// A production deploy is in flight (Cloudflare Worker / legacy App Hosting), the
// scrape fails and the miss is cached for days — the #1 observed cause of
// cardless posts. So before publishing, wait for any in-flight production
// rollout to finish. If the status API is unavailable or the rollout takes
// too long, continue to the exact preview check below; that check can rotate
// to another job instead of terminating the posting run.
async function waitForQuietDeploy(): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY || 'vedangvatsa/Web3-Jobs';
  if (!token) {
    console.log('Deploy gate: no GITHUB_TOKEN, skipping rollout check.');
    return;
  }
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const deadline = Date.now() + 15 * 60 * 1000;
  for (;;) {
    try {
      const headRes = await fetch(`https://api.github.com/repos/${repo}/commits/main`, { headers });
      if (!headRes.ok) throw new Error(`commits API HTTP ${headRes.status}`);
      const headSha = ((await headRes.json()) as any)?.sha;
      if (!headSha) throw new Error('no HEAD sha');
      const checksRes = await fetch(`https://api.github.com/repos/${repo}/commits/${headSha}/check-runs`, { headers });
      if (!checksRes.ok) throw new Error(`check-runs API HTTP ${checksRes.status}`);
      const runs = (((await checksRes.json()) as any)?.check_runs || []) as Array<{ name: string; status: string }>;
      const busy = runs.some(
        (r) =>
          (/deploy cloudflare worker/i.test(r.name) || /app hosting/i.test(r.name)) &&
          (r.status === 'in_progress' || r.status === 'queued')
      );
      if (!busy) {
        console.log('Deploy gate: no production deploy in flight — prod stable, publishing.');
        return;
      }
      if (Date.now() >= deadline) {
        console.warn('Deploy gate: deploy still in flight after 15 min — proceeding to candidate preview checks.');
        return;
      }
      console.log('Deploy gate: production deploy in flight — waiting 60s before publishing...');
      await new Promise((r) => setTimeout(r, 60000));
    } catch (err) {
      console.warn(`Deploy gate check failed: ${(err as Error).message} — proceeding to candidate preview checks.`);
      return;
    }
  }
}

const PREVIEW_TARGETS = [
  { platform: 'x', suffix: 'x', userAgent: 'Twitterbot/1.0' },
  { platform: 'threads', suffix: 'th', userAgent: 'Meta-ExternalAgent/1.1' },
  { platform: 'bluesky', suffix: 'bsky', userAgent: 'Bluesky/1.0' },
  { platform: 'farcaster', suffix: 'fc', userAgent: 'Warpcast/1.0' },
  { platform: 'linkedin', suffix: 'li', userAgent: LINKEDIN_BOT_UA },
  { platform: 'facebook', suffix: 'fb', userAgent: 'facebookexternalhit/1.1' },
] as const;

// ── Main Scheduling & Selection ──

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const platformIdx = args.indexOf('--platform');
  const platform = platformIdx !== -1 ? args[platformIdx + 1]?.toLowerCase() || 'all' : 'all';
  const slugIdx = args.indexOf('--slug');
  const targetSlug = slugIdx !== -1 ? args[slugIdx + 1] : null;

  if (platform !== 'all' && platform !== 'both' && !isSocialPlatform(platform)) {
    throw new Error(`Unsupported social platform: ${platform}`);
  }
  const requestedPlatforms: readonly SocialPlatform[] = platform === 'all' || platform === 'both'
    ? SOCIAL_PLATFORMS
    : [platform];

  console.log(`\n========================================`);
  console.log(` Social Job Poster [${isDryRun ? 'DRY RUN' : 'LIVE'}]`);
  console.log(` Target Platform: ${platform.toUpperCase()}`);
  console.log(`========================================\n`);

  const jobs = loadJobs();
  const state = loadState();
  if (!isDryRun) {
    if (requestedPlatforms.includes('x')) await reconcilePendingXPosts(state);
    await reconcilePendingThreadsPosts(state);
    if (reconcileCompletedPendingSlugs(state)) saveState(state);
  }

  const postedSet = new Set(state.postedSlugs);

  // Find next unposted job
  let selectedJob: Job | null = null;

  if (targetSlug) {
    selectedJob = jobs.find((j) => j.slug === targetSlug) || null;
    if (!selectedJob) {
      console.error(`Requested job slug "${targetSlug}" not found in cache.`);
      process.exit(1);
    }
  } else if (platform === 'all' || platform === 'both') {
    // Full rotation runs should keep LinkedIn and other link-card feeds moving.
    // Pending retries (often X-only backlog) must not starve new job posts.
    selectedJob = pickNextUnpostedJob(jobs, state, postedSet);
    if (selectedJob) {
      console.log(`Selected new job for social rotation: ${selectedJob.company} / ${selectedJob.title}.`);
    } else {
      const pendingLinkCards = findPendingJob(state, jobs, requestedPlatforms, 'link-cards');
      if (pendingLinkCards) {
        selectedJob = pendingLinkCards;
        console.log(`Retrying incomplete link-card publish for ${selectedJob.company} / ${selectedJob.title}.`);
      }
    }

    if (!selectedJob) {
      const pendingInstagram = findPendingJob(state, jobs, requestedPlatforms, 'instagram-only');
      if (pendingInstagram) {
        selectedJob = pendingInstagram;
        console.log(`Retrying Instagram backlog for ${selectedJob.company} / ${selectedJob.title}.`);
      }
    }

    if (!selectedJob) {
      console.log('All jobs have been posted. Resetting cycle history...');
      state.postedSlugs = [];
      selectedJob = jobs[0];
      state.lastIndex = 1;
    }
  } else {
    const pendingLinkCards = findPendingJob(state, jobs, requestedPlatforms, 'link-cards');
    if (pendingLinkCards) {
      selectedJob = pendingLinkCards;
      console.log(`Retrying incomplete link-card publish for ${selectedJob.company} / ${selectedJob.title}.`);
    } else {
      selectedJob = pickNextUnpostedJob(jobs, state, postedSet);
      if (selectedJob) {
        console.log(`Selected new job for social rotation: ${selectedJob.company} / ${selectedJob.title}.`);
      }
    }

    if (!selectedJob) {
      const pendingInstagram = findPendingJob(state, jobs, requestedPlatforms, 'instagram-only');
      if (pendingInstagram) {
        selectedJob = pendingInstagram;
        console.log(`Retrying Instagram backlog for ${selectedJob.company} / ${selectedJob.title}.`);
      }
    }

    if (!selectedJob) {
      console.log('All jobs have been posted. Resetting cycle history...');
      state.postedSlugs = [];
      selectedJob = jobs[0];
      state.lastIndex = 1;
    }
  }

  // Rotation picker reused for catch-up rounds: next unposted job whose
  // company differs from `excludeCompany`, advancing state.lastIndex.
  const pickNextJob = (excludeCompany: string, excludeSlug: string, excludedSlugs = new Set<string>()): Job | null => {
    const totalJobs = jobs.length;
    const posted = new Set(state.postedSlugs);
    posted.add(excludeSlug);
    for (let i = 0; i < totalJobs; i++) {
      const idx = (state.lastIndex + i) % totalJobs;
      const candidate = jobs[idx];
      if (
        isFreshRotationJob(state, candidate.slug, posted) &&
        !excludedSlugs.has(candidate.slug) &&
        candidate.company.toLowerCase() !== excludeCompany
      ) {
        state.lastIndex = (idx + 1) % totalJobs;
        return candidate;
      }
    }
    for (let i = 0; i < totalJobs; i++) {
      const idx = (state.lastIndex + i) % totalJobs;
      const candidate = jobs[idx];
      if (isFreshRotationJob(state, candidate.slug, posted) && !excludedSlugs.has(candidate.slug)) {
        state.lastIndex = (idx + 1) % totalJobs;
        return candidate;
      }
    }
    return null;
  };

  // Each full run posts two different jobs (6/day across the 3 scheduled runs).
  // A chosen slug or a single platform stays at one job.
  const catchUpArmed = !targetSlug && (platform === 'all' || platform === 'both');
  if (catchUpArmed) {
    console.log('Second job armed: each network posts two openings on its own.');
  }

  const jobsToPost: Job[] = [selectedJob as Job];
  const rejectedPreviewSlugs = new Set<string>();
  for (let round = 0; round < jobsToPost.length; round++) {
    const currentJob = jobsToPost[round];
    const { company, title, slug, location } = currentJob;
    const shouldPostAll = platform === 'all' || platform === 'both';

    // Build OG image URL, passing the verified local logo when one exists so
    // the card uses high-res art. PNG twin is preferred because Satori embeds
    // it consistently across cold and warm renders.
    const ogImageUrl = buildJobOgImageUrl(currentJob);
    const igImageUrl = buildJobInstagramImageUrl(currentJob);

    // Formats strictly adhering to:
    //   Company is hiring role
    //
    //   URL/<platform>
    const xUrl = buildSocialShareUrl(slug, 'x');
    const threadsUrl = buildSocialShareUrl(slug, 'th');
    const blueskyUrl = buildSocialShareUrl(slug, 'bsky');
    const farcasterUrl = buildSocialShareUrl(slug, 'fc');
    const linkedinUrl = buildSocialShareUrl(slug, 'li');
    const facebookUrl = buildSocialShareUrl(slug, 'fb');

  const xPostText = `${company} is hiring ${title}\n\n${xUrl}`;
  const threadsPostText = `${company} is hiring ${title}: ${threadsUrl}`;
  const blueskyPostText = `${company} is hiring ${title}: ${blueskyUrl}`;
  const farcasterPostText = `${company} is hiring ${title}\n\n${farcasterUrl}`;
  const linkedinPostText = `${company} is hiring ${title}: ${linkedinUrl}`;
  const facebookPostText = `${company} is hiring ${title}: ${facebookUrl}`;

  console.log(`Selected Job:`);
  console.log(`  Company : ${company}`);
  console.log(`  Role    : ${title}`);
  console.log(`  Slug    : ${slug}`);
  console.log(`  OG Image: ${ogImageUrl}`);
  console.log(`  IG Image: ${igImageUrl}\n`);

  // Do this before warming or publishing. The state commit is deliberately
  // delayed until after publishing, so this run must not begin during a
  // rollout that could serve mixed metadata to social crawlers.
  if (!isDryRun) {
    await waitForQuietDeploy();
  }

  // Verify OG Image responds with 200
  try {
    const ogCheck = await fetch(ogImageUrl, { method: 'HEAD' });
    console.log(`OG Image Health Check: HTTP ${ogCheck.status} (${ogCheck.headers.get('content-type') || 'unknown'})`);
  } catch (err) {
    console.warn(`Warning: OG Image check encountered error:`, (err as Error).message);
  }

  // Warm the OG image so Meta's fetchers hit a hot CDN asset (IG reuses the same URL).
  for (const warmUrl of [ogImageUrl, igImageUrl]) {
    try {
      const warmRes = await fetch(warmUrl);
      await warmRes.arrayBuffer();
      console.log(`OG Image Warm-up: HTTP ${warmRes.status} (${warmUrl.slice(-14)})`);
    } catch (err) {
      console.warn(`Warning: OG warm-up failed:`, (err as Error).message);
    }
  }

  console.log(`\n--- Preview: X @${BUFFER_X_ACCOUNT} via Buffer (${process.env.BUFFER_X_CHANNEL_ID || BUFFER_X_CHANNEL_ID}) ---`);
  console.log(xPostText);
  console.log(`---------------------------------`);

  console.log(`\n--- Preview: Threads Post ---`);
  console.log(threadsPostText);
  console.log(`-----------------------------`);

  console.log(`\n--- Preview: Bluesky Post ---`);
  console.log(blueskyPostText);
  console.log(`-----------------------------`);

  const farcasterTargets = parseFarcasterCastTargets();
  console.log(
    `\n--- Preview: Farcaster (${farcasterTargets.map(farcasterTargetLabel).join(', ') || 'no targets'}) ---`,
  );
  console.log(farcasterPostText);
  console.log(`-----------------------------------------------`);

  console.log(`\n--- Preview: LinkedIn Post (Company Page via Buffer) ---`);
  console.log(linkedinPostText);
  console.log(`--------------------------------------------------------`);

  console.log(`\n--- Preview: Facebook Page Post (Meta Graph API) ---`);
  console.log(facebookPostText);
  console.log(`----------------------------------------------------\n`);

  if (isDryRun) {
    console.log('DRY RUN active: No external network requests were made to X, Threads, Bluesky, Farcaster, LinkedIn, Facebook, or Instagram.');
    return;
  }

  // Check each network's card on its own. A bad preview skips that
  // network only; the others still publish this job.
   const alreadyPublished = verifiedPlatformsForSlug(state, slug);
   const pendingPlatforms = new Set(
     state.history
       .filter((entry) => entry.slug === slug && entry.verification === 'pending')
       .map((entry) => entry.platform)
   );
   const blockedThisRound = new Set<SocialPlatform>();
    const shouldPublishPlatform = (name: SocialPlatform) => {
      if (!(platform === name || shouldPostAll)) return false;
      if (blockedThisRound.has(name)) return false;
      if (pendingPlatforms.has(name)) return false;
      return force || !alreadyPublished.has(name);
    };
   const previewTargets = PREVIEW_TARGETS.filter((target) =>
     shouldPublishPlatform(target.platform as SocialPlatform)
   );
  const verifiedPreviews = new Map<string, LinkedInPreview>();
  for (const target of previewTargets) {
    const preview = await verifySocialServing(slug, company, title, target.suffix, target.userAgent);
    if (!preview) {
      blockedThisRound.add(target.platform as SocialPlatform);
      console.warn(`Preview readiness failed for ${company} / ${title} on ${target.platform}. Skipping that network only.`);
      continue;
    }
    verifiedPreviews.set(target.platform, preview);
  }
   if (!requestedPlatforms.some(shouldPublishPlatform)) {
    if (targetSlug) {
      throw new Error(`Preview readiness failed for explicitly requested job ${slug}; no replacement post was created.`);
    }
    rejectedPreviewSlugs.add(slug);
    const excludedSlugs = new Set([
      ...rejectedPreviewSlugs,
      ...jobsToPost.map((job) => job.slug),
    ]);
    const replacement = pickNextJob(company.toLowerCase(), slug, excludedSlugs);
    if (!replacement) {
      throw new Error('No alternate job produced a correct preview; no incorrect post was published.');
    }
    console.warn(`Preview fallback: replacing ${slug} with ${replacement.slug} (${replacement.company} / ${replacement.title}).`);
    jobsToPost.splice(round, 1, replacement);
    round -= 1;
    continue;
  }

   if (requestedPlatforms.some(shouldPublishPlatform) && markSlugPending(state, slug)) {
     saveState(state);
   }

  const now = new Date().toISOString();

  let postedSuccessCount = 0;
  const attemptedPlatforms = new Set<SocialPlatform>();
  const newlyVerifiedPlatforms = new Set<SocialPlatform>();

   if (shouldPublishPlatform('x')) {
    attemptedPlatforms.add('x');
    try {
      console.log(`Publishing to X @${BUFFER_X_ACCOUNT} via Buffer...`);
      const buffer = xBufferClient();
      const bufferPostId = await buffer.create(xPostText);
      const entry: SocialHistoryEntry = {
        slug,
        company,
        title,
        platform: 'x',
        postedAt: now,
        postId: bufferPostId,
        provider: 'buffer',
        account: BUFFER_X_ACCOUNT,
        expectedText: xPostText,
        verification: 'pending',
      };
      state.history.push(entry);
      saveState(state);
      entry.permalink = await buffer.verify(bufferPostId, xPostText);
      entry.verification = 'verified';
      saveState(state);
      console.log(`✓ Published to X via Buffer: ${entry.permalink}`);
      newlyVerifiedPlatforms.add('x');
      postedSuccessCount++;
    } catch (err) {
      const message = (err as Error).message;
      console.error(`✗ Failed to post to X:`, message);
    }
  }

   if (shouldPublishPlatform('threads')) {
    attemptedPlatforms.add('threads');
    try {
      console.log('Publishing to Threads (with link attachment preview)...');
      const threadsId = await postToThreads(threadsPostText, threadsUrl);
       const threadsEntry: SocialHistoryEntry = {
         slug,
         company,
         title,
         platform: 'threads',
          postedAt: now,
          postId: threadsId,
          verification: 'pending',
          expectedText: threadsPostText,
       };
       // Persist this receipt before verification so a transient Graph read
       // failure can be reconciled later without duplicating the Threads post.
       state.history.push(threadsEntry);
       saveState(state);
        const verified = await verifyThreadsPost(threadsId, {
          slug,
          company,
          title,
          expectedText: threadsPostText,
        });
       threadsEntry.permalink = verified.permalink;
       threadsEntry.account = verified.username;
        threadsEntry.verification = 'verified';
        saveState(state);
        console.log(`✓ Successfully published to Threads! ${verified.permalink}`);
        newlyVerifiedPlatforms.add('threads');
        postedSuccessCount++;
    } catch (err) {
      console.error(`✗ Failed to post to Threads:`, (err as Error).message);
    }
  }

   if (shouldPublishPlatform('bluesky')) {
    attemptedPlatforms.add('bluesky');
    try {
      console.log('Publishing to Bluesky...');
      const metaDesc = buildUniqueJobMetaDescription(currentJob as any);
      const bskyUri = await postToBluesky(blueskyPostText, blueskyUrl, ogImageUrl, company, title, metaDesc);
      console.log(`✓ Successfully published to Bluesky! Post URI: ${bskyUri}`);
      recordVerifiedPost(state, {
        slug,
        company,
        title,
        platform: 'bluesky',
        postedAt: now,
        postId: bskyUri,
      });
      newlyVerifiedPlatforms.add('bluesky');
      postedSuccessCount++;
    } catch (err) {
      console.error(`✗ Failed to post to Bluesky:`, (err as Error).message);
    }
  }

   if (shouldPublishPlatform('farcaster')) {
    attemptedPlatforms.add('farcaster');
    const targets = parseFarcasterCastTargets();
    if (targets.length === 0) {
      console.warn('✗ Farcaster skipped: no targets configured (set FARCASTER_CHANNEL_IDS and/or FARCASTER_POST_TO_PROFILE).');
    } else {
      let farcasterFailures = 0;
      for (const target of targets) {
        if (!force && isFarcasterTargetVerified(state, slug, target)) {
          console.log(`Farcaster ${farcasterTargetLabel(target)} already verified for ${slug}, skipping.`);
          continue;
        }
        try {
          console.log(`Publishing to Farcaster (${farcasterTargetLabel(target)})...`);
          const castHash = await postToFarcaster(farcasterPostText, farcasterUrl, target.channelId);
          console.log(`✓ Farcaster ${farcasterTargetLabel(target)} cast hash: ${castHash}`);
          recordVerifiedPost(state, {
            slug,
            company,
            title,
            platform: 'farcaster',
            postedAt: now,
            postId: castHash,
            account: target.key,
          });
          postedSuccessCount++;
        } catch (err) {
          farcasterFailures++;
          console.error(
            `✗ Failed to post to Farcaster (${farcasterTargetLabel(target)}):`,
            (err as Error).message,
          );
        }
      }
      if (isFarcasterComplete(state, slug)) {
        newlyVerifiedPlatforms.add('farcaster');
      } else if (farcasterFailures > 0) {
        console.warn('Farcaster incomplete: some targets failed or were skipped; will retry missing targets on next run.');
      }
    }
  }

   if (shouldPublishPlatform('linkedin')) {
    attemptedPlatforms.add('linkedin');
    try {
      console.log('Publishing to LinkedIn (Hashtag Web3 Company Page via Buffer link preview)...');
      const preview = verifiedPreviews.get('linkedin') || null;
      if (!preview) {
        console.error('✗ LinkedIn publish skipped by readiness gate (see above). Not marking as posted.');
      } else {
        const bufferPostId = await postToLinkedInBuffer(linkedinPostText, {
          url: linkedinUrl,
          title: preview.title,
          description: preview.description || undefined,
          thumbnail: preview.image,
        });
        console.log(`✓ Successfully published to LinkedIn! Buffer Post ID: ${bufferPostId}`);
        recordVerifiedPost(state, {
          slug,
          company,
          title,
          platform: 'linkedin',
          postedAt: now,
          postId: bufferPostId,
        });
        newlyVerifiedPlatforms.add('linkedin');
        postedSuccessCount++;
      }
    } catch (err) {
      console.error(`✗ Failed to post to LinkedIn:`, (err as Error).message);
    }
  }

   if (shouldPublishPlatform('facebook')) {
    attemptedPlatforms.add('facebook');
    try {
      console.log('Publishing to Facebook Page (Meta Graph API link feed)...');
       const preview = verifiedPreviews.get('facebook');
       if (!preview) throw new Error('Facebook publish skipped because its preview was not verified');
       await refreshFacebookPreview(facebookUrl, preview);
       const fbPostId = await postToFacebook(facebookPostText, facebookUrl);
      console.log(`✓ Successfully published to Facebook! Post ID: ${fbPostId}`);
      recordVerifiedPost(state, {
        slug,
        company,
        title,
        platform: 'facebook',
        postedAt: now,
        postId: fbPostId,
      });
      newlyVerifiedPlatforms.add('facebook');
      postedSuccessCount++;
    } catch (err) {
      console.error(`✗ Failed to post to Facebook:`, (err as Error).message);
    }
  }

   if (shouldPublishPlatform('instagram')) {
    attemptedPlatforms.add('instagram');
    try {
      const TAGLINES = [
        'Subscribed by 60k+ Web3 builders and professionals.',
        'The Web3 career and event resource platform.',
        'Read by founders, core devs, and protocol researchers.',
        'Verified Web3 jobs, guides, and ecosystem tools.',
        'Updated daily with active blockchain openings and guides.',
        'The leading open resource for Web3 talent.',
      ];
      const activeTagline = TAGLINES[state.history.length % TAGLINES.length];
      const igCaption = `${company} is hiring ${title} (${location || 'Remote'}).\n\nWeb3 jobs: hashtagweb3.com\n\n${activeTagline}\n\n#web3 #web3jobs #hashtagweb3`;
      const igPostId = await postToInstagram(igCaption, [igImageUrl]);
       console.log(`✓ Successfully published Instagram image post! Post ID: ${igPostId}`);
      recordVerifiedPost(state, {
        slug,
        company,
        title,
        platform: 'instagram',
        postedAt: now,
        postId: igPostId,
      });
      newlyVerifiedPlatforms.add('instagram');
      postedSuccessCount++;
    } catch (err) {
      console.error(`✗ Failed to post to Instagram:`, (err as Error).message);
    }
  }

   const verifiedPlatforms = verifiedPlatformsForSlug(state, slug);
   const allPlatformsSucceeded = SOCIAL_PLATFORMS.every((name) => verifiedPlatforms.has(name));

   const completionChanged = allPlatformsSucceeded && markSlugComplete(state, slug);

   if (postedSuccessCount > 0 || completionChanged) {
      saveState(state);
      console.log(`\nState saved (${postedSuccessCount} platforms newly verified${allPlatformsSucceeded ? '; all platforms complete' : ''}). Done.`);
   } else {
     console.warn(`\nNo new platform succeeded for ${slug}. State remains incomplete and will retry missing platforms.`);
  }

   const missingPlatforms = requestedPlatforms.filter((name) => {
     return force && attemptedPlatforms.has(name)
       ? !newlyVerifiedPlatforms.has(name)
       : !verifiedPlatforms.has(name);
   });
   if (missingPlatforms.length > 0) {
     if (postedSuccessCount === 0) {
       throw new Error(`Incomplete social publish for ${slug}; awaiting verified posts on: ${missingPlatforms.join(', ')}`);
     }
     console.warn(
       `Partial publish for ${slug}; still missing ${missingPlatforms.join(', ')} but ${postedSuccessCount} platform(s) succeeded this run.`,
     );
   }

    // A second, different-company job. Any network that posted the first
    // opening posts this one too. Networks that failed stay on the first.
    if (
      round === 0 &&
      jobsToPost.length === 1 &&
      catchUpArmed &&
      postedSuccessCount > 0
    ) {
      const next = pickNextJob(typeof company === 'string' ? company.toLowerCase() : '', slug);
      if (next) {
        console.log(`\nCatch-up: queueing second job (${next.company} / ${next.title}).`);
        jobsToPost.push(next);
      }
    }
  }
}

main().catch((err) => {
  console.error('Fatal error in social job poster:', err);
  process.exit(1);
});
