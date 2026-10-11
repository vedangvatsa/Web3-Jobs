import assert from 'node:assert/strict';
import test from 'node:test';
import { checkNewsSourceLinks } from './news-source-links.mjs';

const url = 'https://example.com/source';

test('a transient network or server failure gets one retry and still requires HTTP 200', async () => {
  for (const first of [() => { throw new Error('Temporary network failure'); }, () => new Response('', { status: 503 })]) {
    let calls = 0, waits = 0;
    const errors = await checkNewsSourceLinks([url], { fetchFn: async () => ++calls === 1 ? first() : new Response('Read the source'), wait: async () => { waits++; } });
    assert.deepEqual(errors, []); assert.equal(calls, 2); assert.equal(waits, 1);
  }
});

test('persistent unavailability remains a blocking error after the bounded retry', async () => {
  let calls = 0;
  const errors = await checkNewsSourceLinks([url], { fetchFn: async () => { calls++; throw new Error('Unavailable'); }, wait: async () => {} });
  assert.equal(calls, 2); assert.deepEqual(errors, [`Source link unavailable: ${url}`]);
});

test('access denials, missing sources and rate limits are not retried or treated as successful', async () => {
  for (const status of [403, 404, 429]) {
    let calls = 0;
    const errors = await checkNewsSourceLinks([url], { fetchFn: async () => { calls++; return new Response('', { status }); }, wait: async () => assert.fail('Must respect a denial or rate limit') });
    assert.equal(calls, 1); assert.deepEqual(errors, [`Source link HTTP ${status}: ${url}`]);
  }
});

test('a longer Retry-After is respected by leaving the source blocked for a later run', async () => {
  let calls = 0;
  const errors = await checkNewsSourceLinks([url], { fetchFn: async () => { calls++; return new Response('', { status: 503, headers: { 'Retry-After': '60' } }); }, wait: async () => assert.fail('Must not retry before the requested delay') });
  assert.equal(calls, 1); assert.deepEqual(errors, [`Source link HTTP 503: ${url}`]);
});

test('invalid or private source URLs never trigger requests', async () => {
  const urls = ['file:///tmp/source', 'http://127.0.0.1/source', 'https://name:password@example.com/source'];
  const errors = await checkNewsSourceLinks(urls, { fetchFn: () => assert.fail('Invalid source request') });
  assert.equal(errors.length, urls.length);
});
