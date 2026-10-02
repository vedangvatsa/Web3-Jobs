import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import puppeteer from 'puppeteer';
import { getAllTerms } from '../src/lib/glossary';

const origin = 'http://127.0.0.1:3182';
const baselinePath = '.cache/cost-savings-baseline.json';
const record = process.argv.includes('--record-baseline');
const currentCatalogs = process.argv.includes('--current-catalogs');
const sha = (text: string) => createHash('sha256').update(text).digest('hex');

function request(pathname: string): Promise<{ text: string; bytes: number; headers: http.IncomingHttpHeaders; status: number }> {
  return new Promise((resolve, reject) => {
    http.get(origin + pathname, { headers: { 'Accept-Encoding': 'gzip' } }, response => {
      const chunks: Buffer[] = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const text = (response.headers['content-encoding'] === 'gzip' ? gunzipSync(buffer) : buffer).toString('utf8');
        resolve({ text, bytes: buffer.length, headers: response.headers, status: response.statusCode || 0 });
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const terms = await getAllTerms();
  const allSlugs = terms.map(term => `/${term.slug}`);
  const standalone = path.resolve('.next/standalone');
  fs.cpSync('.next/static', path.join(standalone, '.next/static'), { recursive: true });
  const server = spawn(process.execPath, [path.join(standalone, 'server.js')], { cwd: standalone, env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: '3182' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  server.stdout.on('data', chunk => logs += chunk);
  server.stderr.on('data', chunk => logs += chunk);
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) { try { ready = (await fetch(`${origin}/icon.png`)).ok; } catch {} if (ready) break; await delay(300); }
    assert.ok(ready, logs);
    const glossary = await request('/glossary');
    assert.equal(glossary.status, 200);
    const feeds: Record<string, string> = {};
    for (const pathname of ['/jobs/feed.json', '/jobs/feed.xml']) {
      const response = await request(pathname);
      assert.equal(response.status, 200, pathname);
      assert.match(String(response.headers['cache-control']), /max-age=3600/);
      feeds[pathname] = sha(response.text.replace(/<lastBuildDate>[^<]*<\/lastBuildDate>/, ''));
      if (pathname.endsWith('.json')) {
        const feed = JSON.parse(response.text);
        assert.equal(feed.version, 'https://jsonfeed.org/version/1.1');
        assert.equal(feed.items.length, 100);
        assert.ok(feed.items.every((item: { url: string }) => item.url.startsWith('https://hashtagweb3.com/')));
      } else assert.ok((response.text.match(/<item>/g) || []).length > 0);
    }
    if (!record) {
      for (const pathname of ['/jobs/feed.json', '/jobs/feed.xml', '/jobs/adzuna.xml', '/jobs/jora.xml', '/jobs/feed-aggregator-us.xml', '/adzuna.xml', '/jooble.xml', '/myjobhelper.xml', '/events/feed.xml']) {
        const response = await request(pathname);
        assert.equal(response.status, 200, pathname);
        assert.equal(sha(response.text), sha(fs.readFileSync(`.next/server/app${pathname}.body`, 'utf8')), `Feed response differs from its generated content: ${pathname}`);
        assert.doesNotMatch(String(response.headers['cache-control']), /private|no-store/, `Feed is not publicly cacheable: ${pathname}`);
      }
      const agent = await (await fetch(`${origin}/agent-view.json`)).json();
      for (const pathname of ['/jobs/feed.json', '/jobs/feed.xml', '/jobs/adzuna.xml', '/jobs/jora.xml', '/jobs/feed-aggregator-us.xml', '/adzuna.xml', '/jooble.xml', '/myjobhelper.xml', '/sitemap.xml', '/glossary']) {
        const response = await fetch(`${origin}${pathname}?mode=agent`);
        assert.equal(response.status, 200, pathname);
        assert.deepEqual(await response.json(), agent, `Agent behavior changed: ${pathname}`);
      }
      const eventFeed = await fetch(`${origin}/events/feed.xml?mode=agent`);
      assert.match(eventFeed.headers.get('content-type') || '', /xml/);
      assert.match(await eventFeed.text(), /<rss/);
      const social = await fetch(`${origin}/glossary`, { headers: { 'User-Agent': 'TelegramBot' } });
      assert.equal(social.status, 200);
      assert.match(await social.text(), /og:title[^>]+Blockchain Glossary/);
    }

    browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || puppeteer.executablePath(), headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    await context.addInitScript(() => localStorage.setItem('hw3_popup_dismissed', 'true'));
    const page = await context.newPage();
    const errors: string[] = [], requests: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', req => requests.push(req.url()));
    await page.goto(`${origin}/glossary`, { waitUntil: 'load' });
    const waitForCards = async (slugs: string[]) => page.waitForFunction(({ expected, known }) => {
      const actual = Array.from(document.querySelectorAll('main a')).filter(anchor => anchor.querySelector('h3') && known.includes(anchor.getAttribute('href') || '')).map(anchor => anchor.getAttribute('href')).sort();
      return JSON.stringify(actual) === JSON.stringify([...expected].sort());
    }, { expected: slugs.map(slug => `/${slug}`), known: allSlugs });
    await waitForCards(terms.map(term => term.slug));
    const cards = await page.locator('main a:has(h3)').evaluateAll(anchors => anchors.map(anchor => ({ href: anchor.getAttribute('href'), title: anchor.querySelector('h3')?.textContent, description: anchor.querySelector('p')?.textContent })));
    await page.locator('footer').scrollIntoViewIfNeeded();
    await delay(800);
    if (!record) assert.equal(requests.some(url => new URL(url).searchParams.has('_rsc') && allSlugs.includes(new URL(url).pathname)), false, 'Scrolling the directory fetched unopened term pages');
    const search = page.getByRole('textbox', { name: 'Search glossary terms' });
    const synonym = terms.flatMap(term => term.synonyms || []).find(value => value.length > 5)!;
    assert.ok(synonym);
    await search.fill(synonym);
    await waitForCards(terms.filter(term => [term.term, term.description, term.category, ...(term.synonyms || [])].some(value => value.toLowerCase().includes(synonym.toLowerCase()))).map(term => term.slug));
    await search.fill('');
    await page.getByRole('combobox', { name: 'Filter by letter' }).selectOption('A');
    await waitForCards(terms.filter(term => term.term.toUpperCase().startsWith('A')).map(term => term.slug));
    await page.getByRole('combobox', { name: 'Filter by letter' }).selectOption('');
    await page.getByRole('combobox', { name: 'Filter by category' }).selectOption('security');
    await page.waitForURL(url => url.searchParams.get('category') === 'security');
    await waitForCards(terms.filter(term => term.category.toLowerCase().replace(/\s+/g, '-') === 'security').map(term => term.slug));
    await page.getByRole('link', { name: 'All Terms', exact: true }).click();
    await waitForCards(terms.map(term => term.slug));
    await search.fill('hashtagweb3-no-matching-term');
    await waitForCards([]);
    await page.getByRole('button', { name: 'Clear all filters', exact: true }).click();
    await waitForCards(terms.map(term => term.slug));
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    }
    await page.locator('main a[href="/bitcoin"]').click();
    await page.waitForURL(`${origin}/bitcoin`);
    await page.getByRole('heading', { level: 1, name: 'Bitcoin', exact: true }).waitFor();
    assert.ok(((await page.locator('main').textContent()) || '').length > 2000);
    assert.deepEqual(errors, []);
    const result = { glossaryGzipBytes: glossary.bytes, cards, feeds };
    if (record) {
      fs.mkdirSync('.cache', { recursive: true });
      fs.writeFileSync(baselinePath, JSON.stringify(result, null, 2));
      console.log(`Recorded baseline: ${glossary.bytes} glossary bytes; ${cards.length} cards; XML/JSON feeds.`);
    } else {
      const baseline = fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath, 'utf8')) : undefined;
      if (baseline) {
        assert.deepEqual(cards, baseline.cards, 'Rendered glossary changed');
        if (!currentCatalogs) assert.deepEqual(feeds, baseline.feeds, 'Feed contents changed');
        assert.ok(glossary.bytes < baseline.glossaryGzipBytes * 0.2);
      }
      assert.ok(glossary.bytes < 90000, `Glossary payload exceeds budget: ${glossary.bytes}`);
      console.log(JSON.stringify({ glossaryGzipBytes: glossary.bytes, previousGzipBytes: baseline?.glossaryGzipBytes, renderedCards: cards.length, searchSynonymsLettersCategoriesClear: 'passed', noTermPrefetch: true, mobileAndDetailPages: 'passed', feedContents: baseline && !currentCatalogs ? 'identical to baseline' : 'identical to current generated feeds', agentAndSocialLinks: 'passed', browserErrors: errors }, null, 2));
    }
    await context.close();
  } finally { await browser?.close(); server.kill('SIGTERM'); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
