import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { chromium, type Browser, type Page } from 'playwright';
import { load } from 'cheerio';

export function monitorBrowserHealth(page: Page, origin: string, blockedExternalRequests: Set<string>) {
  const failures: string[] = [];
  const resources = { script: new Set<string>(), stylesheet: new Set<string>(), font: new Set<string>(), image: new Set<string>() };
  page.on('response', response => {
    if (new URL(response.url()).origin !== origin) return;
    const type = response.request().resourceType();
    if (response.status() >= 400) failures.push(`HTTP ${response.status()} ${type} ${response.url()}`);
    else if (type in resources) resources[type as keyof typeof resources].add(response.url());
  });
  page.on('requestfailed', request => {
    if (new URL(request.url()).origin === origin) failures.push(`Request failed (${request.failure()?.errorText}) ${request.resourceType()} ${request.url()}`);
  });
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const url = message.location().url;
    if (blockedExternalRequests.has(url) && new URL(url).origin !== origin && /^Failed to load resource: net::ERR_(?:ABORTED|FAILED|BLOCKED_BY_CLIENT)(?:\.Inspector)?$/.test(message.text())) return;
    failures.push(`Console error: ${message.text()}${url ? ` (${url})` : ''}`);
  });
  page.on('pageerror', error => failures.push(`Page error: ${error.message}`));
  return {
    assertHealthy(label: string) {
      assert.equal(failures.length, 0, `${label}: browser failures\n${failures.join('\n')}`);
    },
    resourceCounts() {
      return { scripts: resources.script.size, stylesheets: resources.stylesheet.size, fonts: resources.font.size, images: resources.image.size };
    },
  };
}

export async function assertResourceMenuHydrated(page: Page, timeout = 10000): Promise<void> {
  const trigger = page.getByRole('button', { name: 'Toggle resources menu' });
  const menu = page.locator('[role="menu"][aria-label="Resources Dropdown"]');
  assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'Resources menu initially closed');
  assert.equal(await menu.isVisible(), false);
  await trigger.click({ timeout });
  await menu.waitFor({ state: 'visible', timeout });
  assert.equal(await trigger.getAttribute('aria-expanded'), 'true', 'Client click opened Resources');
  assert.ok(await menu.getByRole('menuitem').count(), 'Client-rendered menu has navigation items');
  await page.keyboard.press('Escape');
  await menu.waitFor({ state: 'hidden', timeout });
  assert.equal(await trigger.getAttribute('aria-expanded'), 'false', 'Client Escape closed Resources');
  assert.equal(await trigger.evaluate(element => element === document.activeElement), true, 'Resources returned keyboard focus');
}

async function assertImagesAndFontsReady(page: Page): Promise<void> {
  const failedFonts = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter(font => font.status === 'error').map(font => font.family);
  });
  assert.deepEqual(failedFonts, [], 'Local web fonts must decode');
  const failedImages = await page.evaluate(async () => {
    const images = [...document.images].filter(image => {
      const src = image.currentSrc || image.src;
      return src && new URL(src, location.href).origin === location.origin;
    });
    return (await Promise.all(images.map(async image => {
      image.loading = 'eager';
      try { await image.decode(); } catch { return image.currentSrc || image.src; }
      return image.complete && image.naturalWidth > 0 ? null : image.currentSrc || image.src;
    }))).filter(Boolean);
  });
  assert.deepEqual(failedImages, [], 'Local images must load and decode');
}

