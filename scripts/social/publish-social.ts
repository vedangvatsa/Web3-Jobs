/**
 * Publish scheduled social media posts to LinkedIn, Instagram, and X
 * Run with: npx tsx scripts/social/publish-social.ts
 * 
 * Reads from content-schedule.json and posts the next unposted item
 * to the platform specified by --platform flag.
 * 
 * Usage:
 *   npx tsx scripts/social/publish-social.ts --platform linkedin
 *   npx tsx scripts/social/publish-social.ts --platform instagram
 *   npx tsx scripts/social/publish-social.ts --platform twitter
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const SCHEDULE_FILE = path.join(__dirname, 'content-schedule.json');
const STATE_FILE = path.join(__dirname, 'publish-state.json');

interface PostContent {
  id: string;
  image: string;
  imageUrl?: string;
  linkedin: { text: string };
  instagram: { text: string };
  twitter?: { text: string };
}

interface PublishState {
  linkedin: { lastIndex: number; posted: string[] };
  instagram: { lastIndex: number; posted: string[] };
  twitter: { lastIndex: number; posted: string[] };
  bluesky: { lastIndex: number; posted: string[] };
}

function loadSchedule(): PostContent[] {
  return JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf-8'));
}

function loadState(): PublishState {
  if (fs.existsSync(STATE_FILE)) {
    const s = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    if (!s.bluesky) s.bluesky = { lastIndex: -1, posted: [] };
    return s;
  }
  return {
    linkedin: { lastIndex: -1, posted: [] },
    instagram: { lastIndex: -1, posted: [] },
    twitter: { lastIndex: -1, posted: [] },
    bluesky: { lastIndex: -1, posted: [] },
  };
}

function saveState(state: PublishState) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function postToLinkedIn(text: string, imagePath: string) {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const organizationId = process.env.LINKEDIN_ORG_ID || '89714573';

  if (!accessToken) {
    throw new Error('LINKEDIN_ACCESS_TOKEN not set');
  }

  const API_BASE = 'https://api.linkedin.com/rest';

  // Step 1 - Register image upload
  let imageUrn: string | null = null;

  if (imagePath && fs.existsSync(imagePath)) {
    console.log('Registering image upload with LinkedIn...');

    const registerRes = await fetch(`${API_BASE}/images?action=initializeUpload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202405',
      },
      body: JSON.stringify({
        initializeUploadRequest: {
          owner: `urn:li:organization:${organizationId}`,
        },
      }),
    });

    if (!registerRes.ok) {
      const err = await registerRes.text();
      console.error('Image register failed:', err);
    } else {
      const registerData = await registerRes.json();
      const uploadUrl = registerData.value.uploadUrl;
      imageUrn = registerData.value.image;

      // Step 2 - Upload image binary
      const imageBuffer = fs.readFileSync(imagePath);
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/png' },
        body: new Uint8Array(imageBuffer),
      });

      if (!uploadRes.ok) {
        console.error('Image upload failed:', await uploadRes.text());
        imageUrn = null;
      } else {
        console.log('Image uploaded:', imageUrn);
      }
    }
  }

  // Step 3 - Create post
  const postBody: any = {
    author: `urn:li:organization:${organizationId}`,
    commentary: text,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
  };

  if (imageUrn) {
    postBody.content = {
      media: {
        id: imageUrn,
      },
    };
  }

  const postRes = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202405',
    },
    body: JSON.stringify(postBody),
  });

  if (!postRes.ok) {
    const err = await postRes.text();
    throw new Error(`LinkedIn post failed: ${postRes.status} ${err}`);
  }

  const postId = postRes.headers.get('x-restli-id') || 'unknown';
  console.log(`LinkedIn post published: ${postId}`);
  return postId;
}

async function postToInstagram(text: string, imagePath: string) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_USER_ID;

  if (!accessToken || !igUserId) {
    throw new Error('INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_USER_ID not set');
  }

  // Instagram requires a publicly accessible image URL
  // We upload to a temporary hosting or use the repo raw URL
  const imageUrl = process.env.SOCIAL_IMAGE_BASE_URL
    ? `${process.env.SOCIAL_IMAGE_BASE_URL}/${path.basename(imagePath)}`
    : null;

  if (!imageUrl) {
    throw new Error('SOCIAL_IMAGE_BASE_URL not set. Instagram needs a public image URL.');
  }

  // Step 1 - Create media container
  const createRes = await fetch(
    `https://graph.facebook.com/v19.0/${igUserId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: text,
        access_token: accessToken,
      }),
    }
  );

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Instagram container creation failed: ${createRes.status} ${err}`);
  }

  const { id: containerId } = await createRes.json();
  console.log('Instagram container created:', containerId);

  // Wait for processing
  await new Promise((r) => setTimeout(r, 5000));

  // Step 2 - Publish the container
  const publishRes = await fetch(
    `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    }
  );

  if (!publishRes.ok) {
    const err = await publishRes.text();
    throw new Error(`Instagram publish failed: ${publishRes.status} ${err}`);
  }

  const { id: mediaId } = await publishRes.json();
  console.log(`Instagram post published: ${mediaId}`);
  return mediaId;
}

// --- X/Twitter OAuth 1.0a helpers (needed for media upload) ---

function generateOAuthNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
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

async function uploadMediaToX(imagePath: string): Promise<string> {
  const consumerKey = process.env.X_CONSUMER_KEY!;
  const consumerSecret = process.env.X_CONSUMER_SECRET!;
  const oauthToken = process.env.X_ACCESS_TOKEN!;
  const oauthTokenSecret = process.env.X_ACCESS_TOKEN_SECRET!;

  const imageBuffer = fs.readFileSync(imagePath);
  const totalBytes = imageBuffer.length;
  const mediaType = imagePath.endsWith('.jpg') || imagePath.endsWith('.jpeg') ? 'image/jpeg' : 'image/png';
  const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';

  // INIT
  const initOauth: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateOAuthNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: oauthToken,
    oauth_version: '1.0',
    command: 'INIT',
    total_bytes: totalBytes.toString(),
    media_type: mediaType,
    media_category: 'TWEET_IMAGE',
  };
  initOauth.oauth_signature = generateOAuthSignature('POST', uploadUrl, initOauth, consumerSecret, oauthTokenSecret);

  const initRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: buildOAuthHeader(initOauth),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `command=INIT&total_bytes=${totalBytes}&media_type=${encodeURIComponent(mediaType)}&media_category=TWEET_IMAGE`,
  });

  if (!initRes.ok) {
    throw new Error(`Media INIT failed: ${await initRes.text()}`);
  }

  const initData = await initRes.json();
  const mediaId = initData.media_id_string;
  console.log('Media INIT:', mediaId);

  // APPEND
  const appendOauth: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateOAuthNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: oauthToken,
    oauth_version: '1.0',
  };
  appendOauth.oauth_signature = generateOAuthSignature('POST', uploadUrl, appendOauth, consumerSecret, oauthTokenSecret);

  const formData = new FormData();
  formData.append('command', 'APPEND');
  formData.append('media_id', mediaId);
  formData.append('segment_index', '0');
  formData.append('media_data', imageBuffer.toString('base64'));

  const appendRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: buildOAuthHeader(appendOauth) },
    body: formData,
  });

  if (!appendRes.ok && appendRes.status !== 204) {
    throw new Error(`Media APPEND failed: ${await appendRes.text()}`);
  }
  console.log('Media APPEND done');

  // FINALIZE
  const finalizeOauth: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateOAuthNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: oauthToken,
    oauth_version: '1.0',
    command: 'FINALIZE',
    media_id: mediaId,
  };
  finalizeOauth.oauth_signature = generateOAuthSignature('POST', uploadUrl, finalizeOauth, consumerSecret, oauthTokenSecret);

  const finalizeRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: buildOAuthHeader(finalizeOauth),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `command=FINALIZE&media_id=${mediaId}`,
  });

  if (!finalizeRes.ok) {
    throw new Error(`Media FINALIZE failed: ${await finalizeRes.text()}`);
  }
  console.log('Media FINALIZE done');

  return mediaId;
}

// --- X/Twitter post (OAuth 1.0a for both tweets and media) ---

async function postToTwitter(text: string, imagePath: string) {
  const consumerKey = process.env.X_CONSUMER_KEY;
  const consumerSecret = process.env.X_CONSUMER_SECRET;
  const oauthToken = process.env.X_ACCESS_TOKEN;
  const oauthTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!consumerKey || !consumerSecret || !oauthToken || !oauthTokenSecret) {
    throw new Error('X API credentials not set (X_CONSUMER_KEY, X_CONSUMER_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET)');
  }

  // Strip hashtags for X (keep it clean)
  const tweetText = text.replace(/#\w+/g, '').trim();

  // Upload image if available
  let mediaId: string | null = null;
  if (imagePath && fs.existsSync(imagePath)) {
    console.log('Uploading media to X...');
    try {
      mediaId = await uploadMediaToX(imagePath);
    } catch (e) {
      console.warn('Media upload failed, falling back to text-only:', (e as Error).message);
    }
  }

  // Post tweet using v2 API with OAuth 1.0a
  const tweetBody: any = { text: tweetText };
  if (mediaId) {
    tweetBody.media = { media_ids: [mediaId] };
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
      'Authorization': buildOAuthHeader(oauthParams),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tweetBody),
  });

  const responseText = await res.text();
  if (!res.ok) {
    throw new Error(`X API error ${res.status}: ${responseText}`);
  }

  const result = JSON.parse(responseText);
  console.log(`Tweet published: ${result.data?.id}`);
  return result.data?.id;
}

// --- Bluesky / AT Protocol ---

async function postToBluesky(text: string, imagePath: string) {
  const handle = process.env.BLUESKY_HANDLE || 'hashtagweb3.bsky.social';
  const appPassword = process.env.BLUESKY_APP_PASSWORD;

  if (!appPassword) {
    throw new Error('BLUESKY_APP_PASSWORD not set');
  }

  // Create session
  const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: handle, password: appPassword }),
  });

  if (!sessionRes.ok) {
    throw new Error(`Bluesky auth failed: ${await sessionRes.text()}`);
  }

  const session = await sessionRes.json() as any;
  const { accessJwt, did } = session;
  console.log(`Bluesky authenticated as ${did}`);

  // Upload image if exists
  let imageBlob: any = null;
  if (imagePath && fs.existsSync(imagePath)) {
    console.log('Uploading image to Bluesky...');
    const imageBuffer = fs.readFileSync(imagePath);
    const uploadRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
        Authorization: `Bearer ${accessJwt}`,
      },
      body: new Uint8Array(imageBuffer),
    });

    if (uploadRes.ok) {
      const uploadData = await uploadRes.json() as any;
      imageBlob = uploadData.blob;
      console.log('Image uploaded to Bluesky');
    } else {
      console.warn('Bluesky image upload failed:', await uploadRes.text());
    }
  }

  // Parse facets for links
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

  // Create post record
  const record: any = {
    $type: 'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
  };

  if (facets.length > 0) record.facets = facets;

  if (imageBlob) {
    record.embed = {
      $type: 'app.bsky.embed.images',
      images: [{ alt: 'Web3 Jobs infographic', image: imageBlob }],
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

  const postData = await postRes.json() as any;
  console.log(`Bluesky post published: ${postData.uri}`);
  return postData.uri;
}

// --- Main ---

async function main() {
  const platform = process.argv.find((a) => a === '--platform')
    ? process.argv[process.argv.indexOf('--platform') + 1]
    : null;

  if (!platform || !['linkedin', 'instagram', 'twitter', 'bluesky'].includes(platform)) {
    console.error('Usage: npx tsx publish-social.ts --platform linkedin|instagram|twitter|bluesky');
    process.exit(1);
  }

  const schedule = loadSchedule();
  const state = loadState();

  // Ensure state file exists for future runs
  saveState(state);

  // Get next post index with platform-specific offset for shuffling
  // This ensures different platforms don't post the same content at the same time
  const platformState = state[platform as keyof PublishState];
  const offsets: Record<string, number> = { twitter: 0, bluesky: 11, linkedin: 22, instagram: 33 };
  const offset = offsets[platform] || 0;
  const baseIndex = (platformState.lastIndex + 1) % schedule.length;
  const shuffledIndex = (baseIndex + offset) % schedule.length;
  const post = schedule[shuffledIndex];

  // Use platform-specific text: twitter has its own field, falls back to instagram
  let text: string;
  if ((platform === 'twitter' || platform === 'bluesky') && post.twitter?.text) {
    text = post.twitter.text;
  } else if (platform === 'instagram') {
    text = post.instagram.text;
  } else {
    text = post.linkedin.text;
  }
  const imagePath = path.resolve(__dirname, '../../', post.image);

  console.log(`Publishing post ${shuffledIndex + 1}/${schedule.length} to ${platform}`);
  console.log(`Post ID: ${post.id}`);
  console.log(`Image: ${imagePath}`);
  console.log(`Text preview: ${text.substring(0, 80)}...`);

  try {
    if (platform === 'linkedin') {
      await postToLinkedIn(text, imagePath);
    } else if (platform === 'instagram') {
      await postToInstagram(text, imagePath);
    } else if (platform === 'twitter') {
      await postToTwitter(text, imagePath);
    } else if (platform === 'bluesky') {
      await postToBluesky(text, imagePath);
    }

    // Update state — track the base index for round-robin
    platformState.lastIndex = baseIndex;
    platformState.posted.push(`${post.id}_${new Date().toISOString()}`);
    saveState(state);

    console.log('Done. State saved.');
  } catch (error) {
    console.error(`Failed to post to ${platform}:`, error);
    process.exit(1);
  }
}
async function scheduleToBuffer(token: string, orgId: string) {
  const baseUrl = 'https://raw.githubusercontent.com/vedangvatsa123/Web3-Jobs/main/';
  const graphqlUrl = 'https://api.buffer.com/graphql';

  const query = `
    query GetChannels(\$orgId: OrganizationId!) {
      channels(input: { organizationId: \$orgId }) {
        id
        service
        name
      }
    }
  `;

  console.log('Fetching Buffer channels via GraphQL...');
  const pRes = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables: { orgId } }),
  });

  const pData = await pRes.json();
  if (pData.errors) {
    console.error('GraphQL Errors (Channels):', JSON.stringify(pData.errors, null, 2));
    throw new Error('Could not fetch Buffer channels.');
  }

  const channels = pData.data.channels;
  const linkedinIds = channels.filter((p: any) => p.service === 'linkedin').map((p: any) => p.id);
  const instagramIds = channels.filter((p: any) => p.service === 'instagram').map((p: any) => p.id);

  console.log('Buffer Channels Found:', channels.map((p: any) => `${p.service}:${p.id}`));

  const schedule = JSON.parse(fs.readFileSync(path.join(__dirname, 'content-schedule.json'), 'utf8'));

  // Slots: 1am, 9am, 5pm IST starting Mar 28
  const times = [
    new Date('2026-03-28T01:00:00+05:30'),
    new Date('2026-03-28T09:00:00+05:30'),
    new Date('2026-03-28T17:00:00+05:30'),
    new Date('2026-03-29T01:00:00+05:30'),
    new Date('2026-03-29T09:00:00+05:30'),
    new Date('2026-03-29T17:00:00+05:30')
  ];

  const mutation = `
    mutation CreatePost(\$input: CreatePostInput!) {
      createPost(input: \$input) {
        ... on PostActionSuccess {
          id
        }
        ... on MutationError {
          message
        }
      }
    }
  `;

  for (let i = 0; i < schedule.length; i++) {
    const post = schedule[i];
    const imageUrl = baseUrl + post.image;
    const scheduledAt = times[i].toISOString();

    for (const cid of [...linkedinIds, ...instagramIds]) {
      const isLI = channels.find((p: any) => p.id === cid).service === 'linkedin';
      const text = isLI ? post.linkedin.text : post.instagram.text;

      console.log(`Scheduling ${post.id} for ${cid} at ${scheduledAt}`);
      const res = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: {
              organizationId: orgId,
              channelId: cid,
              text: text,
              media: {
                picture: imageUrl,
                thumbnail: imageUrl
              },
              schedulingType: 'individual',
              mode: 'customSchedule',
              dueAt: scheduledAt
            }
          }
        })
      });
      const data = await res.json();
      if (data.errors) {
        console.error('GraphQL Errors (CreatePost):', JSON.stringify(data.errors, null, 2));
      } else {
        const result = data.data.createPost;
        console.log('Result:', result.id ? 'Success: ' + result.id : 'Error: ' + result.message);
      }
    }
  }
}

if (process.argv.includes('--buffer')) {
  const token = process.env.BUFFER_ACCESS_TOKEN || 'WLGVA8tQgQ6lHyM267pKDys4EEN5kls4SAVvO-TTFtB';
  const orgId = process.env.BUFFER_ORG_ID || '69c5b0f799d3bd8de475e25a';
  scheduleToBuffer(token, orgId).catch(console.error);
} else {
  main();
}
