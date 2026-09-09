#!/usr/bin/env npx tsx
/**
 * Automated Social Job Opening Poster (X, Threads, Bluesky, Farcaster, LinkedIn, Facebook, Reddit & Instagram)
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
 *   https://hashtagweb3.com/<slug>/x      (for X)
 *   https://hashtagweb3.com/<slug>/fc     (for Farcaster)
 *   Company is hiring role: https://hashtagweb3.com/<slug>/th     (for Threads)
 *   Company is hiring role: https://hashtagweb3.com/<slug>/bsky   (for Bluesky)
 *   Company is hiring role: https://hashtagweb3.com/<slug>/li     (for LinkedIn via Buffer)
 *   Company is hiring role: https://hashtagweb3.com/<slug>/fb     (for Facebook Page via Meta Graph API)
 *   (Square OG image generated for Instagram feed)
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
 *   npx tsx scripts/social/post-job-openings.ts --platform linkedin --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform facebook --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform reddit --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform instagram --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform all --dry-run
 *   npx tsx scripts/social/post-job-openings.ts --platform all
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import dotenv from 'dotenv';
import { buildUniqueJobMetaDescription } from '../../src/lib/job-guides';
import { getCompanySlug } from '../../src/lib/job-slugs';
import { resolveCompanyLogo } from '../../src/lib/company-logo';

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

async function postToThreads(text: string, linkAttachment?: string): Promise<string> {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  const threadsUserId = process.env.THREADS_USER_ID;

  if (!accessToken || !threadsUserId) {
    throw new Error('Threads credentials missing (THREADS_ACCESS_TOKEN, THREADS_USER_ID)');
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

  const { id: containerId } = await createRes.json();

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

  const postData = (await postRes.json()) as any;
  return postData.uri;
}

// ── Farcaster / Neynar ──

async function postToFarcaster(
  text: string,
  linkUrl: string,
  channelId: string = 'jobs'
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

  const data = (await res.json()) as any;
  return data.cast?.hash || 'published';
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

export interface LinkedInPreview {
  title: string;
  description: string;
  image: string;
}

// Readiness gate: fetch the /li URL exactly as LinkedIn's crawler would and
// assert the page + its og:image are servable BEFORE handing text to Buffer.
// Returns the resolved card data for the explicit linkAttachment, or null.
// A cardless post burns the URL in LinkedIn's cache (~7d), so fail closed:
// if our own serving is broken (deploy in flight, 5xx, missing tags), skip
// the LinkedIn publish for this run instead of posting blind.
async function verifyLinkedInServing(slug: string): Promise<LinkedInPreview | null> {
  const pageUrl = `${SITE_URL}/${slug}/li`;
  try {
    const res = await fetch(pageUrl, { headers: { 'User-Agent': LINKEDIN_BOT_UA } });
    if (res.status !== 200) {
      console.error(`LinkedIn readiness: page HTTP ${res.status} for ${pageUrl} — skipping LinkedIn publish`);
      return null;
    }
    const html = await res.text();
    if (html.length > 150000) {
      console.error(`LinkedIn readiness: page ${html.length}b exceeds crawler comfort zone — skipping LinkedIn publish`);
      return null;
    }
    const titleMatch = html.match(/<meta property="og:title"[^>]+content="([^"]{10,})"/);
    if (!titleMatch) {
      console.error('LinkedIn readiness: og:title missing/empty — skipping LinkedIn publish');
      return null;
    }
    const m = html.match(/<meta property="og:image"[^>]+content="([^"]+)"/);
    if (!m) {
      console.error('LinkedIn readiness: og:image missing — skipping LinkedIn publish');
      return null;
    }
    const imgRes = await fetch(m[1].replace(/&amp;/g, '&'), { headers: { 'User-Agent': LINKEDIN_BOT_UA } });
    const ct = imgRes.headers.get('content-type') || '';
    if (!imgRes.ok || !ct.startsWith('image/')) {
      console.error(`LinkedIn readiness: image HTTP ${imgRes.status} ${ct} — skipping LinkedIn publish`);
      return null;
    }
    const descMatch = html.match(/<meta property="og:description"[^>]+content="([^"]+)"/);
    const preview = {
      title: decodeEntities(titleMatch[1]).slice(0, 200),
      description: decodeEntities(descMatch ? descMatch[1] : '').slice(0, 300),
      image: m[1].replace(/&amp;/g, '&'),
    };
    console.log(`LinkedIn readiness: page 200 (${html.length}b) + og tags + image ${imgRes.status} ${ct} — servable, publishing`);
    return preview;
  } catch (err) {
    console.error('LinkedIn readiness check failed:', (err as Error).message, '— skipping LinkedIn publish');
    return null;
  }
}

// ── Facebook Page (Meta Graph API) ──

async function postToFacebook(text: string, linkUrl?: string): Promise<string> {
  const pageId = process.env.META_PAGE_ID || process.env.FACEBOOK_PAGE_ID;
  const pageToken = process.env.META_PAGE_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId) {
    throw new Error('Facebook Page ID missing (META_PAGE_ID or FACEBOOK_PAGE_ID)');
  }
  if (!pageToken) {
    throw new Error('Facebook Page Access Token missing (META_PAGE_TOKEN or FACEBOOK_PAGE_ACCESS_TOKEN)');
  }

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

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Facebook API error: ${JSON.stringify(data.error || data)}`);
  }

  return data.id || data.post_id || 'published';
}

// ── Reddit (r/hashtagweb3 API) ──

async function postToReddit(
  title: string,
  bodyMarkdown: string,
  subreddit: string = 'hashtagweb3'
): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error('Missing Reddit API credentials (REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD)');
  }

  // 1. Get access token via password grant
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': `HashtagWeb3Bot/1.0.0 (by /u/${username})`,
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username,
      password,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Reddit token exchange failed (${tokenRes.status}): ${errText}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenData.access_token) {
    throw new Error(`Reddit token error: ${JSON.stringify(tokenData)}`);
  }

  // 2. Submit post
  const submitRes = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'User-Agent': `HashtagWeb3Bot/1.0.0 (by /u/${username})`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      sr: subreddit,
      kind: 'self',
      title,
      text: bodyMarkdown,
      resubmit: 'true',
    }),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text();
    throw new Error(`Reddit submit failed (${submitRes.status}): ${errText}`);
  }

  const submitData = (await submitRes.json()) as {
    json?: { errors?: any[]; data?: { url?: string; id?: string } };
  };

  if (submitData.json?.errors && submitData.json.errors.length > 0) {
    throw new Error(`Reddit API error: ${JSON.stringify(submitData.json.errors)}`);
  }

  return submitData.json?.data?.url || submitData.json?.data?.id || 'published';
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
// App Hosting rollout is in flight (cold starts, traffic migration), the
// scrape fails and the miss is cached for days — the #1 observed cause of
// cardless posts. So before publishing, wait for any in-flight production
// rollout to finish. Fail-open: without a GitHub token (local runs) or on
// API errors, log and proceed — the per-platform readiness checks remain.
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
        (r) => /app hosting/i.test(r.name) && (r.status === 'in_progress' || r.status === 'queued')
      );
      if (!busy) {
        console.log('Deploy gate: no App Hosting rollout in flight — prod stable, publishing.');
        return;
      }
      if (Date.now() >= deadline) {
        console.warn('Deploy gate: rollout still in flight after 15 min — proceeding anyway (readiness checks remain).');
        return;
      }
      console.log('Deploy gate: App Hosting rollout in flight — waiting 60s before publishing...');
      await new Promise((r) => setTimeout(r, 60000));
    } catch (err) {
      console.warn('Deploy gate: check failed (%s) — proceeding (readiness checks remain).', (err as Error).message);
      return;
    }
  }
}

// ── Main Scheduling & Selection ──

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const platformIdx = args.indexOf('--platform');
  const platform = platformIdx !== -1 ? args[platformIdx + 1]?.toLowerCase() : 'all';
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
    // Extract last posted company from state history
    const lastPostedCompany = state.history && state.history.length > 0
      ? state.history[state.history.length - 1].company.toLowerCase()
      : null;

    // First pass: find an unposted job from a DIFFERENT company than the last posted company
    for (let i = 0; i < totalJobs; i++) {
      const idx = (state.lastIndex + i) % totalJobs;
      const candidate = jobs[idx];
      if (!postedSet.has(candidate.slug) && candidate.company.toLowerCase() !== lastPostedCompany) {
        selectedJob = candidate;
        state.lastIndex = (idx + 1) % totalJobs;
        break;
      }
    }

    // Fallback pass: if all unposted jobs belong to the same company, pick any unposted job
    if (!selectedJob) {
      for (let i = 0; i < totalJobs; i++) {
        const idx = (state.lastIndex + i) % totalJobs;
        const candidate = jobs[idx];
        if (!postedSet.has(candidate.slug)) {
          selectedJob = candidate;
          state.lastIndex = (idx + 1) % totalJobs;
          break;
        }
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
  const pickNextJob = (excludeCompany: string, excludeSlug: string): Job | null => {
    const totalJobs = jobs.length;
    const posted = new Set(state.postedSlugs);
    posted.add(excludeSlug);
    for (let i = 0; i < totalJobs; i++) {
      const idx = (state.lastIndex + i) % totalJobs;
      const candidate = jobs[idx];
      if (!posted.has(candidate.slug) && candidate.company.toLowerCase() !== excludeCompany) {
        state.lastIndex = (idx + 1) % totalJobs;
        return candidate;
      }
    }
    for (let i = 0; i < totalJobs; i++) {
      const idx = (state.lastIndex + i) % totalJobs;
      const candidate = jobs[idx];
      if (!posted.has(candidate.slug)) {
        state.lastIndex = (idx + 1) % totalJobs;
        return candidate;
      }
    }
    return null;
  };

  // Catch-up arming: GitHub cron slots are routinely skipped or delayed
  // (observed ~3-5 posting runs/day vs 8 scheduled). If the last successful
  // post is older than ~4.5h, this run posts a second, different-company job
  // to hold the visible daily cadence. Single-slug and single-platform
  // invocations never catch up.
  let catchUpArmed = false;
  if (!targetSlug && (platform === 'all' || platform === 'both') && state.history.length > 0) {
    const lastPostedAt = Date.parse(state.history[state.history.length - 1].postedAt);
    if (!Number.isNaN(lastPostedAt) && Date.now() - lastPostedAt > 4.5 * 3600 * 1000) {
      catchUpArmed = true;
      console.log(`Catch-up armed: last successful post was ${new Date(lastPostedAt).toISOString()}.`);
    }
  }

  const jobsToPost: Job[] = [selectedJob as Job];
  for (let round = 0; round < jobsToPost.length; round++) {
    const currentJob = jobsToPost[round];
    const { company, title, slug, location } = currentJob;

  // Build OG image URL, passing the verified local logo when one exists so
  // the card uses high-res art instead of guessing favicons. PNG twin is
  // preferred (every .webp in public/logo has one; satori embeds PNG safely).
  let logoParam = '';
  try {
    const localLogo = resolveCompanyLogo(getCompanySlug(company));
    if (localLogo) logoParam = `&logo=${encodeURIComponent(localLogo.replace(/\.webp$/i, '.png'))}`;
  } catch {
    // Fall through to favicon guessing inside the OG route.
  }
  const ogImageUrl = `${SITE_URL}/api/og?type=job&title=${encodeURIComponent(title)}&company=${encodeURIComponent(company)}&location=${encodeURIComponent(location || 'Remote')}${logoParam}`;

  // Formats strictly adhering to:
  //   Company is hiring role
  //
  //   URL/<platform>
  const xUrl = `${SITE_URL}/${slug}/x`;
  const threadsUrl = `${SITE_URL}/${slug}/th`;
  const blueskyUrl = `${SITE_URL}/${slug}/bsky`;
  const farcasterUrl = `${SITE_URL}/${slug}/fc`;
  const linkedinUrl = `${SITE_URL}/${slug}/li`;
  const facebookUrl = `${SITE_URL}/${slug}/fb`;
  const redditUrl = `${SITE_URL}/${slug}/rd`;

  const xPostText = `${company} is hiring ${title}\n\n${xUrl}`;
  const threadsPostText = `${company} is hiring ${title}: ${threadsUrl}`;
  const blueskyPostText = `${company} is hiring ${title}: ${blueskyUrl}`;
  const farcasterPostText = `${company} is hiring ${title}\n\n${farcasterUrl}`;
  const linkedinPostText = `${company} is hiring ${title}: ${linkedinUrl}`;
  const facebookPostText = `${company} is hiring ${title}: ${facebookUrl}`;

  const metaDesc = buildUniqueJobMetaDescription(currentJob as any);
  const deptName = typeof currentJob.department === 'string' ? currentJob.department : currentJob.department?.name || '';
  const redditTitle = `[Hiring] ${company} is hiring a ${title} (${location || 'Remote'})`;
  const redditMarkdown = `**Company:** [${company}](${redditUrl})\n**Role:** ${title}\n**Location:** ${location || 'Remote'}${deptName ? `\n**Department:** ${deptName}` : ''}\n\n### Overview\n${metaDesc}\n\n---\n🔗 **Apply Directly / View Details:** [https://hashtagweb3.com/${slug}/rd](${redditUrl})\n\n*Verified by [Hashtag Web3](https://hashtagweb3.com) — The Web3 Career & Event Resource Platform.*`;

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

  // Warm the OG render + edge cache with full GETs (landscape + square) so
  // Meta's and Bluesky's fetchers — which time out on cold ~3s renders —
  // hit a hot cache when building link cards and IG containers.
  for (const warmUrl of [ogImageUrl, `${ogImageUrl}&format=square`]) {
    try {
      const warmRes = await fetch(warmUrl);
      await warmRes.arrayBuffer();
      console.log(`OG Image Warm-up: HTTP ${warmRes.status} (${warmUrl.slice(-14)})`);
    } catch (err) {
      console.warn(`Warning: OG warm-up failed:`, (err as Error).message);
    }
  }

  console.log(`\n--- Preview: X (Twitter) Post ---`);
  console.log(xPostText);
  console.log(`---------------------------------`);

  console.log(`\n--- Preview: Threads Post ---`);
  console.log(threadsPostText);
  console.log(`-----------------------------`);

  console.log(`\n--- Preview: Bluesky Post ---`);
  console.log(blueskyPostText);
  console.log(`-----------------------------`);

  console.log(`\n--- Preview: Farcaster Post (Channel: /jobs) ---`);
  console.log(farcasterPostText);
  console.log(`-----------------------------------------------`);

  console.log(`\n--- Preview: LinkedIn Post (Company Page via Buffer) ---`);
  console.log(linkedinPostText);
  console.log(`--------------------------------------------------------`);

  console.log(`\n--- Preview: Facebook Page Post (Meta Graph API) ---`);
  console.log(facebookPostText);
  console.log(`----------------------------------------------------`);

  console.log(`\n--- Preview: Reddit Post (r/hashtagweb3) ---`);
  console.log(`Title: ${redditTitle}`);
  console.log(redditMarkdown);
  console.log(`---------------------------------------------\n`);

  if (isDryRun) {
    console.log('DRY RUN active: No external network requests were made to X, Threads, Bluesky, Farcaster, LinkedIn, Facebook, Reddit, or Instagram.');
    return;
  }

  // Publish only into a quiet prod: scrapers fire within minutes and a
  // mid-deploy scrape yields a cardless post cached for days (see gate).
  await waitForQuietDeploy();

  const now = new Date().toISOString();
  const shouldPostAll = platform === 'all' || platform === 'both';

  let postedSuccessCount = 0;

  if (platform === 'x' || shouldPostAll) {
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
      postedSuccessCount++;
    } catch (err) {
      console.error(`✗ Failed to post to X:`, (err as Error).message);
    }
  }

  if (platform === 'threads' || shouldPostAll) {
    try {
      console.log('Publishing to Threads (with link attachment preview)...');
      const threadsId = await postToThreads(threadsPostText, threadsUrl);
      console.log(`✓ Successfully published to Threads! Media ID: ${threadsId}`);
      state.history.push({
        slug,
        company,
        title,
        platform: 'threads',
        postedAt: now,
        postId: threadsId,
      });
      postedSuccessCount++;
    } catch (err) {
      console.error(`✗ Failed to post to Threads:`, (err as Error).message);
    }
  }

  if (platform === 'bluesky' || shouldPostAll) {
    try {
      console.log('Publishing to Bluesky...');
      const metaDesc = buildUniqueJobMetaDescription(selectedJob as any);
      const bskyUri = await postToBluesky(blueskyPostText, blueskyUrl, ogImageUrl, company, title, metaDesc);
      console.log(`✓ Successfully published to Bluesky! Post URI: ${bskyUri}`);
      state.history.push({
        slug,
        company,
        title,
        platform: 'bluesky',
        postedAt: now,
        postId: bskyUri,
      });
      postedSuccessCount++;
    } catch (err) {
      console.error(`✗ Failed to post to Bluesky:`, (err as Error).message);
    }
  }

  if (platform === 'farcaster' || shouldPostAll) {
    try {
      console.log('Publishing to Farcaster / Warpcast...');
      const castHash = await postToFarcaster(farcasterPostText, farcasterUrl, 'jobs');
      console.log(`✓ Successfully published to Farcaster! Cast Hash: ${castHash}`);
      state.history.push({
        slug,
        company,
        title,
        platform: 'farcaster',
        postedAt: now,
        postId: castHash,
      });
      postedSuccessCount++;
    } catch (err) {
      console.error(`✗ Failed to post to Farcaster:`, (err as Error).message);
    }
  }

  if (platform === 'linkedin' || shouldPostAll) {
    try {
      console.log('Publishing to LinkedIn (Hashtag Web3 Company Page via Buffer link preview)...');
      const preview = await verifyLinkedInServing(slug);
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
        state.history.push({
          slug,
          company,
          title,
          platform: 'linkedin',
          postedAt: now,
          postId: bufferPostId,
        });
        postedSuccessCount++;
      }
    } catch (err) {
      console.error(`✗ Failed to post to LinkedIn:`, (err as Error).message);
    }
  }

  if (platform === 'facebook' || shouldPostAll) {
    try {
      console.log('Publishing to Facebook Page (Meta Graph API link feed)...');
      const fbPostId = await postToFacebook(facebookPostText, facebookUrl);
      console.log(`✓ Successfully published to Facebook! Post ID: ${fbPostId}`);
      state.history.push({
        slug,
        company,
        title,
        platform: 'facebook',
        postedAt: now,
        postId: fbPostId,
      });
      postedSuccessCount++;
    } catch (err) {
      console.error(`✗ Failed to post to Facebook:`, (err as Error).message);
    }
  }

  if (platform === 'reddit' || shouldPostAll) {
    try {
      console.log('Publishing to Reddit (r/hashtagweb3)...');
      const redditPostId = await postToReddit(redditTitle, redditMarkdown, 'hashtagweb3');
      console.log(`✓ Successfully published to Reddit! Post: ${redditPostId}`);
      state.history.push({
        slug,
        company,
        title,
        platform: 'reddit',
        postedAt: now,
        postId: redditPostId,
      });
      postedSuccessCount++;
    } catch (err) {
      console.error(`✗ Failed to post to Reddit:`, (err as Error).message);
    }
  }

  if (platform === 'instagram' || shouldPostAll) {
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
      const igImageUrl = `${ogImageUrl}&format=square`;
      const igPostId = await postToInstagram(igCaption, [igImageUrl]);
      console.log(`✓ Successfully published Carousel to Instagram! Post ID: ${igPostId}`);
      state.history.push({
        slug,
        company,
        title,
        platform: 'instagram',
        postedAt: now,
        postId: igPostId,
      });
      postedSuccessCount++;
    } catch (err) {
      console.error(`✗ Failed to post to Instagram:`, (err as Error).message);
    }
  }

  if (postedSuccessCount > 0) {
    state.postedSlugs.push(slug);
    saveState(state);
    console.log(`\nState saved (${postedSuccessCount} platforms succeeded). Done.`);
  } else {
    console.warn(`\nNo platform succeeded for ${slug}. State not marked as posted.`);
  }

    // Enqueue the catch-up round (if armed): a second, different-company job
    // appended to jobsToPost lengthens this same loop by one iteration. An
    // empty pick ends the extension silently (single post, as before).
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