async function main() {
  const socket = net.createServer();
  await new Promise<void>(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = (socket.address() as net.AddressInfo).port;
  await new Promise<void>((resolve, reject) => socket.close(error => error ? reject(error) : resolve()));
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ['.next/standalone/server.js'], { cwd: process.cwd(), env: { ...process.env, PORT: String(port), HOSTNAME: '127.0.0.1', NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  server.stdout.on('data', chunk => { output += chunk; }); server.stderr.on('data', chunk => { output += chunk; });
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ javaScriptEnabled: true, serviceWorkers: 'block', viewport: { width: 1440, height: 900 } });
    const blockedExternalRequests = new Set<string>();
    await context.route('**/*', route => {
      const request = route.request();
      if (new URL(request.url()).origin === origin && ['GET', 'HEAD'].includes(request.method())) return route.continue();
      if (new URL(request.url()).origin !== origin) blockedExternalRequests.add(request.url());
      return route.abort('blockedbyclient');
    });
    await context.addInitScript(() => localStorage.setItem('hw3_popup_dismissed', 'true'));
    for (let attempt = 0; ; attempt++) {
      try { if ((await fetch(`${origin}/bit2me`)).ok) break; } catch {}
      if (attempt >= 60) throw new Error(`Standalone server did not start: ${output}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    const profiles = JSON.parse(fs.readFileSync('content/company-profile-overrides.json', 'utf8'));
    const companies = JSON.parse(fs.readFileSync('content/companies-runtime.json', 'utf8'));
    const queue = Object.entries(profiles) as [string, { name: string; website: string; description: string; logo: string; socialLinks: Record<string, string> }][];
    let checked = 0;
    await Promise.all(Array.from({ length: 6 }, async () => {
      for (;;) {
        const target = queue.shift(); if (!target) return;
        const [slug, row] = target;
        const response = await fetch(`${origin}/${slug}`, { signal: AbortSignal.timeout(20000) });
        assert.equal(response.status, 200, `${slug}: production HTTP`);
        const $ = load(await response.text());
        assert.equal($('h1').text(), row.name, `${slug}: name`);
        assert.ok($('body').text().includes(row.description), `${slug}: About`);
        assert.ok($(`a[href="${row.website}"]`).length, `${slug}: official root link`);
        for (const url of Object.values(row.socialLinks)) assert.ok($(`a[href="${url}"]`).length, `${slug}: verified social`);
        assert.ok($('title').text().includes(row.name));
        assert.equal($('link[rel="canonical"]').attr('href'), `https://hashtagweb3.com/${slug}`);
        const og = $('meta[property="og:image"]').attr('content') || '';
        assert.ok(og.includes(`/og/companies/${slug}.png`), `${slug}: branded OG`);
        const image = await fetch(`${origin}${new URL(og).pathname}`);
        assert.equal(image.status, 200); assert.ok(image.headers.get('content-type')?.includes('image/png'));
        const logo = await fetch(`${origin}${row.logo}`);
        assert.equal(logo.status, 200); assert.ok(logo.headers.get('content-type')?.includes('image/png'));
        const organization = $('script[type="application/ld+json"]').map((_, el) => { try { return JSON.parse($(el).text()); } catch { return null; } }).get().find(schema => schema?.['@type'] === 'Organization' && schema.name === row.name);
        assert.ok(organization); assert.equal(organization.description, row.description);
        assert.deepEqual(new Set(organization.sameAs || []), new Set(Object.values(row.socialLinks)));
        if (!companies[slug].jobCount) assert.ok($('body').text().includes('No open roles currently listed'), `${slug}: honest zero jobs`);
        const shell = await fetch(`${origin}/${slug}`, { headers: { 'User-Agent': 'Twitterbot/1.0' } });
        assert.equal(shell.status, 200); assert.ok((await shell.text()).includes(row.description));
        checked++;
      }
    }));
    const hydratedSamples = ['bit2me', 'coinmotion', 'axiom', 'eco-protocol', 'double-jump-tokyo'];
    const browserEvidence = [];
    for (const slug of [...hydratedSamples, '']) {
      const page = await context.newPage();
      const label = slug || 'homepage';
      const health = monitorBrowserHealth(page, origin, blockedExternalRequests);
      try {
        const response = await page.goto(`${origin}/${slug}`, { waitUntil: 'networkidle', timeout: 30000 });
        assert.equal(response?.status(), 200, `${label}: production browser HTTP`);
        health.assertHealthy(label);
        if (slug) {
          const logo = page.getByAltText(`${profiles[slug].name} logo`).first();
          await logo.scrollIntoViewIfNeeded();
          await page.waitForFunction(name => { const img = [...document.images].find(img => img.alt === `${name} logo`); return img?.complete && img.naturalWidth > 0; }, profiles[slug].name);
          assert.ok(await logo.isVisible());
          assert.ok(!(await logo.getAttribute('src'))?.includes('gstatic.com'));
          assert.equal(await page.locator('h1').textContent(), profiles[slug].name);
        } else {
          const html = load(await response!.text());
          assert.equal(html('header [data-header-cta="job"]').length, 1, 'Homepage SSR must show the public-route Post a Job CTA');
          const cta = page.locator('header [data-header-cta="job"]');
          assert.equal(await cta.count(), 1, 'Homepage client must retain the Post a Job CTA');
          assert.equal(await cta.getAttribute('href'), 'https://t.me/web3jobs_rep');
          assert.ok(await cta.isVisible());
        }
        await assertImagesAndFontsReady(page);
        await assertResourceMenuHydrated(page);
        await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
        health.assertHealthy(label);
        const resources = health.resourceCounts();
        assert.ok(resources.scripts > 0 && resources.stylesheets > 0 && resources.fonts > 0 && resources.images > 0, `${label}: loaded local JS, CSS, fonts and images`);
        browserEvidence.push({ path: `/${slug}`, interaction: 'resources-menu-click-open-escape-close', resources, localRequestFailures: 0, consoleErrors: 0, pageErrors: 0 });
        console.log(`${label}: client Resources menu opened/closed; local JS/CSS/fonts/images decoded; no browser errors${slug ? `; ${companies[slug].jobCount} actual jobs` : ''}`);
      } catch (error) {
        health.assertHealthy(label);
        throw error;
      } finally {
        await page.close();
      }
    }
    const legacyEco = await fetch(`${origin}/eco`);
    const legacyHtml = load(await legacyEco.text());
    assert.notEqual(legacyHtml('h1').text(), 'Eco', 'Legacy job URL must not become the Eco company overview');
    assert.notEqual(legacyHtml('link[rel="canonical"]').attr('href'), 'https://hashtagweb3.com/eco-protocol');
    assert.ok(!legacyEco.url.endsWith('/eco-protocol'));
    const catalog = await (await fetch(`${origin}/data/companies-runtime.json`)).json();
    for (const slug of Object.keys(profiles)) assert.ok(catalog[slug], `${slug}: standalone public catalog`);
    fs.writeFileSync('content/sources/company-profile-browser-verification.json', JSON.stringify({ checkedAt: new Date().toISOString(), mode: 'production-standalone', employers: checked, companyPages: checked, hydratedSamples, homepageHydrated: true, browserEvidence, zeroJobPages: Object.keys(profiles).filter(slug => !companies[slug].jobCount).length, legacyEcoStatus: legacyEco.status, legacyEcoTitle: legacyHtml('h1').text() }, null, 2));
    console.log(`Production verification passed: ${checked} company pages, crawler shells, official assets, OG images, standalone catalog rows; ${hydratedSamples.length} company pages + homepage with verified client interactions and zero browser failures.`);
  } finally {
    try { await browser?.close(); } finally {
      if (server.exitCode === null && server.signalCode === null) {
        const exited = new Promise(resolve => server.once('exit', resolve));
        server.kill('SIGTERM');
        await exited;
      }
    }
  }
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
