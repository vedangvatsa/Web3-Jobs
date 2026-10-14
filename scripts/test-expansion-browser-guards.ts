import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import { chromium, type Browser } from 'playwright';
import { assertResourceMenuHydrated, monitorBrowserHealth } from './test-expansion-company-profiles-browser';

const origin = 'http://127.0.0.1:32123';
const menuScript = `
  window.next = {};
  const trigger = document.querySelector('button');
  const menu = document.querySelector('[role="menu"]');
  trigger.addEventListener('click', () => { menu.hidden = false; trigger.setAttribute('aria-expanded', 'true'); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { menu.hidden = true; trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); }
  });
`;
const logo = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8"/></svg>')}`;
const documentHtml = (resources: string) => `<!doctype html><html><head><meta charset="utf-8"></head><body>
  <h1>SSR company</h1><img alt="SSR logo" src="${logo}">
  <button id="resources-trigger" aria-label="Toggle resources menu" aria-expanded="false">Resources</button>
  <div role="menu" aria-label="Resources Dropdown" aria-labelledby="resources-trigger" hidden><a role="menuitem" href="/resources">Resources</a></div>
  ${resources}</body></html>`;

async function fixture(browser: Browser, t: TestContext, options: { resources?: string; script?: string; javaScriptEnabled?: boolean; abortScript?: boolean } = {}) {
  const context = await browser.newContext({ javaScriptEnabled: options.javaScriptEnabled ?? true, serviceWorkers: 'block' });
  t.after(() => context.close());
  const blocked = new Set<string>();
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) {
      blocked.add(url.href);
      return route.abort('blockedbyclient');
    }
    if (url.pathname === '/') return route.fulfill({ status: 200, contentType: 'text/html', body: documentHtml(options.resources ?? '<script src="/_next/static/current.js"></script>') });
    if (url.pathname === '/_next/static/current.js') {
      if (options.abortScript) {
        blocked.add(url.href);
        return route.abort('aborted');
      }
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: options.script ?? menuScript });
    }
    if (url.pathname === '/favicon.ico') return route.fulfill({ status: 204 });
    return route.fulfill({ status: 404, contentType: 'text/plain', body: 'missing fixture asset' });
  });
  const page = await context.newPage();
  const health = monitorBrowserHealth(page, origin, blocked);
  await page.goto(origin, { waitUntil: 'networkidle' });
  return { page, health, blocked };
}

test('company browser checks reject SSR-only false positives and local failures', { timeout: 60000 }, async t => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());

  await t.test('enabled JavaScript must open and close the client menu', async t => {
    const { page, health } = await fixture(browser, t);
    await assertResourceMenuHydrated(page);
    health.assertHealthy('working fixture');
    assert.equal(health.resourceCounts().scripts, 1);
  });

  await t.test('SSR h1 and decoded logo pass while the missing module is now rejected', async t => {
    const { page, health } = await fixture(browser, t, { resources: '<script type="module" src="/_next/static/missing-module.js"></script>' });
    assert.equal(await page.locator('h1').textContent(), 'SSR company');
    assert.equal(await page.getByAltText('SSR logo').evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0), true);
    assert.throws(() => health.assertHealthy('missing module'), /HTTP 404 script .*missing-module\.js/);
    await assert.rejects(assertResourceMenuHydrated(page, 500), /Timeout/);
  });

  await t.test('window.next alone is not hydration evidence', async t => {
    const { page, health } = await fixture(browser, t, { script: 'window.next = {};' });
    health.assertHealthy('inert fixture');
    assert.equal(await page.evaluate(() => 'next' in window), true);
    await assert.rejects(assertResourceMenuHydrated(page, 500), /Timeout/);
  });

  await t.test('disabled JavaScript fails interaction even with intact SSR', async t => {
    const { page, health } = await fixture(browser, t, { javaScriptEnabled: false });
    assert.equal(await page.locator('h1').textContent(), 'SSR company');
    health.assertHealthy('SSR fixture');
    await assert.rejects(assertResourceMenuHydrated(page, 500), /Timeout/);
  });

  for (const [kind, resource] of [
    ['stylesheet', '<link rel="stylesheet" href="/_next/static/missing.css">'],
    ['font', '<style>@font-face{font-family:Missing;src:url(/_next/static/missing.woff2)}h1{font-family:Missing}</style>'],
    ['image', '<img src="/images/missing.png" alt="Missing">'],
    ['data', '<script>fetch("/data/missing.json")</script>'],
  ]) {
    await t.test(`local ${kind} failures are fatal`, async t => {
      const { health } = await fixture(browser, t, { resources: `<script src="/_next/static/current.js"></script>${resource}` });
      assert.throws(() => health.assertHealthy(kind), /HTTP 404|Request failed|Console error/);
    });
  }

  await t.test('internal ERR_ABORTED cannot be excluded as analytics noise', async t => {
    const { health } = await fixture(browser, t, { abortScript: true });
    assert.throws(() => health.assertHealthy('local abort'), /Request failed \(net::ERR_ABORTED\).*current\.js/);
  });

  await t.test('intentional external analytics blocking is allowed without hiding local hydration errors', async t => {
    const resources = '<script src="https://analytics.example.invalid/analytics.js"></script><script src="/_next/static/current.js"></script>';
    const healthy = await fixture(browser, t, { resources });
    assert.equal(healthy.blocked.size, 1);
    await assertResourceMenuHydrated(healthy.page);
    healthy.health.assertHealthy('blocked external analytics');
    const broken = await fixture(browser, t, { resources, script: `${menuScript}\nconsole.error('React hydration failed on homepage');` });
    await assertResourceMenuHydrated(broken.page);
    assert.throws(() => broken.health.assertHealthy('React console'), /Console error: React hydration failed/);
  });

  await t.test('uncaught React/page errors fail even when the client menu works', async t => {
    const { page, health } = await fixture(browser, t, { script: `${menuScript}\nthrow new Error('Minified React error #418');` });
    await assertResourceMenuHydrated(page);
    assert.throws(() => health.assertHealthy('homepage'), /Page error: Minified React error #418/);
  });
});
