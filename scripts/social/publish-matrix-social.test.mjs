import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  loadManifest,
  getPostForDate,
  getPostByIndex,
  remoteUrlForImage,
  publishMatrixPost,
} from './publish-matrix-social.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

test('matrix manifest loads all 10 scheduled entries with valid copy and links', () => {
  const manifest = loadManifest();
  assert.equal(manifest.length, 10);

  const dates = new Set();
  manifest.forEach((item, idx) => {
    assert.equal(item.index, idx + 1);
    assert.ok(item.date.startsWith('2026-'));
    dates.add(item.date);

    // Verify local image file exists in public/images/social/
    const localImg = path.join(ROOT, 'public/images/social', item.image);
    assert.ok(fs.existsSync(localImg), `Image file missing: ${item.image}`);

    // Verify link destinations
    assert.match(item.xText, /hashtagweb3\.com\/(nomads|visas|citizenship|jobs)\/x/);
    assert.match(item.threadsText, /hashtagweb3\.com\/(nomads|visas|citizenship|jobs)\/th/);
    assert.match(item.linkedinText, /hashtagweb3\.com\/(nomads|visas|citizenship|jobs)\/li/);

    // Verify alt text
    assert.ok(item.alt.length > 30, 'Alt text must be descriptive');
  });

  assert.equal(dates.size, 10, 'All 10 dates must be unique');
  assert.equal(manifest[0].date, '2026-10-29', 'Starts on 2026-10-29');
  assert.equal(manifest[9].date, '2026-11-07', 'Ends on 2026-11-07');
});

test('getPostForDate and getPostByIndex accurately locate entries', () => {
  const post1 = getPostForDate('2026-10-29');
  assert.ok(post1);
  assert.equal(post1.index, 1);
  assert.equal(post1.id, 'where-to-work-cost-vs-speed');

  const post10 = getPostByIndex(10);
  assert.ok(post10);
  assert.equal(post10.date, '2026-11-07');
  assert.equal(post10.id, 'where-to-build-web3');

  const nonExistent = getPostForDate('2026-01-01');
  assert.equal(nonExistent, undefined);
});

test('preflight mode verifies configuration without sending mutations', async () => {
  const post = getPostForDate('2026-10-29');
  const tempReceipts = path.join(ROOT, '.cache/test-matrix-receipts');

  const res = await publishMatrixPost({
    post,
    mode: 'preflight',
    env: {
      BUFFER_ACCESS_TOKEN: 'mock-buffer-token',
      THREADS_USER_ID: 'mock-threads-user',
      THREADS_ACCESS_TOKEN: 'mock-threads-token',
    },
    receiptsDir: tempReceipts,
  });

  assert.equal(res.status, 'preflight-ok');
  assert.equal(res.post, 'where-to-work-cost-vs-speed');
  assert.equal(res.hasBuffer, true);
  assert.equal(res.hasThreads, true);
});

test('publish mode creates posts across X, LinkedIn, and Threads using mocked fetch', async () => {
  const post = getPostForDate('2026-10-29');
  const tempReceipts = path.join(ROOT, '.cache/test-matrix-receipts');
  fs.mkdirSync(tempReceipts, { recursive: true });

  const calls = [];
  const mockFetcher = async (url, opts) => {
    calls.push({ url, body: opts?.body });
    if (url === 'https://api.buffer.com') {
      return {
        ok: true,
        json: async () => ({
          data: {
            createPost: {
              post: { id: `buf-id-${calls.length}` },
            },
          },
        }),
      };
    }
    if (url.includes('graph.threads.net') && url.endsWith('/threads')) {
      return {
        ok: true,
        json: async () => ({ id: 'mock-container-123' }),
      };
    }
    if (url.includes('mock-container-123')) {
      return {
        ok: true,
        json: async () => ({ status: 'FINISHED' }),
      };
    }
    if (url.includes('threads_publish')) {
      return {
        ok: true,
        json: async () => ({ id: 'mock-threads-post-456' }),
      };
    }
    throw new Error(`Unexpected mock URL: ${url}`);
  };

  const receipt = await publishMatrixPost({
    post,
    mode: 'publish',
    env: {
      BUFFER_ACCESS_TOKEN: 'test-buffer-token',
      THREADS_USER_ID: 'test-user-id',
      THREADS_ACCESS_TOKEN: 'test-threads-token',
    },
    fetcher: mockFetcher,
    receiptsDir: tempReceipts,
  });

  assert.equal(receipt.platforms.x.status, 'published');
  assert.equal(receipt.platforms.linkedin.status, 'published');
  assert.equal(receipt.platforms.threads.status, 'published');
  assert.equal(receipt.platforms.threads.postId, 'mock-threads-post-456');

  // Verify saved receipt on disk
  const saved = JSON.parse(fs.readFileSync(path.join(tempReceipts, '2026-10-29.json'), 'utf8'));
  assert.equal(saved.id, 'where-to-work-cost-vs-speed');
  assert.equal(saved.platforms.threads.postId, 'mock-threads-post-456');

  // Clean up test cache
  fs.rmSync(tempReceipts, { recursive: true, force: true });
});
