import assert from 'node:assert/strict';
import { chromium, type Page } from 'playwright';
import puppeteer from 'puppeteer';
import jobs from '../content/homepage-jobs.json';
import events from '../content/events-runtime.json';

const baseUrl = process.env.HEADER_TEST_BASE_URL || 'http://127.0.0.1:3125';

async function headerState(page: Page) {
  return page.locator('body > div > header, body > header').first().evaluate((header) => {
    const boxes = ['a[aria-label="Hashtag Web3 Homepage"]', 'nav', '[data-header-action-slot]'].map((selector) => {
      const box = header.querySelector(selector)?.getBoundingClientRect();
      return box ? { x: box.x, y: box.y, width: box.width, height: box.height } : null;
    });
    return {
      height: header.getBoundingClientRect().height,
      logo: boxes[0],
      navigation: boxes[1],
      action: boxes[2],
      ctas: Array.from(header.querySelectorAll('[data-header-cta]')).map((element) => element.getAttribute('data-header-cta')),
    };
  });
}

async function assertCta(page: Page, kind: 'job' | 'event' | null) {
  await page.waitForFunction((expected) => {
    const ctas = Array.from(document.querySelectorAll('header [data-header-cta]'));
    return expected ? ctas.length === 1 && ctas[0].getAttribute('data-header-cta') === expected : ctas.length === 0;
  }, kind);
  if (kind) {
    const cta = page.locator('header [data-header-cta]');
    assert.equal(await cta.getAttribute('href'), 'https://t.me/web3jobs_rep');
    assert.equal(await cta.locator('button').count(), 0, 'CTA is a link, not a nested button');
    const box = await cta.boundingBox();
    assert.ok(box && box.height >= 44);
  }
}

async function main() {
  const browser = await chromium.launch({ executablePath: await puppeteer.executablePath(), headless: true });
  const errors: string[] = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => localStorage.setItem('hw3_popup_dismissed', 'true'));
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 180_000 });
    await page.evaluate(() => document.fonts.ready);
    await assertCta(page, 'job');
    const baseline = await headerState(page);
    const grid = await page.locator('main [data-job-key]').first().locator('..').boundingBox();
    assert.ok(grid && baseline.logo && baseline.action);
    assert.equal(baseline.logo.x, grid.x, 'Logo must align with the job grid');
    assert.equal(baseline.action.x + baseline.action.width, grid.x + grid.width, 'Posting button must align with the job grid');
    for (const [url, kind] of [['/events', 'event'], ['/jobs', 'job'], ['/news', null], ['/community', null], ['/', 'job']] as const) {
      const link = url === '/' ? page.locator('header a[aria-label="Hashtag Web3 Homepage"]') : page.locator(`header nav a[href="${url}"]`);
      await link.click();
      await page.waitForURL(`${baseUrl}${url}`, { timeout: 180_000 });
      await assertCta(page, kind);
      const current = await headerState(page);
      assert.deepEqual({ ...current, ctas: [] }, { ...baseline, ctas: [] }, `Header geometry changed on ${url}`);
    }
    const resourceButton = page.getByRole('button', { name: 'Toggle resources menu' });
    await resourceButton.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('menu').waitFor();
    assert.deepEqual(await headerState(page), baseline, 'Opening Resources moves the header');
    await page.keyboard.press('Escape');
    await page.getByRole('menu').waitFor({ state: 'hidden' });
    await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Toggle resources menu');
    assert.equal(await resourceButton.evaluate((element) => element === document.activeElement), true);
    const routes = [
      [`/${jobs.initialJobs[0].slug}`, 'job'],
      [`/${events.find((event) => event.slug === 'token2049')?.slug || events[0].slug}`, 'event'],
      ['/coinbase', null], ['/about', null], ['/this-route-does-not-exist', null],
    ] as const;
    for (const [route, kind] of routes) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 180_000 });
      await assertCta(page, kind);
    }
    for (const [route, selector] of [
      ['/amm', 'main article'],
      ['/audit-checklists-for-smart-contract-auditor', 'main article'],
      ['/learn/fundamentals/web3', 'main .site-container'],
      ['/glossary/defi', 'main section .site-container'],
    ] as const) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 180_000 });
      await page.evaluate(() => document.fonts.ready);
      const boxes = await page.evaluate((contentSelector) => {
        const headerEl = document.querySelector('header .site-container');
        const contentEl = document.querySelector(contentSelector);
        if (!headerEl || !contentEl) return { header: null, content: null };
        const hr = headerEl.getBoundingClientRect();
        const cr = contentEl.getBoundingClientRect();
        return {
          header: { x: Math.round(hr.x), width: Math.round(hr.width) },
          content: { x: Math.round(cr.x), width: Math.round(cr.width) },
        };
      }, selector);
      assert.ok(boxes.header && boxes.content, `Missing header/content containers on ${route}`);
      assert.equal(boxes.content.x, boxes.header.x, `Content left edge misaligned on ${route}`);
      assert.equal(boxes.content.width, boxes.header.width, `Content width misaligned on ${route}`);
    }
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${baseUrl}/events`, { waitUntil: 'domcontentloaded', timeout: 180_000 });
      await assertCta(page, 'event');
      await page.waitForLoadState('load');
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
      for (const dark of [false, true]) {
        await page.evaluate((enabled) => document.documentElement.classList.toggle('dark', enabled), dark);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, `Overflow at ${width}px`);
        if (width < 1024) {
          const before = await headerState(page);
          await page.getByRole('button', { name: 'Toggle navigation menu' }).click();
          await page.getByRole('dialog', { name: 'Mobile Navigation' }).waitFor();
          assert.deepEqual(await headerState(page), before, 'Mobile menu moves the header');
          assert.equal(await page.getByRole('dialog').locator('[data-header-cta]').count(), 0, 'No duplicate posting button in mobile menu');
          if (width === 390 && !dark) {
            await page.getByRole('dialog').getByRole('link', { name: 'Jobs', exact: true }).click();
            await page.waitForURL(`${baseUrl}/jobs`);
            await page.getByRole('dialog').waitFor({ state: 'hidden' });
            await assertCta(page, 'job');
            await page.getByRole('button', { name: 'Toggle navigation menu' }).click();
            await page.getByRole('dialog').getByRole('link', { name: 'Events', exact: true }).click();
            await page.waitForURL(`${baseUrl}/events`);
            await page.getByRole('dialog').waitFor({ state: 'hidden' });
            await assertCta(page, 'event');
            await page.getByRole('button', { name: 'Toggle navigation menu' }).click();
          }
          await page.keyboard.press('Escape');
          await page.getByRole('dialog').waitFor({ state: 'hidden' });
        }
      }
    }
    await page.close();
    const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const initial = await noJs.newPage();
    for (const [route, kind] of [['/', 'job'], ['/events', 'event'], [routes[0][0], 'job'], ['/about', null]] as const) {
      await initial.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 180_000 });
      const ctas = await initial.locator('header [data-header-cta]').all();
      assert.equal(ctas.length, kind ? 1 : 0, `Incorrect server-rendered CTA for ${route}`);
      if (kind) assert.equal(await ctas[0].getAttribute('data-header-cta'), kind);
    }
    await noJs.close();
    assert.deepEqual(errors, []);
    console.log('Header browser checks passed: stable client navigation, contextual CTAs, first paint, keyboard menus, light/dark, and 320–1440px layouts.');
  } finally {
    await browser.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
