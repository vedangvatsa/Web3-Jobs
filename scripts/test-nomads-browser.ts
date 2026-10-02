import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { gzipSync } from 'node:zlib';
import { chromium, expect, type Browser, type Page, type Locator } from '@playwright/test';
import puppeteer from 'puppeteer';
import { load } from 'cheerio';
import { getNomadCities, getNomadCity, getNomadVisas } from '../src/lib/nomads/server';
import { nomadRoutes, nomadOgImage } from '../src/lib/nomads/metadata';
import { NOMAD_TOOLS } from '../src/lib/nomads/routes';

const origin = 'http://127.0.0.1:3184';
const humanHeaders = { 'User-Agent': 'Mozilla/5.0', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document' };

async function main() {
  const standalone = path.resolve('.next/standalone');
  fs.mkdirSync('.cache/nomads', { recursive: true });
  fs.cpSync('.next/static', path.join(standalone, '.next/static'), { recursive: true });
  const server = spawn(process.execPath, [path.join(standalone, 'server.js')], { cwd: standalone, env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: '3184' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '', browser: Browser | undefined, debugPage: Page | undefined;
  server.stdout.on('data', chunk => logs += chunk);
  server.stderr.on('data', chunk => logs += chunk);
  try {
    let ready = false;
    for (let i = 0; i < 80; i++) { try { ready = (await fetch(`${origin}/icon.png`)).ok; } catch {} if (ready) break; await delay(300); }
    assert.ok(ready, logs);
    const payloads: Record<string, number> = {};
    const routes = nomadRoutes();
    let cursor = 0;
    await Promise.all(Array.from({ length: 3 }, async () => {
      while (cursor < routes.length) {
        const { path: route } = routes[cursor++];
        const response = await fetch(`${origin}${route}`, { headers: humanHeaders });
        assert.equal(response.status, 200, route);
        const html = await response.text(), $ = load(html);
        assert.equal($('main h1').length, 1, `${route} primary heading`);
        assert.equal($('link[rel="canonical"]').attr('href'), `https://hashtagweb3.com${route}`);
        assert.ok($('meta[property="og:title"]').attr('content'), `${route} social title`);
        assert.equal($('meta[property="og:image"]').attr('content'), nomadOgImage(route));
        assert.equal($('meta[name="twitter:image"]').attr('content'), nomadOgImage(route));
        assert.equal($('main nav[aria-label="Breadcrumb"]').length, 0);
        assert.doesNotMatch($('main').text(), /Compare cities, find a workspace|CVin|100 city guides|57 countries|4,652 listed places/);
        assert.equal($('main a[href^="/nomads/"]').length, 0, `${route} still links to old nested routes`);
        if (NOMAD_TOOLS.some(tool => tool.href === route)) {
          assert.equal($('main h1').parent().find('p').length, 0, `${route} still has an introductory subheading`);
          payloads[route] = gzipSync(html).length;
        }
      }
    }));
    assert.equal((await fetch(`${origin}/nomads/cities/not-a-real-city`, { headers: humanHeaders })).status, 404);
    const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
    for (const route of routes) assert.ok(sitemap.includes(`https://hashtagweb3.com${route.path}</loc>`), `Missing sitemap route ${route.path}`);
    for (const route of ['/nomads', '/lisbon', '/compare-cities', '/digital-nomad-visas']) {
      const response = await fetch(`${origin}${route}/tg`, { headers: { 'User-Agent': 'TelegramBot' } });
      assert.equal(response.status, 200, `${route} preview`);
      const html = await response.text();
      assert.ok(html.length < 10000, `${route} preview must be a lightweight shell`);
      assert.equal(load(html)('link[rel="canonical"]').attr('href'), `https://hashtagweb3.com${route}`);
      const agent = await fetch(`${origin}${route}?mode=agent`, { headers: humanHeaders });
      assert.match(agent.headers.get('content-type') || '', /json/);
    }
    for (const [oldPath, newPath] of [...getNomadCities().map(city => [`/nomads/cities/${city.slug}`, `/${city.slug}`]), ...NOMAD_TOOLS.filter(tool => !['cities', 'visas'].includes(tool.key)).map(tool => [`/nomads/${tool.key}`, tool.href])]) {
      const migrated = await fetch(`${origin}${oldPath}?from=test`, { headers: humanHeaders, redirect: 'manual' });
      assert.equal(migrated.status, 308, oldPath);
      const destination = new URL(migrated.headers.get('location')!, origin);
      assert.equal(destination.pathname, newPath);
      assert.equal(destination.searchParams.get('from'), 'test');
      assert.ok(!sitemap.includes(`https://hashtagweb3.com${oldPath}</loc>`), `${oldPath} old canonical still in sitemap`);
    }
    const migratedShare = await fetch(`${origin}/nomads/cities/lisbon/tg?from=test`, { headers: humanHeaders, redirect: 'manual' });
    assert.equal(migratedShare.status, 308);
    assert.equal(new URL(migratedShare.headers.get('location')!, origin).pathname, '/lisbon/tg');
    const redirect = await fetch(`${origin}/lisbon/tg?from=test`, { headers: humanHeaders, redirect: 'manual' });
    assert.equal(redirect.status, 307);
    assert.ok(redirect.headers.get('location')?.includes('/lisbon?'));
    const popup = await fetch(`${origin}/nomad`, { headers: humanHeaders });
    assert.equal(popup.status, 200);
    assert.ok((await popup.text()).includes('nomad.homes'), 'Existing Nomad popup changed');
    console.log(`HTTP: ${routes.length} canonical routes, ${getNomadCities().length} city guides, sitemap, previews, agent mode and legacy popup passed.`);

    browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || await puppeteer.executablePath(), headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      return url.origin === origin || url.hostname === 'basemaps.cartocdn.com' || url.hostname.endsWith('.basemaps.cartocdn.com') ? route.continue() : route.abort();
    });
    await context.addInitScript(() => localStorage.setItem('hw3_popup_dismissed', 'true'));
    const page = await context.newPage();
    debugPage = page;
    const errors: string[] = [], requests: string[] = [];
    page.on('pageerror', error => { const message = `${page.url()}: ${error.message}`; errors.push(message); console.error(message); });
    page.on('request', request => requests.push(request.url()));
    const go = async (route: string) => { await page.goto(`${origin}${route}`, { waitUntil: 'load' }); await expect(page.locator('main h1')).toBeVisible(); };
    const noOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Horizontal page overflow: ${page.url()}`);
    const metric = (label: string) => page.locator('dl > div').filter({ has: page.locator('dt', { hasText: label }) }).locator('dd');
    const select = async (label: string, value: string) => {
      await page.getByRole('combobox', { name: label, exact: true }).click();
      await page.locator(`[role="option"][data-value=${JSON.stringify(value)}]`).click();
    };
    const stableDropdown = async (trigger: Locator) => {
      await page.evaluate(() => document.fonts.ready);
      await trigger.click();
      const viewport = page.locator('[data-radix-select-viewport]');
      await expect(viewport).toBeVisible();
      await page.waitForTimeout(350);
      const initial = await viewport.boundingBox();
      assert.ok(initial);
      await page.mouse.move(initial.x + initial.width / 2, initial.y + initial.height / 2);
      const startScroll = await viewport.evaluate(element => element.scrollTop);
      const canScroll = await viewport.evaluate(element => element.scrollHeight > element.clientHeight);
      let moved = false;
      for (let index = 0; index < 12; index++) {
        await page.mouse.wheel(0, index < 6 ? 8 : -8);
        await page.waitForTimeout(40);
        const box = await viewport.boundingBox();
        assert.ok(box && Math.abs(box.y - initial.y) < 1 && Math.abs(box.height - initial.height) < 1, `Dropdown viewport shifts while scrolling: ${JSON.stringify({ initial, box, index })}`);
        moved ||= await viewport.evaluate(element => element.scrollTop) !== startScroll;
      }
      if (canScroll) assert.ok(moved, 'Dropdown did not scroll');
      await page.keyboard.press('Escape');
      await expect(page.getByRole('listbox')).toHaveCount(0);
    };

    await go('/nomads');
    await expect(page.locator('[data-nomad-city]')).toHaveCount(12);
    await expect(page.locator('#data-sources')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toHaveCount(0);
    assert.equal(await page.locator('main h1').evaluate(heading => !!heading.parentElement?.querySelector('p')), false, 'Introductory subheading is still rendered');
    await page.setViewportSize({ width: 1440, height: 480 });
    await stableDropdown(page.getByRole('combobox', { name: 'Filter cities by region' }));
    await page.setViewportSize({ width: 1440, height: 1000 });
    const filters = page.locator('section[aria-label="Explore cities"] > div').first();
    const boxes = await filters.locator('input, button[role="combobox"]').evaluateAll(elements => elements.map(element => { const box = element.getBoundingClientRect(); return { x: box.x, y: box.y, width: box.width, height: box.height }; }));
    assert.equal(boxes.length, 4);
    for (const box of boxes) { assert.ok(Math.abs(box.width - boxes[0].width) < 1); assert.equal(box.y, boxes[0].y); assert.equal(box.height, 44); }
    await expect(page.locator('[data-nomad-city] img').first()).toBeVisible();
    await page.waitForFunction(() => Array.from(document.querySelectorAll<HTMLImageElement>('[data-nomad-city] img')).slice(0, 4).every(image => image.complete && image.naturalWidth > 0));
    assert.equal(requests.some(url => /places\.json|passport|tile\.openstreetmap/.test(url)), false, 'Hub eagerly downloaded directory/map/passport data');
    await page.screenshot({ path: '.cache/nomads/hub-desktop.png' });
    await page.getByRole('searchbox', { name: 'Search nomad cities' }).fill('Lisbon');
    await expect(page.locator('[data-nomad-city]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Add Lisbon to comparison', exact: true }).click();
    await page.getByRole('searchbox', { name: 'Search nomad cities' }).fill('Bangkok');
    await page.getByRole('button', { name: 'Add Bangkok to comparison', exact: true }).click();
    await page.getByRole('complementary', { name: 'Selected cities to compare' }).getByRole('link', { name: 'Compare', exact: true }).click();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByLabel('First city', { exact: true })).toHaveAttribute('data-value', 'lisbon');
    await page.getByRole('button', { name: 'Swap cities' }).click();
    await expect(page.getByLabel('First city', { exact: true })).toHaveAttribute('data-value', 'bangkok');
    await page.reload();
    await expect(page.getByLabel('First city', { exact: true })).toHaveAttribute('data-value', 'bangkok');
    await expect(page.getByRole('table')).toBeVisible();
    assert.ok(requests.some(url => url.endsWith('/cities/lisbon.json')));
    assert.ok(requests.some(url => url.endsWith('/cities/bangkok.json')));
    await page.evaluate("Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { sessionStorage.setItem('test-copied-comparison', value); } } })");
    await page.getByRole('button', { name: 'Copy comparison link', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Link copied', exact: true })).toBeVisible();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('test-copied-comparison')), `${origin}/compare-cities?a=bangkok&b=lisbon`);
    await select('First city', 'tokyo');
    await expect(page.getByRole('button', { name: 'Copy comparison link', exact: true })).toBeVisible();
    await page.evaluate("Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Clipboard unavailable'); } } })");
    await page.getByRole('button', { name: 'Copy comparison link', exact: true }).click();
    await expect(page.locator('main').getByRole('status')).toContainText('Copying was unavailable');

    await go('/places');
    await expect(page.locator('main li:has(h2)')).toHaveCount(30);
    await expect(page.locator('[data-place-category]')).toHaveCount(5);
    await expect(page.locator('.nomad-place-cluster').first()).toBeVisible();
    const beforeZoom = Number(await page.locator('.leaflet-container').getAttribute('data-zoom'));
    await page.locator('.nomad-place-cluster').first().click();
    await expect.poll(async () => Number(await page.locator('.leaflet-container').getAttribute('data-zoom'))).toBeGreaterThan(beforeZoom);
    await page.getByRole('button', { name: 'Reset map view', exact: true }).click();
    await stableDropdown(page.getByRole('combobox', { name: 'Places city' }));
    await select('Places city', 'lisbon');
    for (const category of ['coliving', 'hostel', 'apartment', 'guesthouse']) await page.locator(`[data-place-category="${category}"]`).click();
    await expect(page.getByText(`${getNomadCity('lisbon')!.spaces.coworking} places in Lisbon`, { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Map', exact: true }).click();
    await expect(page.locator('.leaflet-container')).toBeVisible();
    await expect(page.locator('.leaflet-container')).toHaveAttribute('data-basemap', 'carto-vector');
    await expect(page.locator('.leaflet-container')).toHaveAttribute('data-basemap-ready', 'true', { timeout: 45000 });
    await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible();
    await page.screenshot({ path: '.cache/nomads/places-map.png' });
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'List', exact: true }).click();
      await expect(page.locator('.leaflet-container')).toHaveCount(0);
      await page.getByRole('button', { name: 'Map', exact: true }).click();
      await expect(page.locator('.leaflet-container')).toBeVisible();
    }
    const firstPlace = page.locator('[data-nomad-place]').first();
    const firstPlaceName = await firstPlace.locator('h2').textContent();
    await firstPlace.getByRole('button', { name: 'Locate', exact: true }).click();
    await expect(page.locator('.leaflet-popup')).toContainText(firstPlaceName!);
    await page.locator('.leaflet-popup-close-button').click();
    await expect(page.locator('.leaflet-popup')).toHaveCount(0);
    await firstPlace.getByRole('button', { name: 'Locate', exact: true }).click();
    await expect(page.locator('.leaflet-popup')).toContainText(firstPlaceName!);
    await page.getByRole('searchbox', { name: 'Search nomad places' }).fill('no-such-place-xyz');
    await expect(page.getByText('No places match these filters.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    await expect(page.locator('main li:has(h2)')).toHaveCount(30);

    await go('/digital-nomad-visas');
    await expect(page.locator('main article')).toHaveCount(getNomadVisas().length);
    await page.getByRole('searchbox', { name: 'Search visa programs' }).fill('Portugal');
    await expect(page.locator('main article')).toHaveCount(1);
    await expect(page.locator('main article')).toContainText('Key Requirements');
    await expect(page.locator('main article')).toContainText('🇵🇹');
    await page.locator('main article summary').click();
    await expect(page.locator('main article details')).toHaveAttribute('open', '');
    await page.getByRole('button', { name: 'Passport checker', exact: true }).click();
    await stableDropdown(page.getByRole('combobox', { name: 'Your passport', exact: true }));
    let failPassport = true;
    await page.route('**/data/nomads/passports/india.json', route => failPassport ? (failPassport = false, route.fulfill({ status: 503, body: 'Unavailable' })) : route.continue());
    await select('Your passport', 'india');
    await expect(page.locator('main').getByRole('alert')).toContainText('could not be loaded');
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await expect(page.getByRole('table')).toBeVisible();
    assert.equal(requests.some(url => url.includes('visa-requirements.json') || url.includes('passport-rules.json')), false);
    await page.getByRole('searchbox', { name: 'Search destinations' }).fill('Japan');
    await expect(page.locator('main tbody tr')).toHaveCount(1);
    await page.getByRole('button', { name: 'Show entry map' }).click();
    await expect(page.locator('#passport-map svg')).toBeVisible();
    await page.screenshot({ path: '.cache/nomads/passport-desktop.png' });
    await page.getByRole('button', { name: 'Hide map' }).click();
    await page.reload();
    await expect(page.getByLabel('Your passport', { exact: true })).toHaveAttribute('data-value', 'india');
    await expect(page.locator('main tbody tr')).toHaveCount(1);

    await go('/schengen');
    await page.getByLabel('Check the rolling window on').fill('2026-01-31');
    await page.getByLabel('Trip 1 arrival').fill('2026-01-01');
    await page.getByLabel('Trip 1 departure').fill('2026-01-10');
    await page.getByRole('button', { name: 'Add trip' }).click();
    await page.getByLabel('Trip 2 arrival').fill('2026-01-05');
    await page.getByLabel('Trip 2 departure').fill('2026-01-15');
    await expect(metric('Days used')).toHaveText('15');
    await page.getByRole('checkbox', { name: 'Save trips on this device' }).check();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('hw3-nomad-schengen-v1') || '[]').length)).toBe(2);
    await page.getByRole('button', { name: 'Clear trips', exact: true }).click();
    await expect(metric('Days used')).toHaveText('0');
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(metric('Days used')).toHaveText('15');
    await page.reload();
    await expect(page.getByLabel('Trip 1 arrival')).toHaveValue('2026-01-01');
    await page.getByRole('checkbox', { name: 'Save trips on this device' }).uncheck();
    await expect.poll(() => page.evaluate(() => localStorage.getItem('hw3-nomad-schengen-v1'))).toBe(null);

    await go('/savings-runway?city=lisbon');
    await page.getByLabel('Total savings (USD)').fill('10000');
    await page.getByLabel('Keep as a reserve (USD)').fill('2000');
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody img[data-city-thumbnail]')).toHaveCount(1);
    await expect(page.locator('tbody [data-country-flag="PT"]')).toHaveCount(1);
    await page.getByLabel('Monthly take-home income (USD)').fill('100000');
    await expect(metric('Longest modeled runway')).toHaveText('Costs covered');
    await go('/tax-planning');
    await page.getByLabel('Annual income (USD)').fill('100000');
    await page.getByLabel('Assumed effective tax rate (%)').fill('25');
    await expect(metric('Modeled annual tax')).toHaveText('$25,000');
    await expect(metric('After modeled tax')).toHaveText('$75,000');
    await page.getByLabel('Assumed effective tax rate (%)').fill('101');
    await expect(page.locator('main').getByRole('alert')).toBeVisible();

    await go('/climate');
    await page.getByLabel('Minimum temperature (°C)').fill('35');
    await page.getByLabel('Maximum temperature (°C)').fill('20');
    await expect(page.locator('main').getByRole('alert')).toContainText('must not exceed');
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    await expect(page.locator('tbody tr')).toHaveCount(100);
    await go('/cost-of-living');
    await page.getByRole('searchbox', { name: 'Search cities', exact: true }).fill('Lisbon');
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await page.getByLabel('Monthly take-home income (USD)', { exact: true }).fill('5000');
    await expect(page.getByRole('columnheader', { name: 'After living costs' })).toBeVisible();
    await go('/nomad-services');
    await page.getByRole('searchbox', { name: 'Find a service', exact: true }).fill('no-service-matches-xyz');
    await expect(page.getByText('No services match your search.', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    await expect(page.locator('main a:has(h3)')).toHaveCount(59);
    await go('/city-rankings');
    await page.getByRole('button', { name: 'Walkability', exact: true }).click();
    await expect(page.getByRole('columnheader', { name: 'Car-free living' })).toBeVisible();
    await go('/timezones');
    await page.getByLabel('Meeting date').fill('2026-07-01');
    await select('Add timezone city', 'mumbai');
    await expect(page.getByText('UTC+5:30', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Remove Mumbai', exact: true }).click();
    await expect(page.getByText('UTC+5:30', { exact: true })).toHaveCount(0);
    for (const route of ['/nomads?q=Lisbon', '/places?city=lisbon&type=coworking', '/city-rankings?tab=safety&q=Portugal', '/climate?month=0&min=15&max=25', '/cost-of-living?q=Lisbon', '/timezones?cities=mumbai,london']) {
      await go(route);
      const key = new URL(page.url()).searchParams;
      if (route.startsWith('/nomads?')) await expect(page.locator('[data-nomad-city]')).toHaveCount(1);
      else if (route.includes('/places?')) await expect(page.getByRole('combobox', { name: 'Places city' })).toHaveAttribute('data-value', 'lisbon');
      else if (route.includes('/city-rankings?')) await expect(page.getByRole('button', { name: 'Safety', exact: true })).toHaveAttribute('aria-pressed', 'true');
      else if (route.includes('/climate?')) await expect(page.getByLabel('Month', { exact: true })).toHaveAttribute('data-value', key.get('month')!);
      else if (route.includes('/cost-of-living?')) await expect(page.locator('tbody tr')).toHaveCount(1);
      else await expect(page.getByText('UTC+5:30', { exact: true })).toBeVisible();
    }

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const tool of NOMAD_TOOLS) {
        await go(tool.href);
        await noOverflow();
        await page.evaluate(() => document.documentElement.classList.add('dark'));
        await noOverflow();
        await page.evaluate(() => document.documentElement.classList.remove('dark'));
      }
      await go('/lisbon');
      await noOverflow();
      await expect(page.locator('#climate svg[role="img"]')).toHaveCount(2);
      await expect(page.locator('[data-climate-month]')).toHaveCount(12);
      await expect(page.getByRole('region', { name: 'Other cities to explore' }).locator('[data-nomad-city] img')).toHaveCount(Math.min(6, getNomadCity('lisbon')!.nearby.length));
      const tabs = page.locator('#community [role="tab"]');
      for (let index = 0; index < await tabs.count(); index++) {
        await tabs.nth(index).click();
        await expect(page.locator('#community [role="tabpanel"]:visible')).toBeVisible();
        assert.ok(await page.locator('#community [role="tabpanel"]:visible a').count() > 1);
      }
      await page.screenshot({ path: `.cache/nomads/city-mobile-${width}.png`, fullPage: true });
      await page.getByRole('button', { name: 'More nomad tools' }).click();
      await expect(page.getByRole('menu')).toBeVisible();
      await page.getByRole('menuitem', { name: 'Living costs', exact: true }).click();
      await page.waitForURL(`${origin}/cost-of-living`);
      const costTable = page.getByRole('region', { name: 'City living costs', exact: true });
      await expect(page.getByText('Scroll sideways to see all columns', { exact: true })).toBeVisible();
      await costTable.focus();
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => costTable.evaluate(region => region.scrollLeft)).toBeGreaterThan(0);
      await page.getByRole('button', { name: 'More nomad tools' }).click();
      await page.getByRole('menuitem', { name: 'Visas & entry', exact: true }).click();
      await page.waitForURL(`${origin}/digital-nomad-visas`);
      await page.getByRole('button', { name: 'More nomad tools' }).click();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('menu')).toHaveCount(0);
      await page.getByRole('button', { name: 'Toggle navigation menu', exact: true }).click();
      const mobileMenu = page.getByRole('dialog', { name: 'Mobile Navigation' });
      await mobileMenu.getByRole('button', { name: 'Resources', exact: true }).click();
      await mobileMenu.getByRole('link', { name: 'Nomad Toolkit', exact: true }).click();
      await page.waitForURL(`${origin}/nomads`);
      await expect(mobileMenu).toHaveCount(0);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go('/salary-calculator');
    await stableDropdown(page.getByRole('combobox').first());
    await go('/city-report');
    await expect(page.locator('.nomad-report-city')).toHaveCount(50);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('footer').first()).toBeHidden();
    const pdf = await page.pdf({ path: '.cache/nomads/report.pdf', format: 'A4', printBackground: true });
    assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
    await page.emulateMedia({ media: 'screen' });
    await go('/resources');
    await expect(page.getByRole('heading', { name: 'Remote Work & Nomads' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Nomad Toolkit', exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Toggle resources menu', exact: true }).click();
    await expect(page.getByRole('menuitem', { name: 'Nomad Toolkit', exact: true })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Nomad Toolkit', exact: true }).click();
    await page.waitForURL(`${origin}/nomads`);
    assert.deepEqual(errors, [], 'Browser runtime errors');
    assert.ok(payloads['/nomads'] < 150000, `Hub HTML bandwidth: ${payloads['/nomads']}`);
    console.log(JSON.stringify({ routes: routes.length, cityGuides: getNomadCities().length, interactions: 'passed', mobileWidths: [390, 320], darkMode: 'no page overflow', lazyMapsAndPassportShards: 'passed', mapTiles: 'loaded', requestFailureRecovery: 'passed', printPdfBytes: pdf.length, htmlGzipBytes: payloads, browserErrors: errors, screenshots: '.cache/nomads/' }, null, 2));
    await context.close();
  } catch (error) {
    console.error(logs);
    if (debugPage && !debugPage.isClosed()) {
      await debugPage.screenshot({ path: '.cache/nomads/failure.png', fullPage: true });
      fs.writeFileSync('.cache/nomads/failure.html', await debugPage.content());
      console.error('Failed page:', debugPage.url());
    }
    throw error;
  } finally { await browser?.close(); server.kill('SIGTERM'); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
