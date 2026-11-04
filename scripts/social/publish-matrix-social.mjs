import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const MANIFEST_PATH = path.join(ROOT, 'social-assets/matrices-campaign/manifest.json');
export const RECEIPTS_DIR = path.join(ROOT, 'scripts/social/matrix-campaign-receipts');

export const DEFAULT_X_CHANNEL = '6ab62682ea19ca0bdee284bd';
export const DEFAULT_LINKEDIN_CHANNEL = '69c5b139af47dacb695b5feb';

export function loadManifest() {
  assert.ok(fs.existsSync(MANIFEST_PATH), 'Matrix manifest file missing');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  assert.ok(Array.isArray(manifest) && manifest.length === 10, 'Manifest must have 10 entries');
  return manifest;
}

export function getPostForDate(date, manifest = loadManifest()) {
  return manifest.find((item) => item.date === date);
}

export function getPostByIndex(index, manifest = loadManifest()) {
  return manifest.find((item) => item.index === Number(index));
}

export function remoteUrlForImage(imageFileName) {
  return `https://raw.githubusercontent.com/vedangvatsa/Web3-Jobs/main/public/images/social/${imageFileName}`;
}

export async function bufferQuery(token, query, variables = {}, fetcher = fetch) {
  assert.ok(token, 'BUFFER_ACCESS_TOKEN is required');
  const response = await fetcher('https://api.buffer.com', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(60000),
  });
  const data = await response.json();
  if (!response.ok || data.errors?.length) {
    throw new Error(`Buffer API error: ${data.errors?.map((e) => e.message).join('; ') || response.statusText}`);
  }
  return data.data;
}

