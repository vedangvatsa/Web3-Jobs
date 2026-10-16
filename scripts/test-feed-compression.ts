import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { deflateSync, gunzipSync, gzipSync, inflateSync } from 'node:zlib';
import { setTimeout as delay } from 'node:timers/promises';
import { isJobAgeEligible } from '../src/lib/job-age-policy.mjs';
import { jobExpiryTime } from '../src/lib/job-age-cache.mjs';

const origin = 'http://127.0.0.1:3185';
const feeds = new Map([
  ['/jobs/feed.json', 'application/feed+json; charset=utf-8'],
  ['/jobs/feed.xml', 'application/rss+xml; charset=utf-8'],
  ['/events/feed.xml', 'application/rss+xml; charset=utf-8'],
  ['/jobs/adzuna.xml', 'application/xml; charset=utf-8'],
  ['/jobs/jora.xml', 'application/xml; charset=utf-8'],
  ['/jobs/feed-aggregator-us.xml', 'application/xml; charset=utf-8'],
  ['/adzuna.xml', 'application/xml; charset=utf-8'],
  ['/jooble.xml', 'application/xml; charset=utf-8'],
  ['/myjobhelper.xml', 'application/xml; charset=utf-8'],
]);

type ResponseTiming = { startedAt: number; completedAt: number };
type FeedResponse = ResponseTiming & { status: number; headers: http.IncomingHttpHeaders; body: Buffer };

function request(pathname: string, encoding?: string, method = 'GET', extraHeaders: http.OutgoingHttpHeaders = {}): Promise<FeedResponse> {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const req = http.request(origin + pathname, {
      method,
      headers: { ...(encoding === undefined ? {} : { 'Accept-Encoding': encoding }), ...extraHeaders },
      timeout: 30000,
    }, response => {
      const chunks: Buffer[] = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const completedAt = Date.now();
        resolve({ status: response.statusCode || 0, headers: response.headers, body: Buffer.concat(chunks), startedAt, completedAt });
      });
      response.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error(`Timed out: ${pathname}`)));
    req.on('error', reject);
    req.end();
  });
}

function decoded(response: Awaited<ReturnType<typeof request>>) {
  if (response.headers['content-encoding'] === 'gzip') return gunzipSync(response.body);
  if (response.headers['content-encoding'] === 'deflate') return inflateSync(response.body);
  assert.equal(response.headers['content-encoding'], undefined);
  return response.body;
}

function comparableFeed(body: Buffer, pathname: string, { startedAt, completedAt }: ResponseTiming): Buffer {
  if (pathname !== '/jobs/feed.xml') return body;
  const xml = body.toString();
  const match = /<lastBuildDate>([^<]*)<\/lastBuildDate>/.exec(xml);
  assert.ok(match, `Missing dynamic RSS build date: ${pathname}`);
  const builtAt = Date.parse(match[1]);
  // RSS dates truncate milliseconds; use this response's interval, even when compared much later.
  assert.ok(Number.isFinite(builtAt) && builtAt >= Math.floor(startedAt / 1000) * 1000 && builtAt <= completedAt,
    `Dynamic RSS build date must describe this response: ${pathname}, date=${match[1]}, startedAt=${startedAt}, completedAt=${completedAt}`);
  return Buffer.from(xml.replace(match[0], '<lastBuildDate>response-time</lastBuildDate>'));
}

