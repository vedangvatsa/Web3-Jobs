import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { load } from 'cheerio';
import { chromium } from 'playwright';
import eventsJson from '../content/events-runtime.json';
import audit from '../content/events/ibw-description-audit.json';
import { buildEventSlugIndex } from '../src/lib/event-slug-index';
import type { Web3Event } from '../src/lib/events';

const events = eventsJson as Web3Event[];
const index = buildEventSlugIndex(events);
const digest = (text: string) => createHash('sha256').update(text).digest('hex');
const normalized = (text: string) => text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const human = { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document' };

async function main() {
  const ids = new Set<string>(), slugs = new Set<string>();
  const opaque: string[] = [];
  for (const event of events) {
    assert.ok(event.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(event.slug), `Readable root syntax: ${event.slug}`);
    assert.ok(!ids.has(event.id) && !slugs.has(event.slug), `Duplicate identity/root: ${event.slug}`);
    ids.add(event.id); slugs.add(event.slug);
    if (/^[a-z0-9]{8}$/.test(event.slug) && !normalized(event.name).split(' ').includes(event.slug)) opaque.push(event.slug);
    for (const alias of event.aliases || []) assert.equal(index.get(alias)?.id, event.id, `Alias ownership: ${alias}`);
  }
  assert.deepEqual(opaque, [], 'Canonical event URLs must not be opaque source IDs');
  for (const row of audit.rows) {
    const event = index.get(row.slug);
    assert.equal(event?.id, row.id, `${row.slug}: keep the original identity through a rename`);
    assert.equal(digest(event!.description!), row.afterSha256, `${row.slug}: reviewed copy reaches runtime in full`);
    if (row.decision === 'source-unavailable') {
      assert.equal(row.changed, false);
      assert.equal(row.beforeSha256, row.afterSha256);
      assert.ok(Date.parse(event!.descriptionSource!.fetchedAt) < Date.parse(audit.reviewedAt));
    }
  }
  const added = index.get('free-society-hackathon')!;
  assert.ok(added);
  assert.equal(index.get('freesocietyhackathon')?.id, added.id);
  assert.equal(added.sourceVerification?.eventId, 'evt-B6kmWqZYUUeTkIP');
  assert.equal(added.startDate, '2026-11-04T05:30:00.000Z');
  assert.equal(added.endDate, '2026-11-05T09:30:00.000Z');
  assert.equal(added.approvalRequired, true);
  assert.equal(added.price, 'Free');
  assert.match(added.description!, /4,800.*competition awards.*200.*conditional/);
  assert.ok(added.sideEventFor?.includes('ibw') && added.sideEventFor.includes('devcon'));
  assert.equal(index.get('ibt-mumbai')?.slug, 'india-blockchain-ai-tour-mumbai');
  assert.equal(index.get('tbe-devcon26')?.slug, 'afterdark-devcon');
  assert.equal(index.get('sidequest-happy-hour')?.startDate, '2026-11-04T14:00:00.000Z');
  assert.equal(index.get('near-quantus-happy-hour')?.startDate, '2026-11-05T12:30:00.000Z');
  const sideEvents = events.filter(event => event.sideEventFor?.includes('ibw'));
  assert.equal(sideEvents.length, audit.reviewed + 1);

  let origin = process.env.TEST_BASE_URL;
  let server: ReturnType<typeof spawn> | undefined;
  let logs = '';
  let browser;
  try {
    if (!origin) {
      const socket = net.createServer();
      socket.listen(0, '127.0.0.1');
      await once(socket, 'listening');
      const port = (socket.address() as net.AddressInfo).port;
      await new Promise<void>(resolve => socket.close(() => resolve()));
      origin = `http://localhost:${port}`;
      server = spawn(process.execPath, ['.next/standalone/server.js'], { env: { ...process.env, PORT: String(port), HOSTNAME: '127.0.0.1', NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] });
      server.stdout?.on('data', data => logs += data);
      server.stderr?.on('data', data => logs += data);
      for (let attempt = 0; ; attempt++) {
        if (server.exitCode !== null) throw new Error(logs);
        try { if ((await fetch(`${origin}/favicon.ico`)).ok) break; } catch {}
        assert.ok(attempt < 100, logs);
        await delay(200);
      }
    }
    const request = (pathname: string) => fetch(origin + pathname, { headers: human, redirect: 'manual', signal: AbortSignal.timeout(60000) });
    for (const event of sideEvents) {
      const response = await request(`/${event.slug}`);
      assert.equal(response.status, 200, event.slug);
      const $ = load(await response.text());
      assert.equal($('h1').first().text(), event.name);
      assert.equal($('link[rel="canonical"]').attr('href'), `https://hashtagweb3.com/${event.slug}`);
      const content = $('[data-event-description]').clone();
      content.find('p,li,h2,h3').append(' ');
      const text = normalized(content.text());
      for (const line of event.description!.split('\n').filter(Boolean)) {
        const expected = normalized(line.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1'));
        assert.ok(text.includes(expected), `${event.slug}: missing or truncated text: ${line.slice(0, 140)}`);
      }
      if (event.slug === 'ibw') {
        assert.equal(content.find('h2').filter((_, element) => $(element).text() === 'Speakers & Program').length, 0, 'Do not duplicate the complete speaker roster');
        const links = $('[aria-labelledby="side-events-heading"] a[href]').map((_, el) => $(el).attr('href')).get();
        assert.deepEqual(new Set(links), new Set(sideEvents.map(event => `/${event.slug}`)));
      }
    }
    let aliases = 0;
    for (const event of events) for (const alias of event.aliases || []) {
      const response = await request(`/${alias}?audit=ibw`);
      assert.ok([301, 308].includes(response.status), `${alias}: permanent alias redirect`);
      const target: URL = new URL(response.headers.get('location')!, origin);
      assert.equal(target.pathname, `/${event.slug}`);
      assert.equal(target.searchParams.get('audit'), 'ibw');
      aliases++;
    }
    const article = await request('/jio-perpetuals');
    assert.equal(article.status, 200);
    const $ = load(await article.text());
    assert.equal($('h1').first().text(), 'Bitget Lists Jio Pre-IPO Perpetual Futures');
    assert.equal($('.article-tweet-card').length, 2);
    for (const id of ['2110561653758816627', '2110313996469633507']) assert.ok($(`.article-tweet-card a[href*="/status/${id}"]`).length);
    assert.ok($('script[type="application/ld+json"]').toArray().some(element => $(element).text().includes('NewsArticle')));
    const news = await request('/news');
    assert.equal(news.status, 200);
    assert.ok(load(await news.text())('a[href="/jio-perpetuals"]').length, 'Native report appears on /news');

    browser = await chromium.launch({ headless: true });
    const failures: string[] = [];
    const context = await browser.newContext();
    await context.route('**/*', route => route.request().url().startsWith(origin!) ? route.continue() : route.fulfill({ status: 204, body: '' }));
    await context.addInitScript(() => localStorage.setItem('hw3_popup_dismissed', 'true'));
    const page = await context.newPage();
    page.on('pageerror', error => failures.push(error.message));
    page.on('console', message => { if (message.type() === 'error') failures.push(message.text()); });
    page.on('response', response => { if (response.url().startsWith(origin!) && response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    const samples = ['/ibw', '/defi-security-summit', '/ethereum-cypherpunk-congress', '/ethglobal-mumbai', '/eip-hub-devcon', '/free-society-hackathon', '/afterdark-devcon', '/india-blockchain-ai-tour-mumbai', '/jio-perpetuals', '/nomads'];
    for (const width of [320, 390, 1440]) for (const pathname of samples) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(origin + pathname, { waitUntil: 'networkidle', timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      for (const dark of [false, true]) {
        await page.evaluate(dark => document.documentElement.classList.toggle('dark', dark), dark);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${pathname}: overflow at ${width}, dark=${dark}`);
      }
      if (pathname === '/nomads') {
        const popups = page.locator('main [data-explorer-controls] a[href="/popups"]');
        assert.equal(await popups.textContent(), 'Popups');
        assert.equal(await popups.count(), 1);
        await popups.scrollIntoViewIfNeeded();
        assert.ok(await popups.isVisible());
        await popups.click();
        await page.waitForURL(origin + '/popups');
        await page.locator('main h1').waitFor();
      }
      if (pathname === '/jio-perpetuals') assert.equal(await page.locator('.article-tweet-card').count(), 2);
    }
    assert.deepEqual(failures, [], 'Browser errors and local failed resources');
    console.log(JSON.stringify({ events: events.length, reviewed: audit.reviewed, changedDescriptions: audit.changed, ibwPages: sideEvents.length, aliases, readableSlugs: true, newEvent: added.slug, tweets: 2, newsListing: true, popupsLink: true, viewports: [320, 390, 1440], themes: ['light', 'dark'], browserFailures: failures }, null, 2));
  } finally {
    await browser?.close();
    if (server && server.exitCode === null) {
      const exited = once(server, 'exit');
      server.kill('SIGTERM');
      await exited;
    }
    fs.mkdirSync('.cache/ibw-release', { recursive: true });
    fs.writeFileSync('.cache/ibw-release/.gitignore', '*\n');
    fs.writeFileSync('.cache/ibw-release/server.log', logs);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
