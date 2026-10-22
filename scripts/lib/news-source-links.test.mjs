import assert from 'node:assert/strict';
import test from 'node:test';
import { checkNewsSourceLinks } from './news-source-links.mjs';
import { NEWS_SOURCE_REQUEST_HEADERS } from './news-source-request.mjs';
import { SOURCE_READINESS_USER_AGENT } from './news-source-readiness.mjs';

const url = 'https://example.com/source';

test('publication checks use the same identifying request headers as source readiness', async () => {
  assert.equal(NEWS_SOURCE_REQUEST_HEADERS['User-Agent'], SOURCE_READINESS_USER_AGENT);
  const errors = await checkNewsSourceLinks([url], { fetchFn: async (_url, options) => {
    assert.deepEqual(options.headers, NEWS_SOURCE_REQUEST_HEADERS);
    assert.match(options.headers.Accept, /text\/html/);
    return new Response('Actual source response', { status: 200 });
  } });
  assert.deepEqual(errors, []);
});

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
