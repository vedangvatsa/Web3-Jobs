import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { gunzipSync, inflateSync } from 'node:zlib';
import { setTimeout as delay } from 'node:timers/promises';

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

function request(pathname: string, encoding?: string, method = 'GET', extraHeaders: http.OutgoingHttpHeaders = {}): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const req = http.request(origin + pathname, {
      method,
      headers: { ...(encoding === undefined ? {} : { 'Accept-Encoding': encoding }), ...extraHeaders },
      timeout: 30000,
    }, response => {
      const chunks: Buffer[] = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode || 0, headers: response.headers, body: Buffer.concat(chunks) }));
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

async function main() {
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
    for (const [pathname, contentType] of feeds) {
      assert.equal(manifest.routes[pathname]?.initialRevalidateSeconds, 3600, `Hourly ISR changed: ${pathname}`);
      const expected = fs.readFileSync(`.next/server/app${pathname}.body`);
      const identity = await request(pathname, 'identity');
      const gzip = await request(pathname, 'gzip');
      for (const response of [identity, gzip]) {
        assert.equal(response.status, 200, pathname);
        assert.equal(response.headers['content-type'], contentType, pathname);
        assert.equal(response.headers['cache-control'], 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400', pathname);
        assert.match(String(response.headers.vary), /\bAccept-Encoding\b/i, pathname);
        assert.equal(response.headers['x-nextjs-cache'], 'HIT', `Feed lost its Next.js cache: ${pathname}`);
        assert.deepEqual(decoded(response), expected, `Feed bytes changed: ${pathname}`);
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
      const expected = fs.readFileSync(`.next/server/app${pathname}.body`);
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
        assert.deepEqual(decoded(response), expected, `${pathname}: ${accept}`);
      }
      const conditional = await request(pathname, 'gzip', 'GET', { 'If-None-Match': '"not-this-feed"' });
      assert.equal(conditional.status, 200);
      assert.deepEqual(decoded(conditional), expected);
      assert.equal((await request(pathname, 'gzip', 'POST')).status, 405);
      const options = await request(pathname, 'gzip', 'OPTIONS');
      assert.equal(options.status, 405);
      assert.match(String(options.headers.allow), /GET/);
      assert.match(String(options.headers.allow), /HEAD/);
    }
    const missing = await request('/jobs/missing-feed.xml', 'gzip');
    assert.equal(missing.status, 404);
    assert.match(String(missing.headers['content-type']), /text\/html/);
    console.log(JSON.stringify({ feeds: results, byteIdenticalContents: true, hourlyISRAndCDNPolicyPreserved: true, encodingNegotiation: 'passed', headMethodsAndAgentResponses: 'passed' }, null, 2));
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