function testResponseTiming() {
  const pathname = '/jobs/feed.xml';
  const startedAt = Date.parse('2026-10-16T04:15:00.999Z');
  const timing = { startedAt, completedAt: startedAt + 25 };
  const xml = (date: string, title = 'Fixture job') => Buffer.from(`<rss><channel><lastBuildDate>${date}</lastBuildDate><item><title>${title}</title><pubDate>Fri, 16 Oct 2026 03:00:00 GMT</pubDate></item></channel></rss>`);
  const body = xml(new Date(startedAt).toUTCString());
  const originalNow = Date.now;
  let now = timing.completedAt;
  Date.now = () => now;
  try {
    const expected = comparableFeed(body, pathname, timing);
    now += 65000;
    assert.deepEqual(comparableFeed(body, pathname, timing), expected, 'A saved baseline remains valid after other feed checks take over a minute');

    const slowTiming = { startedAt: now, completedAt: now + 65000 };
    const slowBody = xml(new Date(now + 1200).toUTCString());
    now = slowTiming.completedAt + 65000;
    for (const [encoding, compress] of [['gzip', gzipSync], ['deflate', deflateSync]] as const) {
      const response: FeedResponse = { ...slowTiming, status: 200, headers: { 'content-encoding': encoding }, body: compress(slowBody) };
      assert.deepEqual(comparableFeed(decoded(response), pathname, response), expected, `${encoding}: valid slow transfer and delayed decoding`);
    }

    assert.throws(() => comparableFeed(body, pathname, slowTiming), /Dynamic RSS build date/, 'Replaying the baseline as a later response must fail');
    for (const date of [
      new Date(Math.floor(timing.startedAt / 1000) * 1000 - 1000).toUTCString(),
      new Date(Math.floor(timing.completedAt / 1000) * 1000 + 1000).toUTCString(),
      'not-a-date',
      '',
    ]) {
      assert.throws(() => comparableFeed(xml(date), pathname, timing), /Dynamic RSS build date/, `Reject out-of-interval or invalid date: ${date}`);
    }
    assert.throws(() => comparableFeed(Buffer.from('<rss><channel/></rss>'), pathname, timing), /Missing dynamic RSS build date/);
    const changed = xml(new Date(timing.startedAt).toUTCString(), 'Changed job');
    assert.throws(() => assert.deepEqual(comparableFeed(changed, pathname, timing), expected), assert.AssertionError, 'Only the build date may differ');

    const eventBody = xml('Thu, 15 Oct 2026 12:00:00 GMT');
    assert.deepEqual(comparableFeed(eventBody, '/events/feed.xml', timing), eventBody, 'ISR event dates stay byte-identical');
    assert.deepEqual(comparableFeed(body, '/jobs/feed.json', timing), body, 'Other feed paths are not normalized');
    console.log('RSS response timing passed: second precision, delayed baseline, slow gzip/deflate, stale/future/invalid/missing rejection, content-byte identity and static event dates.');
  } finally {
    Date.now = originalNow;
  }
}

