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
}

function loadSchedule(): PostContent[] {
  return JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf-8'));
}

function loadState(): PublishState {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return {
    linkedin: { lastIndex: -1, posted: [] },
    instagram: { lastIndex: -1, posted: [] },
    twitter: { lastIndex: -1, posted: [] },
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

// --- X/Twitter OAuth 1.0a helpers ---

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

async function twitterApiRequest(
  method: string,
  url: string,
  body?: any,
  extraParams?: Record<string, string>
) {
  const consumerKey = process.env.X_CONSUMER_KEY!;
  const consumerSecret = process.env.X_CONSUMER_SECRET!;
  const accessToken = process.env.X_ACCESS_TOKEN!;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET!;

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateOAuthNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
    ...(extraParams || {}),
  };

  const signature = generateOAuthSignature(method, url, oauthParams, consumerSecret, accessTokenSecret);
  oauthParams.oauth_signature = signature;

  const headers: Record<string, string> = {
    Authorization: buildOAuthHeader(oauthParams),
  };

  const fetchOptions: any = { method, headers };

  if (body) {
    if (body instanceof Buffer) {
      headers['Content-Type'] = 'application/octet-stream';
      fetchOptions.body = body;
    } else if (typeof body === 'string') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      fetchOptions.body = body;
    } else {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    }
  }

  const res = await fetch(url, fetchOptions);
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`X API error ${res.status}: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function uploadMediaToTwitter(imagePath: string): Promise<string> {
  const imageBuffer = fs.readFileSync(imagePath);
  const totalBytes = imageBuffer.length;
  const mediaType = 'image/png';

  // INIT
  const initUrl = 'https://upload.twitter.com/1.1/media/upload.json';
  const initParams = `command=INIT&total_bytes=${totalBytes}&media_type=${encodeURIComponent(mediaType)}&media_category=TWEET_IMAGE`;

  const consumerKey = process.env.X_CONSUMER_KEY!;
  const consumerSecret = process.env.X_CONSUMER_SECRET!;
  const accessToken = process.env.X_ACCESS_TOKEN!;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET!;

  // For media upload we use form-encoded params
  const initOauth: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateOAuthNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
    command: 'INIT',
    total_bytes: totalBytes.toString(),
    media_type: mediaType,
    media_category: 'TWEET_IMAGE',
  };

  const initSig = generateOAuthSignature('POST', initUrl, initOauth, consumerSecret, accessTokenSecret);
  initOauth.oauth_signature = initSig;

  const initRes = await fetch(initUrl, {
    method: 'POST',
    headers: {
      Authorization: buildOAuthHeader(initOauth),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: initParams,
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
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  const appendSig = generateOAuthSignature('POST', initUrl, appendOauth, consumerSecret, accessTokenSecret);
  appendOauth.oauth_signature = appendSig;

  const formData = new FormData();
  formData.append('command', 'APPEND');
  formData.append('media_id', mediaId);
  formData.append('segment_index', '0');
  formData.append('media_data', imageBuffer.toString('base64'));

  const appendRes = await fetch(initUrl, {
    method: 'POST',
    headers: {
      Authorization: buildOAuthHeader(appendOauth),
    },
    body: formData,
  });

  if (!appendRes.ok && appendRes.status !== 204) {
    throw new Error(`Media APPEND failed: ${await appendRes.text()}`);
  }
  console.log('Media APPEND done');

  // FINALIZE
  const finalizeParams = `command=FINALIZE&media_id=${mediaId}`;
  const finalizeOauth: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateOAuthNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
    command: 'FINALIZE',
    media_id: mediaId,
  };

  const finalizeSig = generateOAuthSignature('POST', initUrl, finalizeOauth, consumerSecret, accessTokenSecret);
  finalizeOauth.oauth_signature = finalizeSig;

  const finalizeRes = await fetch(initUrl, {
    method: 'POST',
    headers: {
      Authorization: buildOAuthHeader(finalizeOauth),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: finalizeParams,
  });

  if (!finalizeRes.ok) {
    throw new Error(`Media FINALIZE failed: ${await finalizeRes.text()}`);
  }
  console.log('Media FINALIZE done');

  return mediaId;
}

async function postToTwitter(text: string, imagePath: string) {
  if (!process.env.X_CONSUMER_KEY || !process.env.X_ACCESS_TOKEN) {
    throw new Error('X API credentials not set (X_CONSUMER_KEY, X_ACCESS_TOKEN)');
  }

  // Strip hashtags for X (keep it clean)
  const cleanText = text.replace(/#\w+/g, '').trim();
  // X has 280 char limit, truncate if needed
  const tweetText = cleanText.length > 275 ? cleanText.substring(0, 272) + '...' : cleanText;

  let mediaId: string | null = null;
  if (imagePath && fs.existsSync(imagePath)) {
    console.log('Uploading media to X...');
    try {
      mediaId = await uploadMediaToTwitter(imagePath);
    } catch (e) {
      console.warn('Media upload failed, falling back to text-only:', (e as Error).message);
    }
  }

  // Post tweet using v2 API
  const tweetBody: any = { text: tweetText };
  if (mediaId) {
    tweetBody.media = { media_ids: [mediaId] };
  }

  const result = await twitterApiRequest('POST', 'https://api.twitter.com/2/tweets', tweetBody);
  console.log(`Tweet published: ${result.data?.id}`);
  return result.data?.id;
}

// --- Main ---

async function main() {
  const platform = process.argv.find((a) => a === '--platform')
    ? process.argv[process.argv.indexOf('--platform') + 1]
    : null;

  if (!platform || !['linkedin', 'instagram', 'twitter'].includes(platform)) {
    console.error('Usage: npx tsx publish-social.ts --platform linkedin|instagram|twitter');
    process.exit(1);
  }

  const schedule = loadSchedule();
  const state = loadState();

  // Ensure state file exists for future runs
  saveState(state);

  // Get next post index with platform-specific offset for shuffling
  // This ensures different platforms don't post the same content at the same time
  const platformState = state[platform as keyof PublishState];
  const offsets: Record<string, number> = { linkedin: 0, instagram: 3, twitter: 6 };
  const offset = offsets[platform] || 0;
  const baseIndex = (platformState.lastIndex + 1) % schedule.length;
  const shuffledIndex = (baseIndex + offset) % schedule.length;
  const post = schedule[shuffledIndex];

  // Use platform-specific text: twitter has its own field, falls back to instagram
  let text: string;
  if (platform === 'twitter' && post.twitter?.text) {
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
