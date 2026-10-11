import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import puppeteer from 'puppeteer';
import { RECOVERY_SECTIONS, recoveryContext, recoveryDestinations } from '../src/lib/page-recovery';

const origin = 'http://127.0.0.1:3185';
const output = '.cache/page-recovery';
const humanHeaders = { 'User-Agent': 'Mozilla/5.0', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document' };

function luminance(color: string) {
  return (color.match(/[\d.]+/g) || []).slice(0, 3).map(Number).map(channel => {
    const n = channel / 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, n, index) => sum + n * [0.2126, 0.7152, 0.0722][index], 0);
}

async function main() {
  assert.equal(recoveryContext('/jobs/unknown-role').section, 'jobs');
  assert.equal(recoveryContext('/companies/missing').section, 'companies');
  assert.equal(recoveryContext('/learn/missing/lesson').section, 'learn');
  assert.equal(recoveryContext('/news/missing').section, 'news');
  assert.equal(recoveryContext('/evnets').suggestion, 'events');
  assert.equal(recoveryContext('/jbos').suggestion, 'jobs');
  assert.equal(recoveryContext('/glosary').suggestion, 'glossary');
  for (const input of ['/', '/constructor', '/__proto__', '/totally-unrelated', '/%E0%A4%A']) {
    assert.equal(recoveryContext(input).suggestion, undefined, input);
    assert.equal(recoveryContext(input).section, undefined, input);
  }
  const privateQuery = recoveryContext('/events/missing?token=private-example#private-fragment');
  assert.deepEqual(privateQuery, recoveryContext('/events/missing'));
  assert.equal(recoveryContext(`/${'x'.repeat(2000)}`).section, undefined);
  assert.equal(recoveryContext('/%0a%0d%09%E2%80%AEevent').section, undefined);
  for (const section of Object.keys(RECOVERY_SECTIONS) as (keyof typeof RECOVERY_SECTIONS)[]) {
    const destinations = recoveryDestinations(section);
    assert.equal(destinations[0], section);
    assert.equal(destinations.length, 4);
    assert.equal(new Set(destinations).size, 4);
  }

  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(`${output}/.gitignore`, '*\n');
  const standalone = path.resolve('.next/standalone');
  fs.cpSync('.next/static', path.join(standalone, '.next/static'), { recursive: true });
  const server = spawn(process.execPath, [path.join(standalone, 'server.js')], { cwd: standalone, env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: '3185' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = ''; server.stdout.on('data', chunk => logs += chunk); server.stderr.on('data', chunk => logs += chunk);
  let browser;
  try {
    let ready = false;
    for (let attempt = 0; attempt < 80; attempt++) {
      if (server.exitCode !== null) throw new Error(logs);
      try { ready = (await fetch(`${origin}/icon.png`)).ok; } catch {}
      if (ready) break;
      await delay(250);
    }
    assert.ok(ready, logs);
    for (const href of new Set(['/', ...Object.values(RECOVERY_SECTIONS).map(item => item.href)])) {
      const response = await fetch(origin + href, { headers: humanHeaders, redirect: 'manual' });
      assert.equal(response.status, 200, `Recovery destination ${href}`);
      await response.arrayBuffer();
    }
    for (const [href, status] of [['/eio', 410], ['/api/jobs', 404]] as const) {
      const response = await fetch(origin + href, { headers: humanHeaders });
      assert.equal(response.status, status);
      assert.match(response.headers.get('x-robots-tag') || '', /noindex/);
      await response.arrayBuffer();
    }
    for (const [from, to] of [
      ['/learn/careers', '/web3-careers'],
      ['/learn/fundamentals/blockchains', '/blockchains'],
      ['/learn/marketing/discord/tg', '/discord-community/tg'],
    ]) {
      const response = await fetch(`${origin}${from}?from=saved`, { headers: humanHeaders, redirect: 'manual' });
      assert.equal(response.status, 308);
      const location = new URL(response.headers.get('location')!, origin);
      assert.equal(location.pathname + location.search, `${to}?from=saved`);
      assert.ok(['127.0.0.1', 'localhost'].includes(location.hostname));
      assert.equal(location.port, '3185');
      await response.arrayBuffer();
    }

    browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || puppeteer.executablePath(), headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    await context.addInitScript(() => localStorage.setItem('hw3_popup_dismissed', 'true'));
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const requests: string[] = [];
    page.on('request', request => requests.push(request.url()));
    const missingPath = '/missing-recovery-test?token=private-example#private-fragment';
    assert.equal((await page.goto(origin + missingPath, { waitUntil: 'networkidle' }))?.status(), 404);
    await page.locator('[data-page-recovery]').waitFor();
    assert.equal(await page.locator('main h1').textContent(), 'Page not found');
    assert.match(await page.title(), /Page not found/);
    assert.ok(await page.locator('meta[name="robots"][content*="noindex"]').count());
    assert.equal(await page.locator('main input, main form').count(), 0);
    assert.equal(await page.locator('main a[href="/jobs"]').count(), 1);
    assert.doesNotMatch(await page.locator('main').innerText(), /private-example|private-fragment/);
    const dataRequests = requests.filter(url => new URL(url).pathname.match(/^\/(?:api|data|job-shards|articles-data)\//));
    assert.deepEqual(dataRequests, [], 'A 404 must not load a catalog or call an API');

    const viewports = [];
    for (const width of [320, 390, 768, 1024, 1440]) for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('html').evaluate((element, dark) => element.classList.toggle('dark', dark), theme === 'dark');
      await delay(250);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${width}/${theme}: page overflow`);
      const links = page.locator('main a');
      for (const link of await links.all()) {
        const box = await link.boundingBox();
        assert.ok(box && box.height >= 44 && box.width >= 44, `${width}/${theme}: undersized link ${await link.textContent()}`);
        assert.ok(box.x >= 0 && box.x + box.width <= width + 1, `${width}/${theme}: link escapes viewport`);
      }
      const geometry = await page.locator('[data-page-recovery]').evaluate(root => ({
        container: root.getBoundingClientRect().toJSON(),
        nav: root.querySelector('nav')!.getBoundingClientRect().toJSON(),
        headingAlignment: getComputedStyle(root.querySelector('h1')!).textAlign,
        cards: Array.from(root.querySelectorAll('nav a')).map(element => element.getBoundingClientRect().toJSON()),
      }));
      assert.equal(geometry.cards.length, 4);
      assert.equal(geometry.headingAlignment, 'center');
      assert.ok(Math.abs(geometry.container.x + geometry.container.width / 2 - geometry.nav.x - geometry.nav.width / 2) <= 1);
      for (const card of geometry.cards) {
        assert.ok(Math.abs(card.width - geometry.cards[0].width) <= 1, `${width}: unequal link widths`);
        assert.ok(Math.abs(card.height - geometry.cards[0].height) <= 1, `${width}: unequal link heights`);
      }
      if (width >= 360) {
        assert.equal(geometry.cards[0].y, geometry.cards[1].y);
        assert.equal(geometry.cards[2].y, geometry.cards[3].y);
        assert.equal(geometry.cards[0].x, geometry.cards[2].x);
        assert.equal(geometry.cards[1].x, geometry.cards[3].x);
      } else assert.ok(geometry.cards.every(card => card.x === geometry.cards[0].x));
      const styles = await page.locator('main').evaluate(main => {
        return Array.from(main.querySelectorAll('h1, h2, p, a, span')).filter(element => element.textContent?.trim() && element.getClientRects().length).map(element => {
          const style = getComputedStyle(element);
          let parent: Element | null = element;
          let background = 'rgba(0, 0, 0, 0)';
          while (parent && (background === 'rgba(0, 0, 0, 0)' || background === 'transparent')) {
            background = getComputedStyle(parent).backgroundColor;
            parent = parent.parentElement;
          }
          const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
          return { text: element.textContent!.slice(0, 60), color: style.color, background, minimum: large ? 3 : 4.5 };
        });
      });
      const contrast = styles.map(item => {
        const foreground = luminance(item.color), background = luminance(item.background);
        return { ...item, ratio: (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05) };
      });
      assert.deepEqual(contrast.filter(item => item.ratio < item.minimum), [], `${width}/${theme}: text contrast`);
      const minimumContrast = Math.min(...contrast.map(item => item.ratio));
      viewports.push({ width, theme, minimumContrast, columns: width >= 360 ? 2 : 1, symmetric: true });
      if (width === 320 || width === 1440) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `${output}/${theme}-${width}.png`, fullPage: true });
      }
    }
    await page.setViewportSize({ width: 320, height: 1000 });
    await page.locator('html').evaluate(element => element.style.fontSize = '200%');
    const zoomOverflow = await page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(element => {
      const box = element.getBoundingClientRect();
      return box.width > 0 && (box.x < -1 || box.right > innerWidth + 1);
    }).map(element => ({ tag: element.tagName, class: element.className, text: element.textContent?.slice(0, 70), box: element.getBoundingClientRect().toJSON() })));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `200% text overflow: ${JSON.stringify(zoomOverflow)}`);
    await page.locator('html').evaluate(element => { element.style.fontSize = ''; element.classList.remove('dark'); });
    const links = page.locator('main a');
    await links.first().focus();
    for (let i = 0; i < await links.count(); i++) {
      assert.ok(await links.nth(i).evaluate(element => document.activeElement === element), `Tab order ${i}`);
      const focus = await links.nth(i).evaluate(element => { const style = getComputedStyle(element); return { shadow: style.boxShadow, outline: style.outlineStyle }; });
      assert.ok(focus.shadow !== 'none' || focus.outline !== 'none', `Visible focus ${i}`);
      await page.keyboard.press('Tab');
    }
    await page.locator('main').getByRole('link', { name: /^Jobs/ }).focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(origin + '/jobs');
    await page.getByRole('heading', { name: 'Web3 Jobs', exact: true }).waitFor();
    await page.goBack({ waitUntil: 'networkidle' });
    await page.locator('[data-page-recovery]').waitFor();

    const cases = [
      ['/jobs/missing-recovery-test', '/jobs'],
      ['/events/missing-recovery-test', '/events'],
      ['/company/missing-recovery-test', '/companies'],
      ['/articles/missing-recovery-test', '/blog'],
      ['/news/missing-recovery-test', '/news'],
      ['/learn/missing-recovery-test', '/learn'],
      ['/learn/fundamentals/missing-recovery-test', '/learn'],
      ['/glossary/defi/missing-recovery-test', '/glossary'],
      ['/nomads/missing-recovery-test', '/nomads'],
      ['/visas/missing-recovery-test', '/visas'],
      ['/evnets', '/events'],
    ];
    for (const [url, href] of cases) {
      assert.equal((await page.goto(origin + url, { waitUntil: 'load' }))?.status(), 404, url);
      await page.waitForFunction(expected => document.querySelector('main nav a')?.getAttribute('href') === expected, href);
      if (url === '/evnets') await page.getByText('Did you mean', { exact: false }).waitFor();
    }
    for (const prefix of ['/companies', '/blog', '/glossary']) {
      assert.equal((await page.goto(`${origin}${prefix}/missing-recovery-test`, { waitUntil: 'load' }))?.status(), 404);
      assert.equal(new URL(page.url()).pathname, '/missing-recovery-test');
      await page.locator('main').getByRole('link', { name: /^Jobs/ }).waitFor();
    }
    await page.goto(origin + '/' + 'x'.repeat(500), { waitUntil: 'load' });
    await page.locator('[data-page-recovery]').waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'Long URL overflow');
    assert.deepEqual(errors, []);
    const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
    const fallback = await noJs.newPage();
    assert.equal((await fallback.goto(origin + '/events/missing-recovery-test', { waitUntil: 'load' }))?.status(), 404);
    assert.equal(await fallback.locator('main a').count(), 5);
    await fallback.getByRole('link', { name: 'Go to homepage' }).click();
    await fallback.waitForURL(origin + '/');
    await noJs.close();
    const result = { status: 'passed', contexts: cases.length, destinations: Object.keys(RECOVERY_SECTIONS).length + 1, viewports, catalogOrApiRequestsOn404: dataRequests.length, keyboardNavigation: true, noJavaScriptFallback: 'static unmatched-route 404', queryStringsExcludedFromDisplay: true, browserErrors: errors };
    fs.writeFileSync(`${output}/results.json`, `${JSON.stringify(result, null, 2)}\n`);
    console.log(JSON.stringify(result, null, 2));
    await context.close();
  } finally {
    await browser?.close();
    server.kill('SIGTERM');
    fs.writeFileSync(`${output}/server.log`, logs);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
