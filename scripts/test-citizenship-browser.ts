import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, expect } from '@playwright/test';
import { citizenshipPrograms, investmentAmount, officialProgramUrl, startingInvestments } from '../src/lib/citizenship';
import { collectOgPreviewPaths } from '../src/lib/og-preview';
import { SOCIAL_UTM_MAP } from '../src/lib/social-share';

const origin = process.env.CITIZENSHIP_ORIGIN || 'http://127.0.0.1:3196';
const uiOnly = process.env.CITIZENSHIP_UI_ONLY === '1';
const humanHeaders = { 'User-Agent': 'Mozilla/5.0', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document' };

async function main() {
  const server = process.env.CITIZENSHIP_ORIGIN ? null : spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '3196'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  server?.stdout.on('data', chunk => logs += chunk);
  server?.stderr.on('data', chunk => logs += chunk);
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  try {
    if (server) {
      let ready = false;
      for (let attempt = 0; attempt < 60; attempt++) {
        assert.equal(server.exitCode, null, logs);
        if (logs.includes('Ready in')) { ready = true; break; }
        await delay(300);
      }
      assert.ok(ready, logs);
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.setDefaultNavigationTimeout(120000);
    await page.addInitScript('window.__name = (value) => value');
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && /hydration|react error|uncaught/i.test(message.text())) errors.push(message.text()); });
    const failedLocalRequests: string[] = [];
    page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) failedLocalRequests.push(`${response.status()} ${response.url()}`); });
    await page.goto(`${origin}/citizenship`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Citizenship by investment');
    await expect(page.getByRole('article')).toHaveCount(citizenshipPrograms.length);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://hashtagweb3.com/citizenship');
    await expect(page.locator('main [data-page-header] p, main [data-page-header] a')).toHaveCount(0);
    await expect(page.getByText('Download source-backed data')).toHaveCount(0);
    await expect(page.getByText(/These investment routes lead to a citizenship application/)).toHaveCount(0);
    await expect(page.getByRole('combobox', { name: 'Sort programs' })).toHaveCount(0);
    await expect(page.getByText(/Sources? checked|Showing \d+ results|Single applicant\.|Select up to 3 countries to compare|One applicant, plus fees/)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Compare countries' })).toHaveCount(0);
    await expect(page.getByRole('table')).toHaveCount(0);
    await expect(page.locator('main details, main [role="dialog"], main a[href^="/citizenship/"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Route details', exact: true })).toHaveCount(0);
    const cardHeights = await page.getByRole('article').evaluateAll(cards => cards.map(card => card.getBoundingClientRect().height));
    assert.ok(cardHeights.every(height => height < 280), `Directory card heights: ${cardHeights.join(', ')}`);
    const kinds = [...new Set(citizenshipPrograms.flatMap(program => program.routes.map(route => route.kind)))].sort();
    assert.deepEqual(await page.getByRole('combobox', { name: 'Investment route' }).locator('option').evaluateAll(options => options.map(option => (option as HTMLOptionElement).value).filter(Boolean)), kinds);
    for (const program of citizenshipPrograms) {
      const card = page.getByRole('article', { name: program.country, exact: true });
      await expect(card).toHaveAttribute('id', program.slug);
      await expect(card.getByRole('heading', { level: 2, name: program.country, exact: true })).toBeVisible();
      await expect(card.locator(`[data-country-flag="${program.code}"]`)).toBeVisible();
      await expect(card.locator('h2 a')).toHaveCount(0);
      await expect(card.getByRole('link')).toHaveCount(1);
      await expect(card.getByRole('link', { name: 'Official program', exact: true })).toHaveAttribute('href', program.officialUrl);
      for (const route of startingInvestments(program.routes)) await expect(card.getByText(program.status === 'Intake unverified' ? 'Intake unverified' : investmentAmount(route), { exact: false })).toBeVisible();
    }
    if (process.env.CITIZENSHIP_SCREENSHOTS) {
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const theme of ['light', 'dark']) {
          await page.evaluate(value => document.documentElement.classList.toggle('dark', value === 'dark'), theme);
          await page.waitForTimeout(250);
          await page.screenshot({ path: path.join(process.env.CITIZENSHIP_SCREENSHOTS, `directory-${width}-${theme}.png`), fullPage: true });
        }
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    await page.getByRole('searchbox', { name: 'Search citizenship programs' }).fill('Turkey');
    await expect(page.getByRole('article')).toHaveCount(1);
    await expect(page.getByRole('article')).toHaveAttribute('aria-label', 'Türkiye');
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    for (const kind of kinds) {
      await page.getByRole('combobox', { name: 'Investment route' }).selectOption(kind);
      const matching = citizenshipPrograms.filter(program => program.routes.some(route => route.kind === kind));
      await expect(page.getByRole('article')).toHaveCount(matching.length);
      for (const program of matching) {
        const card = page.getByRole('article', { name: program.country, exact: true });
        await expect(card.getByRole('link', { name: 'Official program', exact: true })).toHaveAttribute('href', officialProgramUrl(program, kind));
        for (const route of startingInvestments(program.routes.filter(route => route.kind === kind))) await expect(card.getByText(program.status === 'Intake unverified' ? 'Intake unverified' : investmentAmount(route), { exact: false })).toBeVisible();
      }
    }
    const filterProgram = citizenshipPrograms[0];
    const filterKind = filterProgram.routes[0].kind;
    await page.getByRole('combobox', { name: 'Investment route' }).selectOption(filterKind);
    await page.getByRole('combobox', { name: 'Region', exact: true }).selectOption(filterProgram.region);
    await expect(page.getByRole('article')).toHaveCount(citizenshipPrograms.filter(program => program.region === filterProgram.region && program.routes.some(route => route.kind === filterKind)).length);
    await page.getByRole('searchbox').fill('not-listed');
    await expect(page.getByText('No citizenship programs match these filters.')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
    const sorted = [...citizenshipPrograms].sort((a, b) => a.country.localeCompare(b.country));
    assert.deepEqual(await page.getByRole('article').evaluateAll(cards => cards.map(card => card.getAttribute('aria-label'))), sorted.map(program => program.country));
    const compared = sorted.slice(0, 3);
    assert.equal(compared.length, 3, 'The comparison regression needs at least three catalog countries');
    const firstCheckbox = page.getByRole('checkbox', { name: `Compare ${compared[0].country}`, exact: true });
    await firstCheckbox.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    assert.notEqual(await firstCheckbox.evaluate(element => getComputedStyle(element).boxShadow), 'none');
    await page.keyboard.press('Space');
    await expect(firstCheckbox).toBeChecked();
    await expect(page.getByRole('button', { name: 'Clear comparison' })).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(0);
    await page.getByRole('searchbox').fill('not-listed');
    await page.getByRole('button', { name: 'Clear comparison' }).click();
    await expect(page.getByRole('button', { name: 'Clear comparison' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
    for (const program of compared) await page.getByRole('checkbox', { name: `Compare ${program.country}`, exact: true }).check();
    await expect(page.getByRole('region', { name: 'Citizenship program comparison' })).toBeVisible();
    await page.getByRole('link', { name: 'Compare countries', exact: true }).click();
    await expect(page).toHaveURL(/#citizenship-comparison$/);
    await expect(page.locator('main details')).toHaveCount(compared.length * 2);
    await expect(page.locator('main a[href^="/citizenship/"]')).toHaveCount(0);
    const sources = page.getByRole('row').filter({ has: page.getByRole('rowheader', { name: 'Sources', exact: true }) });
    await expect(sources.getByRole('link')).toHaveCount(compared.length);
    assert.deepEqual(await sources.getByRole('link').evaluateAll(links => links.map(link => link.getAttribute('href'))), compared.map(program => program.officialUrl));
    for (const program of compared) {
      const header = page.getByRole('columnheader').filter({ has: page.getByText(program.country, { exact: true }) });
      await expect(header.locator(`[data-country-flag="${program.code}"]`)).toBeVisible();
      await expect(header.getByRole('link')).toHaveCount(0);
      for (const [label, field] of [['Conditions', 'capital'], ['Fees', 'fees']] as const) {
        const details = page.locator('details').filter({ has: page.locator('summary', { hasText: `${label} by route for ${program.country}` }) });
        await expect(details).not.toHaveAttribute('open');
        await details.locator('summary').focus();
        await page.keyboard.press('Enter');
        await expect(details.getByRole('definition')).toHaveText(program.routes.map(route => route[field]));
        for (const definition of await details.getByRole('definition').all()) await expect(definition).toBeVisible();
        await page.keyboard.press('Space');
        await expect(details).not.toHaveAttribute('open');
      }
    }
    if (citizenshipPrograms.length > 3) {
      await expect(page.getByRole('checkbox', { disabled: true })).toHaveCount(citizenshipPrograms.length - 3);
      const fourth = citizenshipPrograms.find(program => !compared.some(item => item.slug === program.slug))!;
      await expect(page.getByRole('checkbox', { name: `Compare ${fourth.country}`, exact: true })).toBeDisabled();
      await firstCheckbox.uncheck();
      await expect(page.getByRole('checkbox', { name: `Compare ${fourth.country}`, exact: true })).toBeEnabled();
      await firstCheckbox.check();
    } else console.log('Three-entry baseline: browser limit-disable check awaits a fourth catalog country.');
    await page.reload();
    await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(3);
    await page.getByRole('searchbox').fill('not-listed');
    await expect(page.getByRole('article')).toHaveCount(0);
    await expect(page.getByRole('table').getByRole('columnheader')).toHaveCount(4);
    await page.getByRole('button', { name: `Remove ${compared[0].country}`, exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('table').getByRole('columnheader')).toHaveCount(3);
    await page.getByRole('button', { name: 'Clear comparison' }).click();
    await expect(page.getByRole('table')).toHaveCount(0);
    const comparison = new URLSearchParams({ compare: ['unknown', compared[0].slug, ...compared.map(program => program.slug), ...citizenshipPrograms.map(program => program.slug)].join(',') });
    await page.goto(`${origin}/citizenship?${comparison}`);
    await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(3);

    const checks: Array<{ width: number; theme: string; contrast: number }> = [];
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(value => document.documentElement.classList.toggle('dark', value === 'dark'), theme);
        await page.waitForTimeout(250);
        await expect(page.getByRole('region', { name: 'Citizenship program comparison' })).toBeVisible();
        const metrics = await page.evaluate(() => {
          const background = getComputedStyle(document.body).backgroundColor;
          const foreground = getComputedStyle(document.querySelector('main .text-muted-foreground')!).color;
          const luminance = (color: string) => {
            const channels = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => { const normalized = value / 255; return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4; });
            return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
          };
          const values = [luminance(background), luminance(foreground)].sort((a, b) => b - a);
          const cell = document.querySelector('main td.text-muted-foreground')!;
          const cellValues = [luminance(getComputedStyle(cell).color), luminance(getComputedStyle(cell.closest('[role="region"]')!).backgroundColor)].sort((a, b) => b - a);
          return { overflow: document.documentElement.scrollWidth > innerWidth, contrast: (values[0] + 0.05) / (values[1] + 0.05), cellContrast: (cellValues[0] + 0.05) / (cellValues[1] + 0.05) };
        });
        assert.equal(metrics.overflow, false, `${width}px ${theme} page overflow`);
        assert.ok(metrics.contrast >= 4.5, `${width}px ${theme} muted-text contrast ${metrics.contrast}`);
        assert.ok(metrics.cellContrast >= 4.5, `${width}px ${theme} table-text contrast ${metrics.cellContrast}`);
        const smallTargets = await page.locator('main [data-listing-toolbar] input, main select, main [role="article"] label, main [role="article"] a, main summary, main button:not([role="checkbox"])').evaluateAll(elements => elements.filter(element => { const box = element.getBoundingClientRect(); return box.height < 44 || box.width < 44; }).map(element => element.textContent || element.getAttribute('aria-label')));
        assert.deepEqual(smallTargets, [], `${width}px ${theme} undersized controls`);
        checks.push({ width, theme, contrast: Number(metrics.contrast.toFixed(2)) });
        if (width === 320) {
          const region = page.getByRole('region', { name: 'Citizenship program comparison' });
          await expect(page.getByText('Scroll sideways to see all columns')).toBeVisible();
          await region.focus();
          await page.keyboard.press('ArrowRight');
          await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
        }
        if (process.env.CITIZENSHIP_SCREENSHOTS && [1440, 390].includes(width)) await page.screenshot({ path: path.join(process.env.CITIZENSHIP_SCREENSHOTS, `citizenship-${width}-${theme}.png`), fullPage: true });
      }
    }
    await page.evaluate(() => document.documentElement.style.fontSize = '200%');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Directory enlarged text overflow');
    await page.evaluate(() => document.documentElement.style.fontSize = '');

    await page.setViewportSize({ width: 1440, height: 1000 });
    const legacyQuery = new URLSearchParams({ compare: 'dominica,turkiye', utm_campaign: 'citizenship review', utm_content: 'a&b' });
    const crawlerHeaders = { 'User-Agent': 'TelegramBot' };
    for (const program of citizenshipPrograms) {
      for (const headers of [humanHeaders, crawlerHeaders]) {
        const response = await fetch(`${origin}/citizenship/${program.slug}?${legacyQuery}`, { headers, redirect: 'manual' });
        assert.equal(response.status, 308, `${program.slug} legacy redirect`);
        const destination = new URL(response.headers.get('location')!, origin);
        assert.equal(destination.pathname, '/citizenship');
        assert.equal(destination.hash, `#${program.slug}`);
        assert.deepEqual([...destination.searchParams], [...legacyQuery]);
      }
      await page.goto(`${origin}/citizenship#${program.slug}`);
      await expect(page.getByRole('article', { name: program.country, exact: true })).toBeInViewport();
      assert.equal(new URL(page.url()).hash, `#${program.slug}`);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://hashtagweb3.com/citizenship');
    }
    for (const [suffix, attribution] of Object.entries(SOCIAL_UTM_MAP)) {
      for (const headers of [humanHeaders, crawlerHeaders]) {
        const response = await fetch(`${origin}/citizenship/malta/${suffix}?${legacyQuery}`, { headers, redirect: 'manual' });
        assert.equal(response.status, 308, `${suffix} legacy social redirect`);
        const destination = new URL(response.headers.get('location')!, origin);
        assert.equal(destination.pathname, `/citizenship/${suffix}`);
        assert.equal(destination.hash, '#malta');
        assert.deepEqual([...destination.searchParams], [...legacyQuery]);
        const rootSocial = await fetch(destination, { headers, redirect: 'manual' });
        if (headers === crawlerHeaders) {
          assert.equal(rootSocial.status, 200, `${suffix} root crawler preview`);
          assert.match(await rootSocial.text(), /<link rel="canonical" href="https:\/\/hashtagweb3.com\/citizenship"/);
        } else {
          assert.equal(rootSocial.status, 307, `${suffix} root social attribution`);
          const rootDestination = new URL(rootSocial.headers.get('location')!, origin);
          assert.equal(rootDestination.pathname, '/citizenship');
          for (const [key, value] of legacyQuery) assert.equal(rootDestination.searchParams.get(key), value);
          for (const [key, value] of Object.entries(attribution)) assert.equal(rootDestination.searchParams.get(key), value);
        }
      }
    }
    for (const legacyPath of ['/citizenship/malta', '/citizenship/malta/tg']) {
      await page.goto(`${origin}${legacyPath}?${legacyQuery}`);
      const destination = new URL(page.url());
      assert.equal(destination.pathname, '/citizenship');
      assert.equal(destination.hash, '#malta');
      for (const [key, value] of legacyQuery) assert.equal(destination.searchParams.get(key), value);
      await expect(page.getByRole('article', { name: 'Malta', exact: true })).toBeInViewport();
      await expect.poll(() => page.locator('#malta').evaluate(card => card.getBoundingClientRect().top)).toBe(96);
      await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(2);
    }
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(`${origin}/citizenship#vanuatu`);
    await page.reload();
    await expect(page.getByRole('article', { name: 'Vanuatu', exact: true })).toBeInViewport();
    await expect.poll(() => page.locator('#vanuatu').evaluate(card => card.getBoundingClientRect().top)).toBe(96);
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const unknownPath of ['/citizenship/not-a-country', '/citizenship/not-a-country/tg', '/citizenship/malta/not-a-platform', '/citizenship/malta/tg/extra']) {
      for (const headers of [humanHeaders, crawlerHeaders]) assert.equal((await fetch(`${origin}${unknownPath}`, { headers })).status, 404, unknownPath);
    }
    if (!uiOnly) {
      await page.getByRole('navigation', { name: 'Related mobility resources' }).getByRole('link', { name: 'Passport entry', exact: true }).click();
      await expect(page.getByRole('combobox', { name: 'Your passport' })).toBeVisible();
      await page.goto(`${origin}/nomads`);
      await expect(page.getByRole('main').getByRole('link', { name: 'Visas', exact: true })).toHaveAttribute('href', '/visas');
      await page.getByRole('main').getByRole('link', { name: 'Citizenship', exact: true }).click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Citizenship by investment');
      const data = await (await fetch(`${origin}/data/citizenship.json`)).json();
      assert.deepEqual(data, JSON.parse(readFileSync('content/citizenship.json', 'utf8')));
      const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
      assert.deepEqual([...sitemap.matchAll(/<loc>([^<]*\/citizenship[^<]*)<\/loc>/g)].map(match => match[1]), ['https://hashtagweb3.com/citizenship']);
      const jsonSitemap = await (await fetch(`${origin}/.well-known/sitemap.json`)).json();
      const sitemapRoutes: Array<{ url: string }> = JSON.parse(readFileSync('content/sitemap-routes.json', 'utf8'));
      for (const routes of [jsonSitemap.urls, sitemapRoutes]) assert.deepEqual(routes.filter((route: { url: string }) => route.url.includes('/citizenship')).map((route: { url: string }) => route.url), ['https://hashtagweb3.com/citizenship']);
      assert.deepEqual((await collectOgPreviewPaths()).filter(route => route.startsWith('/citizenship')), ['/citizenship']);
      const previewManifest = JSON.parse(readFileSync('public/preview/.preview-manifest.json', 'utf8'));
      assert.deepEqual(Object.keys(previewManifest).filter(route => route.startsWith('/citizenship')), ['/citizenship']);
      if (existsSync('public/preview/citizenship')) assert.deepEqual(readdirSync('public/preview/citizenship'), []);
      const prerenderManifest = JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8'));
      assert.deepEqual(Object.keys(prerenderManifest.routes).filter(route => route.startsWith('/citizenship')), ['/citizenship']);
      assert.ok(!Object.keys(prerenderManifest.dynamicRoutes).some(route => route.startsWith('/citizenship')));
      for (const route of ['/citizenship', '/citizenship/tg']) {
        const preview = await fetch(`${origin}${route}`, { headers: crawlerHeaders, redirect: 'manual' });
        assert.equal(preview.status, 200);
        assert.match(await preview.text(), /<link rel="canonical" href="https:\/\/hashtagweb3.com\/citizenship"/);
      }
    }
    assert.deepEqual(errors, [], 'Browser runtime/hydration errors');
    assert.deepEqual(failedLocalRequests, [], 'Failed local browser requests');
    console.log(`Citizenship browser checks passed for ${citizenshipPrograms.length} countries on one page: catalog-derived filters and prices, official URL consistency, plain country headings, compact cards, zero/one/two/three selection states, keyboard selection/removal, existing fee disclosures, flags and names, URL reload, malformed comparisons, responsive scrolling, same-page card anchors, 308 legacy redirects, all ${Object.keys(SOCIAL_UTM_MAP).length} social suffixes, preserved queries and fragments, canonical metadata and unknown-country 404.${uiOnly ? ' UI-only run: production Nomads discovery and generated-asset checks remain for the final build.' : ' Production Nomads/Visas discovery, unchanged static catalog, root-only sitemaps, prerender routes and crawler previews also passed.'}`);
    console.table(checks);
  } finally {
    await browser.close();
    server?.kill('SIGTERM');
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