async function main() {
  testResponseTiming();
  if (process.argv.includes('--self-test')) return;
  const standalone = path.resolve('.next/standalone');
  const manifest = JSON.parse(fs.readFileSync('.next/prerender-manifest.json', 'utf8'));
  const server = spawn(process.execPath, [path.join(standalone, 'server.js')], {
    cwd: standalone,
    env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: '3185' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  server.stdout.on('data', chunk => logs += chunk);
  server.stderr.on('data', chunk => logs += chunk);
  const results = [];
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (server.exitCode !== null) throw new Error(logs);
      try { ready = (await request('/icon.png')).status === 200; } catch {}
      if (ready) break;
      await delay(200);
    }
    assert.ok(ready, logs);
    const agent = fs.readFileSync('public/agent-view.json');
    const expectedBodies = new Map<string, Buffer>();
    for (const [pathname, contentType] of feeds) {
      const isEventFeed = pathname === '/events/feed.xml';
      if (isEventFeed) assert.equal(manifest.routes[pathname]?.initialRevalidateSeconds, 3600, `Hourly ISR changed: ${pathname}`);
      else assert.equal(manifest.routes[pathname], undefined, `Job feed must filter expiry on a shared-cache miss: ${pathname}`);
      const identity = await request(pathname, 'identity');
      const gzip = await request(pathname, 'gzip');
      const expected = isEventFeed ? fs.readFileSync(`.next/server/app${pathname}.body`) : decoded(identity);
      const comparableExpected = comparableFeed(expected, pathname, identity);
      expectedBodies.set(pathname, comparableExpected);
      for (const response of [identity, gzip]) {
        assert.equal(response.status, 200, pathname);
        assert.equal(response.headers['content-type'], contentType, pathname);
        if (isEventFeed) {
          assert.equal(response.headers['cache-control'], 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400', pathname);
          assert.equal(response.headers['x-nextjs-cache'], 'HIT', `Event feed lost its Next.js cache: ${pathname}`);
        } else {
          const control = String(response.headers['cache-control']);
          assert.match(control, /^public, max-age=0, s-maxage=\d+, must-revalidate$|^no-store$/, pathname);
          assert.doesNotMatch(control, /stale/, pathname);
          const ttl = Number(control.match(/s-maxage=(\d+)/)?.[1] || 0);
          assert.ok(ttl <= 3600, `Unbounded job-feed cache: ${pathname}`);
          if (ttl) assert.equal(Date.parse(String(response.headers.expires)), Date.parse(String(response.headers.date)) + ttl * 1000, pathname);
        }
        assert.match(String(response.headers.vary), /\bAccept-Encoding\b/i, pathname);
        assert.deepEqual(comparableFeed(decoded(response), pathname, response), comparableExpected, `Feed bytes changed: ${pathname}`);
      }
      if (pathname === '/jobs/feed.json') {
        const items = JSON.parse(expected.toString()).items;
        const now = Date.now();
        assert.ok(items.every((item: { date_published: string }) => isJobAgeEligible({ date: item.date_published }, now)), 'Expired or invalid job in JSON feed');
        const ttl = Number(String(identity.headers['cache-control']).match(/s-maxage=(\d+)/)?.[1] || 0);
        if (ttl) for (const item of items) assert.ok(Date.parse(String(identity.headers.date)) + ttl * 1000 < jobExpiryTime({ date: item.date_published }), 'Feed cache extends past posting expiry');
      }
      assert.equal(identity.headers['content-encoding'], undefined, pathname);
      assert.equal(gzip.headers['content-encoding'], 'gzip', pathname);
      assert.ok(gzip.body.length < expected.length * 0.85, `No meaningful compression: ${pathname}`);
      const head = await request(pathname, 'gzip', 'HEAD');
      assert.equal(head.status, 200, pathname);
      assert.equal(head.body.length, 0, pathname);
      assert.equal(head.headers['content-type'], contentType, pathname);
      const agentResponse = await request(`${pathname}?mode=agent&source=compatibility-check`, 'gzip');
      assert.equal(agentResponse.status, 200, pathname);
      if (pathname === '/events/feed.xml') {
        assert.equal(agentResponse.headers['content-type'], contentType);
        assert.deepEqual(decoded(agentResponse), expected);
      } else {
        assert.match(String(agentResponse.headers['content-type']), /application\/json/i, `Agent content type was overwritten: ${pathname}`);
        assert.deepEqual(decoded(agentResponse), agent, `Agent response changed: ${pathname}`);
      }
      results.push({ pathname, identityBytes: expected.length, gzipBytes: gzip.body.length, savedPercent: Math.round((1 - gzip.body.length / expected.length) * 1000) / 10 });
    }
    for (const pathname of ['/jobs/feed.xml', '/jobs/feed.json']) {
      const expected = expectedBodies.get(pathname)!;
      for (const [accept, encoding] of [
        [undefined, undefined],
        ['', undefined],
        ['gzip;q=0', undefined],
        ['br', undefined],
        ['identity;q=1, gzip;q=0.2', undefined],
        ['GZip', 'gzip'],
        ['gzip;q=0, deflate;q=1', 'deflate'],
        ['*', 'gzip'],
      ]) {
        const response = await request(`${pathname}?source=encoding-check`, accept);
        assert.equal(response.status, 200);
        assert.equal(response.headers['content-encoding'], encoding, `${pathname}: ${accept}`);
        assert.deepEqual(comparableFeed(decoded(response), pathname, response), expected, `${pathname}: ${accept}`);
      }
      const conditional = await request(pathname, 'gzip', 'GET', { 'If-None-Match': '"not-this-feed"' });
      assert.equal(conditional.status, 200);
      assert.deepEqual(comparableFeed(decoded(conditional), pathname, conditional), expected);
      assert.equal((await request(pathname, 'gzip', 'POST')).status, 405);
      const options = await request(pathname, 'gzip', 'OPTIONS');
      assert.equal(options.status, 204);
      assert.equal(options.body.length, 0);
      assert.match(String(options.headers.allow), /GET/);
      assert.match(String(options.headers.allow), /HEAD/);
      assert.match(String(options.headers.allow), /OPTIONS/);
      assert.doesNotMatch(String(options.headers.allow), /POST|PUT|PATCH|DELETE/);
    }
    const missing = await request('/jobs/missing-feed.xml', 'gzip');
    assert.equal(missing.status, 404);
    assert.match(String(missing.headers['content-type']), /text\/html/);
    console.log(JSON.stringify({ feeds: results, byteIdenticalContentsExceptRssBuildTime: true, eventHourlyISRPreserved: true, jobExpiryBoundedSharedCache: true, encodingNegotiation: 'passed', headMethodsAndAgentResponses: 'passed' }, null, 2));
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
