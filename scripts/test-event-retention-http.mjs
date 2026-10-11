import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { tombstoneSlugs } from './lib/event-retention.mjs';

const listener = net.createServer();
listener.listen(0, '127.0.0.1');
await once(listener, 'listening');
const port = listener.address().port;
await new Promise(resolve => listener.close(resolve));
const server = spawn(process.execPath, ['.next/standalone/server.js'], { env: { ...process.env, PORT: String(port), HOSTNAME: '127.0.0.1', NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';
server.stdout.on('data', data => { logs += data; });
server.stderr.on('data', data => { logs += data; });
const origin = `http://127.0.0.1:${port}`;
const request = (pathname, bot = false, method = 'GET') => fetch(`${origin}${pathname}`, {
  method, redirect: 'manual', signal: AbortSignal.timeout(20000),
  headers: bot ? { 'User-Agent': 'LinkedInBot/1.0' } : { 'User-Agent': 'Mozilla/5.0', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document' },
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(logs);
    try { await request('/favicon.ico'); ready = true; break; } catch { await delay(100); }
  }
  assert.ok(ready, logs);
  const slugs = tombstoneSlugs(JSON.parse(fs.readFileSync('content/event-tombstones.json', 'utf8')));
  assert.ok(slugs.size);
  for (const slug of slugs) {
    const response = await request(`/${slug}`);
    assert.equal(response.status, 410, `/${slug}: ${response.status}`);
    assert.equal(response.headers.get('location'), null, `/${slug} must not redirect first`);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
  const slug = [...slugs][0];
  for (const pathname of [`/${slug}/li?mode=agent`, `/preview/${slug}.html`, `/${slug}?anything=1`]) {
    for (const method of ['GET', 'HEAD']) assert.equal((await request(pathname, true, method)).status, 410, pathname);
  }
  assert.equal((await request('/event-retention-unassigned-test-url')).status, 404);
  for (const city of ['london', 'istanbul', 'taipei']) assert.equal((await request(`/${city}`)).status, 200, city);
  console.log(`Production HTTP retention passed: ${slugs.size} root/alias URLs return 410; crawler, preview and HEAD responses agree; unknown URL is 404; shared city URLs stay 200.`);
} finally {
  server.kill('SIGTERM');
  await once(server, 'exit');
}
