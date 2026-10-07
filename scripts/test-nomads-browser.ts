import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { gzipSync } from 'node:zlib';
import { chromium, expect, type Browser, type Page, type Locator } from '@playwright/test';
import puppeteer from 'puppeteer';
import { load } from 'cheerio';
import { getNomadCities, getNomadCity, getNomadPlaces, getNomadVisas } from '../src/lib/nomads/server';
import { nomadRoutes, nomadOgImage } from '../src/lib/nomads/metadata';
import { NOMAD_TOOLS, NOMAD_TOOL_PATHS, NOMAD_LEGACY_ROUTES, legacyNomadToolDestination } from '../src/lib/nomads/routes';
import type { PassportRules } from '../src/lib/nomads/types';

const origin = 'http://127.0.0.1:3184';
const humanHeaders = { 'User-Agent': 'Mozilla/5.0', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document' };

async function main() {
  const standalone = path.resolve('.next/standalone');
  fs.mkdirSync('.cache/nomads', { recursive: true });
  fs.cpSync('.next/static', path.join(standalone, '.next/static'), { recursive: true });
  const server = spawn(process.execPath, [path.join(standalone, 'server.js')], { cwd: standalone, env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: '3184' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '', browser: Browser | undefined, debugPage: Page | undefined;
  server.stdout.on('data', chunk => logs += chunk); server.stderr.on('data', chunk => logs += chunk);
  try {
    let ready = false;
    for (let i = 0; i < 80; i++) { try { ready = (await fetch(`${origin}/icon.png`)).ok; } catch {} if (ready) break; await delay(300); }
    assert.ok(ready, logs);
    const routes = nomadRoutes(), payloads: Record<string, number> = {};
    assert.equal(routes.length, 102);
    let cursor = 0;
    await Promise.all(Array.from({ length: 3 }, async () => {
      while (cursor < routes.length) {
        const { path: route } = routes[cursor++];
        const response = await fetch(`${origin}${route}`, { headers: humanHeaders });
        assert.equal(response.status, 200, route);
        const html = await response.text(), $ = load(html);
        assert.equal($('main h1').length, 1, route);
        assert.equal($('link[rel="canonical"]').attr('href'), `https://hashtagweb3.com${route}`);
        assert.equal($('meta[property="og:image"]').attr('content'), nomadOgImage(route));
        assert.equal($('meta[name="twitter:image"]').attr('content'), nomadOgImage(route));
        assert.equal($('main nav[aria-label="Breadcrumb"], .nomad-navigation').length, 0);
        assert.doesNotMatch($('main').text(), /CVin|More planning tools|Savings runway|Schengen days|Tax planning/);
        for (const link of $('main a').toArray()) {
          const href = $(link).attr('href')?.split(/[?#]/)[0] || '';
          assert.ok(!NOMAD_LEGACY_ROUTES[href], `${route} links to retired ${href}`);
          assert.ok(!href.startsWith('/nomads/'), `${route} links to a nested page`);
        }
        if (NOMAD_TOOLS.some(tool => tool.href === route)) payloads[route] = gzipSync(html).length;
      }
    }));
    assert.equal((await fetch(`${origin}/nomads/cities/not-a-real-city`, { headers: humanHeaders })).status, 404);
    const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
    for (const route of routes) assert.ok(sitemap.includes(`https://hashtagweb3.com${route.path}</loc>`), route.path);
    const oldRoutes = [
      ...getNomadCities().map(city => [`/nomads/cities/${city.slug}`, `/${city.slug}`]),
      ...Object.keys(NOMAD_TOOL_PATHS).filter(key => !['cities', 'visas'].includes(key)).map(key => [`/nomads/${key}`, legacyNomadToolDestination(`/nomads/${key}`)!]),
      ...Object.entries(NOMAD_LEGACY_ROUTES),
    ];
    for (const [oldPath, target] of oldRoutes) {
      const response = await fetch(`${origin}${oldPath}?from=test&q=Lisbon`, { headers: humanHeaders, redirect: 'manual' });
      assert.equal(response.status, 308, oldPath);
      const destination = new URL(response.headers.get('location')!, origin), expected = new URL(target, origin);
      assert.equal(destination.pathname, expected.pathname, oldPath);
      for (const [key, value] of expected.searchParams) assert.equal(destination.searchParams.get(key), value, oldPath);
      assert.equal(destination.searchParams.get('q'), 'Lisbon');
      assert.equal(destination.searchParams.get('from'), 'test');
      assert.ok(!sitemap.includes(`https://hashtagweb3.com${oldPath}</loc>`), oldPath);
    }
    for (const route of ['/nomads', '/lisbon', '/visas']) {
      const response = await fetch(`${origin}${route}/tg`, { headers: { 'User-Agent': 'TelegramBot' } });
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.ok(html.length < 10000);
      assert.equal(load(html)('link[rel="canonical"]').attr('href'), `https://hashtagweb3.com${route}`);
      assert.match((await fetch(`${origin}${route}?mode=agent`, { headers: humanHeaders })).headers.get('content-type') || '', /json/);
    }
    for (const [oldPath, target] of [['/nomads/cities/lisbon', '/lisbon'], ['/compare-cities', '/nomads'], ['/nomads/compare', '/nomads'], ['/digital-nomad-visas', '/visas'], ['/schengen', '/visas'], ['/tax-planning', '/visas']]) {
      const response = await fetch(`${origin}${oldPath}/tg?from=test`, { headers: humanHeaders, redirect: 'manual' });
      assert.equal(response.status, 308);
      assert.equal(new URL(response.headers.get('location')!, origin).pathname, `${target}/tg`);
      const crawler = await fetch(`${origin}${oldPath}/tg`, { headers: { 'User-Agent': 'TelegramBot' } });
      assert.equal(load(await crawler.text())('link[rel="canonical"]').attr('href'), `https://hashtagweb3.com${target}`);
    }
    const visaQuery = '?tab=checker&passport=india&q=Japan&utm_source=newsletter';
    for (const suffix of ['', '/tg']) {
      const legacy = await fetch(`${origin}/digital-nomad-visas${suffix}${visaQuery}`, { headers: humanHeaders, redirect: 'manual' });
      assert.equal(legacy.status, 308);
      const destination = new URL(legacy.headers.get('location')!, origin);
      assert.equal(destination.pathname, `/visas${suffix}`);
      for (const [key, value] of new URLSearchParams(visaQuery)) assert.equal(destination.searchParams.get(key), value);
    }
    const oldVisaShell = load(await (await fetch(`${origin}/preview/digital-nomad-visas.html`)).text());
    assert.equal(oldVisaShell('link[rel="canonical"]').attr('href'), 'https://hashtagweb3.com/visas');
    assert.equal(oldVisaShell('meta[property="og:image"]').attr('content'), nomadOgImage('/visas'));
    assert.equal((await fetch(`${origin}/og/pages/digital-nomad-visas.png`)).status, 200);
    const popup = await fetch(`${origin}/nomad`, { headers: humanHeaders });
    assert.equal(popup.status, 200); assert.match(await popup.text(), /nomad.homes/);
    console.log(`HTTP: ${routes.length} canonical pages, ${oldRoutes.length} legacy redirects, sitemap, previews and protected popup passed.`);

    browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || await puppeteer.executablePath(), headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.route('**/*', route => { const url = new URL(route.request().url()); return url.origin === origin || url.hostname === 'basemaps.cartocdn.com' || url.hostname.endsWith('.basemaps.cartocdn.com') ? route.continue() : route.abort(); });
    await context.addInitScript(() => localStorage.setItem('hw3_popup_dismissed', 'true'));
    const page = await context.newPage(); debugPage = page;
    const errors: string[] = [], requests: string[] = [];
    page.on('pageerror', error => { errors.push(`${page.url()}: ${error.message}`); });
    page.on('request', request => requests.push(request.url()));
    const go = async (route: string) => { await page.goto(`${origin}${route}`, { waitUntil: 'load' }); await expect(page.locator('main h1')).toBeVisible(); };
    const noOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Page overflow: ${page.url()}`);
    const select = async (label: string, value: string) => {
      const control = page.getByRole('combobox', { name: label, exact: true });
      if (await control.evaluate(element => element.tagName === 'SELECT')) { await control.selectOption(value); return; }
      await control.click();
      await page.locator(`[role="option"][data-value=${JSON.stringify(value)}]`).click();
    };
    const stableDropdown = async (trigger: Locator) => {
      if (await trigger.evaluate(element => element.tagName === 'SELECT')) {
        const before = await trigger.boundingBox();
        await trigger.focus(); await page.keyboard.press('Space'); await page.keyboard.press('Escape');
        await expect(trigger).toBeFocused();
        assert.deepEqual(await trigger.boundingBox(), before, 'Native filter moved while opening');
        return;
      }
      await trigger.click();
      const viewport = page.locator('[data-radix-select-viewport]'); await expect(viewport).toBeVisible();
      await page.waitForTimeout(350); const start = await viewport.boundingBox(); assert.ok(start);
      await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
      for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, i < 5 ? 8 : -8); await page.waitForTimeout(40);
        const box = await viewport.boundingBox(); assert.ok(box && Math.abs(box.y - start.y) < 1 && Math.abs(box.height - start.height) < 1, 'Dropdown jumps while scrolling');
      }
      await page.keyboard.press('Escape');
    };
    const map = page.locator('.leaflet-container');
    const mapReady = async () => { await expect(map).toBeVisible(); await expect(map).toHaveAttribute('data-basemap-ready', 'true', { timeout: 45000 }); };
    const search = page.getByRole('searchbox', { name: 'Search cities and places' });

    let failPlaces = true;
    await page.route('**/data/nomads/places.json', route => failPlaces ? (failPlaces = false, route.fulfill({ status: 503, body: 'Unavailable' })) : route.continue());
    await go('/nomads');
    await expect(page.locator('main').getByRole('alert')).toContainText('map could not be loaded');
    await page.getByRole('button', { name: 'Try again', exact: true }).click(); await mapReady();
    await expect(page.locator('[data-nomad-city]')).toHaveCount(12);
    await expect(page.locator('[data-nomad-place], .nomad-navigation')).toHaveCount(0);
    await expect(page.locator('[data-place-category]')).toHaveCount(5);
    await expect(page.getByRole('button', { name: 'Show more cities' })).toHaveCount(0);
    const cards = page.locator('[data-nomad-city]');
    const photo = await cards.first().locator('img').boundingBox();
    const cardBox = await cards.first().boundingBox();
    assert.ok(photo && cardBox && Math.abs(photo.width - cardBox.width) <= 2 && photo.height >= 128 && photo.height <= 144, 'City photos should remain full width at compact listing height');
    assert.ok(cardBox.height <= 300, 'City cards should use compact listing spacing');
    assert.equal(await cards.first().locator('h2').evaluate(element => getComputedStyle(element).fontSize), '16px');
    let shown = await cards.count();
    while (shown < getNomadCities().length) {
      await page.locator('[data-city-sentinel]').scrollIntoViewIfNeeded();
      await expect.poll(() => cards.count()).toBeGreaterThan(shown);
      shown = await cards.count();
    }
    assert.equal(shown, getNomadCities().length);
    assert.equal(new Set(await cards.evaluateAll(elements => elements.map(element => element.getAttribute('data-nomad-city')))).size, shown, 'Infinite scroll duplicated cities');
    await expect(page.locator('[data-city-sentinel]')).toHaveCount(0);
    await search.fill('Lisbon'); await expect(cards).toHaveCount(1);
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    await expect.poll(() => cards.count()).toBeGreaterThanOrEqual(12);
    assert.ok(await cards.count() < getNomadCities().length, 'Filter reset must not retain the fully loaded catalog');
    assert.equal((await cards.count()) % 12, 0, 'Compact cards may prefetch another batch, but batches remain 12 cities');
    await expect.poll(async () => Number(await map.getAttribute('data-zoom'))).toBe(2);
    assert.equal(requests.some(url => /passport|\/cities\/lisbon.json/.test(url)), false);
    await stableDropdown(page.getByRole('combobox', { name: 'Filter destinations by region' }));
    const filterBoxes = await page.locator('[data-explorer-controls]:has(input[aria-label="Search cities and places"])').locator('input, select, [role="combobox"]').evaluateAll(fields => fields.map(field => ({ y: field.getBoundingClientRect().y, height: field.getBoundingClientRect().height })));
    assert.equal(filterBoxes.length, 4);
    filterBoxes.forEach(box => { assert.equal(box.height, 44); assert.equal(box.y, filterBoxes[0].y); });

    const [zoomSamples] = await Promise.all([
      page.evaluate<number[]>(`new Promise(resolve => {
        const samples = [], start = performance.now();
        function sample() { samples.push(Number(document.querySelector('.leaflet-container').dataset.zoom)); if (performance.now() - start < 1500) requestAnimationFrame(sample); else resolve(samples); }
        sample();
      })`),
      page.getByRole('button', { name: 'Zoom in', exact: true }).click(),
    ]);
    assert.ok(new Set(zoomSamples.filter(value => Number.isFinite(value) && Math.abs(value - Math.round(value)) > 0.001)).size >= 3, 'Zoom skipped intermediate animation frames');
    await expect(map).toHaveAttribute('data-moving', 'false');
    const beforeCluster = Number(await map.getAttribute('data-zoom'));
    await page.locator('.nomad-place-cluster').first().click();
    await expect.poll(async () => Number(await map.getAttribute('data-zoom'))).toBeGreaterThan(beforeCluster);
    for (let i = 0; i < 3; i++) { await page.getByRole('button', { name: 'Zoom in', exact: true }).click(); await page.waitForTimeout(70); }
    await page.getByRole('button', { name: 'Reset map view' }).click();
    await expect.poll(async () => Number(await map.getAttribute('data-zoom'))).toBe(2);
    await expect(map).toHaveAttribute('data-moving', 'false');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
    await expect(map).toHaveAttribute('data-zoom', '3');
    await expect(map).toHaveAttribute('data-moving', 'false');
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    await select('Rank destinations by', 'cost');
    const cheapest = [...getNomadCities()].sort((a, b) => a.cost.monthly_total - b.cost.monthly_total || a.name.localeCompare(b.name))[0];
    await expect(page.locator('[data-nomad-city]').first()).toHaveAttribute('data-nomad-city', cheapest.slug);
    assert.equal(Number(await map.getAttribute('data-zoom')), 3, 'Rank change moved the map');
    await select('Rank destinations by', 'temperature');
    await select('Climate month', '0');
    await page.getByRole('button', { name: 'Weather filters', exact: true }).click();
    await page.getByLabel('Minimum temperature (°C)').fill('35'); await page.getByLabel('Maximum temperature (°C)').fill('20');
    await expect(page.locator('main').getByRole('alert')).toContainText('must not exceed');
    await page.getByRole('button', { name: 'Clear weather filters' }).click(); await page.keyboard.press('Escape');
    await select('Rank destinations by', 'score');
    await page.screenshot({ path: '.cache/nomads/hub-desktop.png' });

    await search.fill('Lisbon'); await expect(page.locator('[data-nomad-city]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Add Lisbon to comparison', exact: true }).click();
    await search.fill('Bangkok'); await page.getByRole('button', { name: 'Add Bangkok to comparison', exact: true }).click();
    await page.getByRole('complementary', { name: 'Selected cities to compare' }).getByRole('button', { name: 'Compare', exact: true }).click();
    const comparison = page.getByRole('dialog', { name: 'Compare cities', exact: true });
    await expect(comparison.getByRole('table')).toBeVisible();
    assert.equal(new URL(page.url()).pathname, '/nomads');
    await page.getByRole('button', { name: 'Swap cities' }).click();
    await expect(page.getByLabel('First city', { exact: true })).toHaveValue('bangkok');
    await page.reload(); await expect(comparison.getByRole('table')).toBeVisible();
    await expect(page.getByLabel('First city', { exact: true })).toHaveValue('bangkok');
    assert.equal(requests.some(url => /\/cities\/(lisbon|bangkok).json/.test(url)), false, 'Comparison redownloaded city records already in the explorer');
    await page.evaluate("Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => sessionStorage.setItem('copied', value) } })");
    await page.getByRole('button', { name: 'Copy comparison link', exact: true }).click();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('copied')), `${origin}/nomads?view=compare&a=bangkok&b=lisbon`);
    await select('First city', 'tokyo');
    await page.evaluate("Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Unavailable'); } } })");
    await page.getByRole('button', { name: 'Copy comparison link', exact: true }).click();
    await expect(comparison.getByRole('status')).toContainText('Copying was unavailable');
    await page.keyboard.press('Escape'); await expect(comparison).toHaveCount(0);
    await expect(page.getByRole('complementary', { name: 'Selected cities to compare' }).getByRole('button', { name: 'Compare', exact: true })).toBeFocused();

    const place = getNomadPlaces().find(place => place.citySlug === 'lisbon' && place.category === 'coworking')!;
    await go(`/nomads?city=lisbon&place=${encodeURIComponent(place.id)}`); await mapReady();
    await expect(page.locator('.leaflet-popup')).toContainText(place.name);
    await page.locator('.leaflet-popup-close-button').click(); await expect(page.locator('.leaflet-popup')).toHaveCount(0);
    await search.fill('no-such-place-xyz'); await expect(page.getByText('No matches for these filters.', { exact: true })).toBeVisible();
    const emptyReset = page.getByRole('status').filter({ hasText: 'No matches for these filters.' }).getByRole('button', { name: 'Clear filters', exact: true });
    const resetBox = await emptyReset.boundingBox(); assert.ok(resetBox && resetBox.height >= 44);
    await emptyReset.click();
    await expect.poll(() => cards.count()).toBeGreaterThanOrEqual(12);
    assert.ok(await cards.count() < getNomadCities().length);
    assert.equal((await cards.count()) % 12, 0);
    await go('/places?city=lisbon&type=coworking');
    await expect(search).toHaveValue('Lisbon'); await mapReady();
    for (const type of ['coliving', 'hostel', 'apartment', 'guesthouse']) await expect(page.locator(`[data-place-category="${type}"]`)).toHaveAttribute('aria-pressed', 'false');
    await go('/city-rankings?tab=safety&q=Portugal'); await expect(page.getByLabel('Rank destinations by')).toHaveValue('safety');
    await go('/climate?month=0&min=15&max=25'); await expect(page.getByLabel('Climate month')).toHaveValue('0');
    await go('/timezones?cities=bangalore,london'); await expect(comparison.getByText('UTC+5:30', { exact: true })).toBeVisible();

    await go('/digital-nomad-visas?tab=checker&passport=india');
    await expect(page).toHaveURL(/\/visas\?tab=checker&passport=india$/);
    await expect(page.getByRole('tab', { name: 'Passport checker', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('combobox', { name: 'Your passport', exact: true })).toHaveValue('india');
    await expect(page.locator('#passport-map svg')).toBeVisible();
    await go('/visas');
    await expect(page.getByRole('link', { name: 'Explore destinations', exact: true })).toHaveCount(0);
    await expect(page.getByText(/program and remote-stay references/)).toHaveCount(0);
    await expect(page.locator('main article')).toHaveCount(getNomadVisas().length);
    await expect(page.locator('main article a[aria-label^="Official visa program website"]')).toHaveCount(45);
    await expect(page.getByText('These references cover short-visit entry conditions for ordinary passports.', { exact: false })).toHaveCount(0);
    await page.getByRole('searchbox', { name: 'Search visa programs' }).fill('Portugal');
    await expect(page.locator('main article')).toHaveCount(1); await expect(page.locator('main article')).toContainText('Key Requirements');
    const programTab = page.getByRole('tab', { name: 'Visa programs', exact: true }), checkerTab = page.getByRole('tab', { name: 'Passport checker', exact: true });
    await programTab.focus(); await page.keyboard.press('ArrowRight'); await expect(checkerTab).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowLeft'); await expect(page.getByRole('searchbox', { name: 'Search visa programs' })).toHaveValue('Portugal');
    await checkerTab.click(); await stableDropdown(page.getByRole('combobox', { name: 'Your passport', exact: true }));
    let failPassport = true;
    await page.route('**/data/nomads/passports/india.json*', route => failPassport ? (failPassport = false, route.fulfill({ status: 503, body: 'Unavailable' })) : route.continue());
    await select('Your passport', 'india'); await expect(page.locator('main').getByRole('alert')).toContainText('could not be loaded');
    await page.getByRole('button', { name: 'Try again', exact: true }).click(); await expect(page.getByRole('table')).toBeVisible();
    await page.getByRole('searchbox', { name: 'Search destinations' }).fill('Malaysia');
    const entryRow = page.locator('main tbody tr');
    await expect(entryRow).toHaveCount(1);
    await expect(entryRow).not.toContainText('90 days');
    if (new Date().toISOString().slice(0, 10) <= '2026-12-31') {
      await expect(entryRow).toContainText('Up to 30 days');
      await entryRow.locator('summary').click();
      await expect(entryRow).toContainText('MDAC'); await expect(entryRow).toContainText('2026-12-31');
      await expect(entryRow.locator('a').first()).toHaveAttribute('href', 'https://www.hcikl.gov.in/pdf/img-20260922-wa0000.pdf');
    } else {
      await expect(entryRow).toContainText('Not yet verified'); await expect(entryRow).not.toContainText('Up to 30 days');
    }
    await page.getByRole('searchbox', { name: 'Search destinations' }).fill('Hong Kong');
    await expect(entryRow).toContainText('Up to 14 days'); await expect(entryRow).toContainText('Electronic authorization / registration');
    await page.getByRole('searchbox', { name: 'Search destinations' }).fill('Singapore');
    await expect(entryRow).toContainText('Visa required'); await expect(entryRow).not.toContainText('Up to 30 days');
    await page.getByRole('searchbox', { name: 'Search destinations' }).fill('Japan'); await expect(page.locator('main tbody tr')).toHaveCount(1);
    await expect(entryRow).toContainText('Visa required');
    await page.getByRole('searchbox', { name: 'Search destinations' }).fill('Nepal');
    await expect(entryRow).toHaveCount(1); await expect(entryRow).toContainText('Not specified by source');
    await expect(entryRow).not.toContainText('90 days');
    await entryRow.locator('summary').click();
    await expect(entryRow).toContainText('Retrieved');
    await expect(entryRow.locator('a')).toHaveAttribute('href', 'https://www.passportindex.org/passport/india/');
    await page.getByRole('searchbox', { name: 'Search destinations' }).fill('Armenia');
    await expect(entryRow).toContainText('eVisa'); await expect(entryRow).toContainText('Up to 120 days');
    await expect(entryRow).not.toContainText('Visa on arrival');
    await page.getByRole('searchbox', { name: 'Search destinations' }).fill('Cambodia');
    await select('Entry category', 'ev'); await expect(entryRow).toHaveCount(1);
    await expect(entryRow).toContainText('eVisa · visa on arrival');
    await select('Entry category', 'voa'); await expect(entryRow).toHaveCount(1);
    await select('Entry category', '');
    await page.getByRole('searchbox', { name: 'Search destinations' }).fill('Australia');
    await expect(entryRow).toContainText('eVisa'); await expect(entryRow).toContainText('Not specified by source');
    const passportReference = await (await fetch(`${origin}/data/nomads/passports/india.json`)).json() as PassportRules;
    assert.equal(passportReference.version, 3);
    assert.equal(passportReference.destinations.length, 198);
    assert.equal(passportReference.destinations.filter(destination => destination.rule.t === 'unknown').length, new Date().toISOString().slice(0, 10) <= '2026-12-31' ? 0 : 1);
    const unverified = passportReference.destinations.find(destination => destination.rule.t === 'unknown');
    if (unverified) {
      await page.getByRole('searchbox', { name: 'Search destinations' }).fill(unverified.name);
      await expect(entryRow.filter({ hasText: unverified.name }).first()).toContainText('Not yet verified');
    }
    await expect(page.locator('#passport-map svg')).toBeVisible();
    const mapBox = await page.locator('#passport-map').boundingBox(), svgBox = await page.locator('#passport-map svg').boundingBox();
    assert.ok(mapBox && svgBox && Math.abs(mapBox.x + mapBox.width / 2 - svgBox.x - svgBox.width / 2) < 2);
    assert.equal(requests.some(url => /visa-requirements.json|passport-rules.json/.test(url)), false);

    for (const [passport, destination, label, stay] of [
      ['united-states', 'Brazil', 'eVisa', 'Not specified by source'],
      ['germany', 'Australia', 'eVisitors', 'Up to 90 days'],
      ['china', 'Cambodia', 'eVisa · free visa on arrival', ''],
      ['united-arab-emirates', 'Liberia', 'eVisa on arrival', ''],
    ]) {
      await go(`/visas?tab=checker&passport=${passport}`);
      await page.getByRole('searchbox', { name: 'Search destinations' }).fill(destination);
      await expect(page.locator('main tbody tr')).toHaveCount(1);
      await expect(page.locator('main tbody tr')).toContainText(label);
      if (stay) await expect(page.locator('main tbody tr')).toContainText(stay);
      await page.locator('main tbody tr summary').click();
      await expect(page.locator('main tbody tr')).toContainText('Retrieved');
      const sourceSlug = passport === 'united-states' ? 'united-states-of-america' : passport;
      await expect(page.locator('main tbody tr a')).toHaveAttribute('href', `https://www.passportindex.org/passport/${sourceSlug}/`);
    }

    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of ['/nomads', '/nomads?view=compare&a=lisbon&b=bangkok', '/visas?tab=checker&passport=india', '/lisbon']) {
        await go(route);
        if (route.includes('view=compare')) { await expect(comparison.getByRole('table')).toBeVisible(); await comparison.screenshot({ path: `.cache/nomads/comparison-${width}.png` }); }
        if (route.includes('passport=india')) await expect(page.locator('#passport-map svg')).toBeVisible();
        await noOverflow();
      }
      await expect(page.locator('#climate svg[role="img"]')).toHaveCount(2);
      await expect(page.locator('[data-climate-month]')).toHaveCount(12);
      await expect(page.locator('#places .leaflet-container')).toBeVisible();
      await expect(page.locator('#places [data-nomad-place]')).toHaveCount(0);
      await expect(page.locator('#community [role="tab"], #community [role="tabpanel"]')).toHaveCount(0);
      for (const section of ['jobs', 'events', 'companies', 'societies']) {
        await expect(page.locator(`[data-city-connection="${section}"]`)).toBeVisible();
        assert.ok(await page.locator(`[data-city-connection="${section}"] > .grid > *`).count() > 0);
      }
      const chips = await page.locator('[aria-label="Map place types"]').evaluate(group => {
        const box = group.getBoundingClientRect();
        const rows = new Map<number, { left: number; right: number }>();
        for (const button of group.querySelectorAll('button')) {
          const rect = button.getBoundingClientRect(), row = rows.get(rect.top);
          rows.set(rect.top, { left: Math.min(row?.left ?? rect.left, rect.left), right: Math.max(row?.right ?? rect.right, rect.right) });
        }
        return { center: box.x + box.width / 2, rows: [...rows.values()] };
      });
      assert.ok(chips.rows.every(row => Math.abs((row.left + row.right) / 2 - chips.center) < 2), 'Category chips must be centered on every wrapped row');
      if (width < 640) {
        await page.getByRole('button', { name: 'Toggle navigation menu', exact: true }).click();
        const menu = page.getByRole('dialog', { name: 'Mobile Navigation' });
        await menu.getByRole('button', { name: 'Resources', exact: true }).click();
        await menu.getByRole('link', { name: 'Digital Nomad Resources', exact: true }).click();
        await expect(menu).toHaveCount(0); await mapReady();
        await page.screenshot({ path: `.cache/nomads/hub-mobile-${width}.png`, fullPage: true });
      }
    }
    await go('/salary-calculator'); await stableDropdown(page.getByRole('combobox').first());
    await go('/nomads?region=Europe&category=cost');
    await page.evaluate("window.print = () => sessionStorage.setItem('print-ready', 'true')");
    await page.getByRole('button', { name: 'Print city report', exact: true }).click();
    await page.waitForFunction(() => sessionStorage.getItem('print-ready') === 'true');
    const expectedReport = getNomadCities().filter(city => city.continent === 'Europe').sort((a, b) => a.cost.monthly_total - b.cost.monthly_total || a.name.localeCompare(b.name)).slice(0, 50);
    await expect(page.locator('.nomad-report-city')).toHaveCount(expectedReport.length);
    await page.emulateMedia({ media: 'print' }); await expect(page.locator('.nomad-report')).toBeVisible();
    await page.setViewportSize({ width: 700, height: 1000 });
    await expect(page.locator('.nomad-explorer-screen')).toBeHidden(); await expect(page.locator('footer').first()).toBeHidden();
    const printLayout = await page.locator('.nomad-report').evaluate(report => ({
      right: report.getBoundingClientRect().right,
      cells: Array.from(report.querySelectorAll('th, td, td a')).map(cell => cell.getBoundingClientRect().right),
      counters: Array.from(report.querySelectorAll(':scope > dl > div')).map(counter => counter.getBoundingClientRect().top),
    }));
    assert.ok(printLayout.cells.every(right => right <= printLayout.right + 1), 'Report clips a table column at print width');
    assert.equal(new Set(printLayout.counters).size, 1, 'Print counters create an empty grid cell');
    assert.equal(await page.locator('.nomad-report-city h3').first().textContent(), expectedReport[0].name);
    const pdf = await page.pdf({ path: '.cache/nomads/report.pdf', format: 'A4', printBackground: true }); assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
    await page.emulateMedia({ media: 'screen' }); await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(page.locator('.nomad-report')).toHaveCount(0);
    await go('/resources'); await expect(page.getByRole('heading', { name: 'Remote Work & Nomads' })).toBeVisible();
    await page.getByRole('button', { name: 'Toggle resources menu', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Digital Nomad Resources', exact: true }).click(); await expect(map).toBeVisible();
    assert.deepEqual(errors, [], 'Browser errors'); assert.ok(payloads['/nomads'] < 150000, 'Hub HTML bandwidth budget');
    console.log(JSON.stringify({ routes: routes.length, redirects: oldRoutes.length, viewportWidths: [320, 390, 768, 1024, 1440], mapIntermediateZooms: new Set(zoomSamples).size, comparison: 'in-page, URL, keyboard and reload passed', printPdfBytes: pdf.length, htmlGzipBytes: payloads, errors }, null, 2));
    await context.close();
  } catch (error) {
    console.error(logs);
    if (debugPage && !debugPage.isClosed()) { await debugPage.screenshot({ path: '.cache/nomads/failure.png', fullPage: true }); fs.writeFileSync('.cache/nomads/failure.html', await debugPage.content()); console.error('Failed page:', debugPage.url()); }
    throw error;
  } finally { await browser?.close(); server.kill('SIGTERM'); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
