import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import puppeteer from 'puppeteer';
import { getEvents } from '../src/lib/events-server';
import { getEventListItem } from '../src/lib/event-public';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import { getEventSlug, isEventUpcoming } from '../src/lib/events';

const origin = 'http://127.0.0.1:3162';
function wireBytes(url: string): Promise<{ bytes: number; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    http.get(url, { headers: { 'Accept-Encoding': 'gzip' } }, response => {
      let bytes = 0;
      response.on('data', chunk => { bytes += chunk.length; });
      response.on('end', () => resolve({ bytes, headers: response.headers }));
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const standalone = path.resolve('.next/standalone');
  fs.cpSync('.next/static', path.join(standalone, '.next/static'), { recursive: true });
  const server = spawn(process.execPath, [path.join(standalone, 'server.js')], {
    cwd: standalone, env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: '3162', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  server.stdout.on('data', chunk => { logs += chunk; });
  server.stderr.on('data', chunk => { logs += chunk; });
  let browser;
  try {
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      try { ready = (await fetch(`${origin}/data/companies-runtime.json`)).ok; } catch {}
      if (ready) break;
      if (server.exitCode !== null) throw new Error(logs);
      await delay(500);
    }
    assert.ok(ready, logs);
    const redirects = JSON.parse(fs.readFileSync('content/image-redirects.json', 'utf8')) as Record<string, string>;
    for (const [legacy, current] of Object.entries(redirects)) {
      const response = await fetch(origin + legacy, { method: 'HEAD', redirect: 'manual' });
      assert.equal(response.status, 308, `${legacy}: missing compatibility redirect`);
      assert.equal(new URL(response.headers.get('location')!, origin).pathname, current);
      assert.equal((await fetch(origin + current, { method: 'HEAD' })).status, 200);
    }
    for (const legacy of JSON.parse(fs.readFileSync('content/legacy-image-paths.json', 'utf8')) as string[]) {
      assert.equal((await fetch(origin + legacy, { method: 'HEAD' })).status, 200, `${legacy}: legacy poster missing`);
    }
    for (const slug of ['5kdau1ak', '6mv7bwxa', '4w8pwahc', 'm88fff37']) {
      const response = await fetch(`${origin}/${slug}/tg`, { headers: { 'User-Agent': 'TelegramBot' } });
      assert.equal(response.status, 200);
      const html = await response.text();
      const image = html.match(/property="og:image" content="([^"]+)"/)?.[1];
      assert.ok(image);
      assert.equal((await fetch(origin + new URL(image).pathname, { method: 'HEAD' })).status, 200, `Broken legacy preview /${slug}`);
    }
    const measured = await wireBytes(`${origin}/events`);
    assert.ok(measured.bytes < 220_000, `Events HTML exceeds gzip budget: ${measured.bytes}`);
    assert.equal(measured.headers['content-encoding'], 'gzip');
    assert.match(String(measured.headers['cache-control']), /s-maxage=\d+/);
    assert.doesNotMatch(String(measured.headers['cache-control']), /private|no-store/);
    const rsc = await fetch(`${origin}/events?_rsc=budget`, { headers: { RSC: '1', 'Next-Router-Prefetch': '1' } });
    assert.match(rsc.headers.get('content-type') || '', /text\/x-component/);
    assert.doesNotMatch(rsc.headers.get('cache-control') || '', /private|no-store/);
    await rsc.text();
    const agent = await fetch(`${origin}/events?mode=agent`);
    assert.ok(agent.ok);
    assert.match(agent.headers.get('content-type') || '', /json/);
    await agent.json();
    for (const pathname of ['/data/events-runtime.json', '/data/jobs-runtime.json']) {
      const response = await fetch(origin + pathname, { method: 'HEAD' });
      assert.match(response.headers.get('cache-control') || '', /public.*max-age=300/);
    }
    const coverPath = '/events/luma-batch-evtea0ExPMp9jrB1-9bea2588.jpg';
    const cover = await fetch(origin + coverPath, { method: 'HEAD' });
    assert.equal(cover.status, 200);
    assert.ok(Number(cover.headers.get('content-length')) < 200_000);
    assert.match(cover.headers.get('cache-control') || '', /public.*max-age=86400/);
    for (const pathname of ['/api/jobs', '/api/og', '/.env', '/wp-content/test.php']) {
      const response = await fetch(origin + pathname);
      assert.equal(response.status, 404);
      assert.ok((await response.text()).length < 100);
    }
    const social = await fetch(`${origin}/token2049/tg`, { headers: { 'User-Agent': 'TelegramBot' }, redirect: 'manual' });
    assert.equal(social.status, 200);
    assert.ok((await social.text()).includes('og:image'));

    browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || puppeteer.executablePath(), headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    const page = await context.newPage();
    const requests: string[] = [];
    const errors: string[] = [];
    page.on('request', request => requests.push(request.url()));
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin, { waitUntil: 'load' });
    await delay(2000);
    await page.locator('footer').scrollIntoViewIfNeeded();
    await delay(1500);
    assert.equal(requests.some(url => new URL(url).pathname === '/events'), false, 'Homepage/footer must not prefetch Events');
    await page.locator('header nav a[href="/events"]').click();
    await page.waitForURL(`${origin}/events`);
    await page.getByRole('heading', { name: 'Web3 Events', exact: true }).waitFor();
    assert.equal(requests.some(url => url.includes('/data/events-runtime.json')), false, 'Browsing cards must not download full descriptions');
    const events = (await getEvents()).filter(event => isEventUpcoming(event));
    const searchCase = events.flatMap(event => {
      const summary = getEventListItem(event);
      const needle = getVerifiedEventDescription(event).slice(300).match(/\b[a-zA-Z]{10,}\b/g)?.find(word => !`${summary.name} ${summary.location} ${summary.description}`.toLowerCase().includes(word.toLowerCase()));
      return needle ? [{ event, needle }] : [];
    })[0];
    assert.ok(searchCase, 'Need a description-only match beyond the listing excerpt');
    const search = page.getByRole('textbox', { name: 'Search events' });
    await search.fill(searchCase.needle);
    await page.locator(`main a[href="/${getEventSlug(searchCase.event)}"]`).first().waitFor();
    assert.equal(requests.filter(url => url.includes('/data/events-runtime.json')).length, 1);
    await search.fill('Singapore');
    await delay(300);
    assert.equal(requests.filter(url => url.includes('/data/events-runtime.json')).length, 1, 'Search must reuse its downloaded catalog');
    await search.fill('');
    await page.getByRole('button', { name: 'Calendar View', exact: true }).click();
    await page.getByRole('button', { name: 'Map View', exact: true }).click();
    await page.getByRole('heading', { name: 'Event locations', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Grid View', exact: true }).click();
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.getByRole('button', { name: 'Map View', exact: true }).click();
      await page.getByRole('heading', { name: 'Event locations', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Grid View', exact: true }).click();
    }
    await delay(300);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const dark of [false, true]) {
        await page.evaluate(dark => document.documentElement.classList.toggle('dark', dark), dark);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      }
    }
    await page.goto(`${origin}/token2049`, { waitUntil: 'load' });
    assert.ok((await page.locator('[data-event-description]').innerText()).length > 500);
    await page.getByRole('heading', { name: 'Side Events', exact: true }).waitFor();
    assert.deepEqual(errors, [], 'No browser runtime errors');
    console.log(`Production bandwidth checks passed: /events gzip=${measured.bytes} bytes; ${Object.keys(redirects).length} working image redirects; legacy preview repairs; no background Events download; full-text search fetched once; map/calendar, mobile, cache headers, compact 404s and full detail content preserved.`);
  } finally {
    await browser?.close();
    server.kill('SIGTERM');
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