export async function postToBufferChannel(token, channelId, text, imageUrl, altText, fetcher = fetch) {
  const mutation = `
    mutation CreateMatrixPost($input: CreatePostInput!) {
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

  const input = {
    channelId,
    text,
    schedulingType: 'automatic',
    mode: 'shareNow',
    assets: [
      {
        image: {
          url: imageUrl,
          metadata: { altText },
        },
      },
    ],
  };

  const data = await bufferQuery(token, mutation, { input }, fetcher);
  const result = data?.createPost;
  if (!result?.post?.id) {
    throw new Error(`Buffer post creation failed: ${result?.message || 'No post ID returned'}`);
  }
  return result.post.id;
}

export async function postToThreads(userId, token, text, imageUrl, fetcher = fetch) {
  assert.ok(userId && token, 'THREADS_USER_ID and THREADS_ACCESS_TOKEN required');

  // Step 1: Create media container
  const containerRes = await fetcher(`https://graph.threads.net/v1.0/${userId}/threads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: new URLSearchParams({
      media_type: 'IMAGE',
      image_url: imageUrl,
      text,
    }),
    signal: AbortSignal.timeout(60000),
  });
  const containerData = await containerRes.json();
  if (!containerRes.ok || containerData.error || !containerData.id) {
    throw new Error(`Threads container creation failed: ${containerData.error?.message || 'No ID'}`);
  }
  const containerId = containerData.id;

  // Step 2: Poll container status
  let isReady = false;
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetcher(`https://graph.threads.net/v1.0/${containerId}?fields=status,error_message`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const statusData = await statusRes.json();
    if (statusData.status === 'FINISHED') {
      isReady = true;
      break;
    }
    if (statusData.status === 'ERROR') {
      throw new Error(`Threads container status error: ${statusData.error_message || 'Processing failed'}`);
    }
  }

  // Step 3: Publish container
  const publishRes = await fetcher(`https://graph.threads.net/v1.0/${userId}/threads_publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: new URLSearchParams({ creation_id: containerId }),
    signal: AbortSignal.timeout(60000),
  });
  const publishData = await publishRes.json();
  if (!publishRes.ok || publishData.error || !publishData.id) {
    throw new Error(`Threads publish failed: ${publishData.error?.message || 'No publish ID'}`);
  }

  return { containerId, postId: publishData.id };
}

export async function publishMatrixPost({
  post,
  mode = 'publish',
  env = process.env,
  fetcher = fetch,
  receiptsDir = RECEIPTS_DIR,
}) {
  assert.ok(post, 'Valid post required');
  const bufferToken = env.BUFFER_ACCESS_TOKEN;
  const xChannel = env.BUFFER_X_CHANNEL_ID || DEFAULT_X_CHANNEL;
  const linkedInChannel = env.BUFFER_LINKEDIN_CHANNEL_ID || DEFAULT_LINKEDIN_CHANNEL;
  const threadsUserId = env.THREADS_USER_ID;
  const threadsToken = env.THREADS_ACCESS_TOKEN;

  const imageUrl = remoteUrlForImage(post.image);
  const receiptFile = path.join(receiptsDir, `${post.date}.json`);

  let receipt = {
    date: post.date,
    id: post.id,
    title: post.title,
    imageUrl,
    platforms: {},
    updatedAt: new Date().toISOString(),
  };

  if (fs.existsSync(receiptFile)) {
    try {
      receipt = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
    } catch {}
  }

  if (mode === 'preflight') {
    return {
      status: 'preflight-ok',
      post: post.id,
      date: post.date,
      title: post.title,
      imageUrl,
      hasBuffer: Boolean(bufferToken),
      hasThreads: Boolean(threadsUserId && threadsToken),
      receipt,
    };
  }

  // 1. Post to X via Buffer
  if (!receipt.platforms.x?.postId && bufferToken) {
    try {
      console.log(`[publish-matrix] Posting to X via Buffer (${post.id})...`);
      const postId = await postToBufferChannel(bufferToken, xChannel, post.xText, imageUrl, post.alt, fetcher);
      receipt.platforms.x = {
        status: 'published',
        postId,
        channelId: xChannel,
        publishedAt: new Date().toISOString(),
      };
    } catch (e) {
      console.error(`[publish-matrix] X posting failed: ${e.message}`);
      receipt.platforms.x = { status: 'failed', error: e.message };
    }
  }

  // 2. Post to LinkedIn via Buffer
  if (!receipt.platforms.linkedin?.postId && bufferToken) {
    try {
      console.log(`[publish-matrix] Posting to LinkedIn via Buffer (${post.id})...`);
      const postId = await postToBufferChannel(bufferToken, linkedInChannel, post.linkedinText, imageUrl, post.alt, fetcher);
      receipt.platforms.linkedin = {
        status: 'published',
        postId,
        channelId: linkedInChannel,
        publishedAt: new Date().toISOString(),
      };
    } catch (e) {
      console.error(`[publish-matrix] LinkedIn posting failed: ${e.message}`);
      receipt.platforms.linkedin = { status: 'failed', error: e.message };
    }
  }

  // 3. Post to Threads via Graph API
  if (!receipt.platforms.threads?.postId && threadsUserId && threadsToken) {
    try {
      console.log(`[publish-matrix] Posting to Threads via Graph API (${post.id})...`);
      const res = await postToThreads(threadsUserId, threadsToken, post.threadsText, imageUrl, fetcher);
      receipt.platforms.threads = {
        status: 'published',
        containerId: res.containerId,
        postId: res.postId,
        publishedAt: new Date().toISOString(),
      };
    } catch (e) {
      console.error(`[publish-matrix] Threads posting failed: ${e.message}`);
      receipt.platforms.threads = { status: 'failed', error: e.message };
    }
  }

  // Save receipt
  fs.mkdirSync(receiptsDir, { recursive: true });
  receipt.updatedAt = new Date().toISOString();
  fs.writeFileSync(receiptFile, JSON.stringify(receipt, null, 2), 'utf8');

  return receipt;
}

if (process.argv[1] && process.argv[1].endsWith('publish-matrix-social.mjs')) {
  const args = process.argv.slice(2);
  const modeArg = args.find((a) => a.startsWith('--mode='))?.split('=')[1] || 'publish';
  const dateArg = args.find((a) => a.startsWith('--date='))?.split('=')[1] || new Date().toISOString().slice(0, 10);
  const indexArg = args.find((a) => a.startsWith('--index='))?.split('=')[1];

  const manifest = loadManifest();
  const post = indexArg ? getPostByIndex(indexArg, manifest) : getPostForDate(dateArg, manifest);

  if (!post) {
    console.log(`[publish-matrix] No matrix post scheduled for date: ${dateArg} (index: ${indexArg || 'none'})`);
    process.exit(0);
  }

  console.log(`[publish-matrix] Selected post: #${post.index} "${post.title}" (${post.date}) [mode: ${modeArg}]`);
  publishMatrixPost({ post, mode: modeArg })
    .then((result) => {
      console.log('[publish-matrix] Result:', JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error('[publish-matrix] Fatal error:', err);
      process.exit(1);
    });
}
