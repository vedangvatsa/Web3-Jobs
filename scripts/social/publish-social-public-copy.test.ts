import test from 'node:test';
import assert from 'node:assert/strict';
import { postToLinkedIn, postToInstagram, postToTwitter, postToBluesky, postToThreads } from './publish-social';
import { schedulePost } from './buffer-refill';

test('generic direct creates reject leakage and unreadable text before any provider request', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; throw new Error('Unexpected provider request'); });
  for (const create of [postToLinkedIn, postToInstagram, postToTwitter, postToBluesky, postToThreads]) {
    for (const text of ['Model output, not observed pay.', 'Parent: instructions', 'First paragraph \n\nSecond.', 'a'.repeat(211)]) {
      await assert.rejects(create(text, ''), /PUBLIC copy/);
    }
  }
  assert.equal(calls, 0);
});

test('generic X sends approved paragraphs, hashtags and URL unchanged', async t => {
  const keys = ['X_CONSUMER_KEY', 'X_CONSUMER_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_TOKEN_SECRET'];
  const before = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  keys.forEach(key => { process.env[key] = 'offline-test'; });
  t.after(() => { for (const key of keys) if (before[key] === undefined) delete process.env[key]; else process.env[key] = before[key]; });
  const text = 'Run forge test before sharing the example.\n\nRead hashtagweb3.com/learn/x #Web3';
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
    calls++;
    assert.equal(url, 'https://api.twitter.com/2/tweets');
    assert.equal(JSON.parse(String(init.body)).text, text);
    return new Response(JSON.stringify({ data: { id: 'offline-post' } }), { status: 200 });
  });
  assert.equal(await postToTwitter(text, ''), 'offline-post');
  assert.equal(calls, 1);
});

test('generic Buffer refill refuses production notes at the actual mutation boundary', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; throw new Error('Unexpected provider request'); });
  for (const text of ['Model-only estimates.', 'Reviewer: replace this caption.', 'a'.repeat(211)]) {
    await assert.rejects(schedulePost('offline-channel', text, 'https://example.test/image.jpg', '2026-10-23T11:30:00Z', false), /buffer\.createPost\.input\.text: PUBLIC copy/);
  }
  assert.equal(calls, 0);
});
