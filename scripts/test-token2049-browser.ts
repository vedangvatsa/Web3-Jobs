import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import type { Web3Event } from '../src/lib/events';
import { hasEventEnded } from './lib/event-dates.mjs';

async function main() {
  const imported = JSON.parse(fs.readFileSync('content/events/sources/token2049-discovered.json', 'utf8')) as Web3Event[];
  const catalog = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
  const requestedSlugs = new Set(process.argv.slice(2));
  const events = imported.filter(event => !hasEventEnded(event) && (!requestedSlugs.size || requestedSlugs.has(event.slug!))).map(event => {
    const published = catalog.find(row => row.id === event.id);
    assert.ok(published, `Missing event: ${event.slug}`);
    return published;
  });
  assert.ok(events.length > 0, 'No active events matched the browser audit');
  for (const slug of requestedSlugs) assert.ok(events.some(event => event.slug === slug), `Event not found or ended: ${slug}`);
  for (const event of events) {
    assert.ok(event.coverImage?.startsWith('/events/'), `Missing self-hosted cover: ${event.slug}`);
    const metadata = await sharp(path.join('public', event.coverImage)).metadata();
    assert.equal(metadata.format, 'webp', event.slug);
    assert.ok(metadata.width && metadata.width >= 100 && metadata.height && metadata.height >= 100, event.slug);
  }

  const base = process.env.EVENT_TEST_URL || 'http://127.0.0.1:3151';
  if (!process.env.EVENT_TEST_URL) {
    fs.cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
  }
  const server = process.env.EVENT_TEST_URL ? undefined : spawn(process.execPath, ['.next/standalone/server.js'], {
    env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: '3151', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  server?.stdout.on('data', data => { logs += data; });
  server?.stderr.on('data', data => { logs += data; });
  let browser;
  try {
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      try { ready = (await fetch(`${base}/data/events-runtime.json`, { signal: AbortSignal.timeout(3000) })).ok; } catch {}
      if (ready) break;
      if (server?.exitCode !== null && server?.exitCode !== undefined) throw new Error(logs);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    assert.ok(ready, logs || `Server unavailable: ${base}`);
    browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || await puppeteer.executablePath(), headless: true });
    const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36' });
    await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    const problems: Array<{ slug?: string; error: string }> = [];
    fs.mkdirSync('.cache/event-verification', { recursive: true });
    let nextIndex = 0;
    let checked = 0;
    await Promise.all(Array.from({ length: 4 }, async () => {
      const page = await context.newPage();
      while (nextIndex < events.length) {
        const event = events[nextIndex++];
        try {
          await page.setViewportSize({ width: 1440, height: 1000 });
          const response = await page.goto(`${base}/${event.slug}`, { waitUntil: 'load', timeout: 60000 });
          assert.equal(response?.status(), 200, event.slug);
          assert.ok(await page.locator('link[rel="stylesheet"]').evaluateAll(links => links.length > 0 && links.every(link => Boolean((link as HTMLLinkElement).sheet))), `Stylesheets failed to load: ${event.slug}`);
          assert.equal(await page.locator('main h1').count(), 1);
          assert.equal((await page.locator('main h1').innerText()).trim(), event.name);
          await page.waitForFunction(name => [...document.querySelectorAll<HTMLImageElement>('main img')].some(image => image.alt === name && image.complete && image.naturalWidth > 0), event.name, { timeout: 15000 });
          await page.evaluate(() => document.fonts.ready);
          for (const width of [1440, 390, 320]) {
            await page.setViewportSize({ width, height: 1000 });
            for (const theme of ['light', 'dark']) {
              await page.evaluate(dark => document.documentElement.classList.toggle('dark', dark), theme === 'dark');
              const measurement = await page.evaluate(name => {
                const heading = document.querySelector<HTMLElement>('main h1')!;
                const description = document.querySelector<HTMLElement>('[data-event-description]')!;
                const image = [...document.querySelectorAll<HTMLImageElement>('main img')].find(item => item.alt === name)!;
                const box = image.getBoundingClientRect();
                const range = document.createRange();
                range.selectNodeContents(heading);
                const textRects = [...range.getClientRects()];
                let clippedHeading = textRects.some(rect => rect.left < -1 || rect.right > innerWidth + 1);
                for (let ancestor: HTMLElement | null = heading; ancestor; ancestor = ancestor.parentElement) {
                  const style = getComputedStyle(ancestor);
                  const bounds = ancestor.getBoundingClientRect();
                  const clipsX = /hidden|clip|auto|scroll/.test(style.overflowX);
                  const clipsY = /hidden|clip|auto|scroll/.test(style.overflowY);
                  if (textRects.some(rect => (clipsX && (rect.left < bounds.left - 1 || rect.right > bounds.right + 1))
                    || (clipsY && (rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1)))) clippedHeading = true;
                }
                return {
                  overflow: document.documentElement.scrollWidth > innerWidth + 1,
                  clippedHeading,
                  descriptionAvailable: description.dataset.contentStatus !== 'unavailable' && Boolean(description.innerText.trim()),
                  emptyBlocks: [...description.querySelectorAll('p,h2,h3')].filter(element => !element.textContent?.trim() && !element.children.length).length,
                  leakedMarkup: /###(?:BLOCK|HEADING)###|(?:^|\n)#{2,6}\s|\*\*[^*\n]+\*\*/.test(description.innerText),
                  fit: getComputedStyle(image).objectFit,
                  imageLoaded: image.complete && image.naturalWidth > 0 && box.width > 0 && box.height > 0,
                  imageInsideViewport: box.left >= -1 && box.right <= innerWidth + 1 && box.height <= 360,
                  aspectRatioError: Math.abs(box.width / box.height / (image.naturalWidth / image.naturalHeight) - 1),
                };
              }, event.name);
              const label = `${event.slug} ${width}px ${theme}: ${JSON.stringify(measurement)}`;
              assert.equal(measurement.overflow, false, label);
              assert.equal(measurement.clippedHeading, false, label);
              assert.equal(measurement.descriptionAvailable, true, label);
              assert.equal(measurement.emptyBlocks, 0, label);
              assert.equal(measurement.leakedMarkup, false, label);
              assert.equal(measurement.fit, 'contain', label);
              assert.equal(measurement.imageLoaded && measurement.imageInsideViewport, true, label);
              assert.ok(measurement.aspectRatioError < 0.03, label);
            }
          }
        } catch (error) {
          problems.push({ slug: event.slug, error: error instanceof Error ? error.message : String(error) });
          if (problems.length <= 2) await page.screenshot({ path: `.cache/event-verification/${event.slug}-formatting.png`, fullPage: true });
        }
        checked++;
        if (checked % 40 === 0) console.log(`Checked ${checked}/${events.length} event pages.`);
      }
      await page.close();
    }));
    fs.mkdirSync('.cache/event-verification', { recursive: true });
    fs.writeFileSync('.cache/event-verification/token2049-browser-report.json', JSON.stringify({ checkedAt: new Date().toISOString(), checked, viewports: [1440, 390, 320], themes: ['light', 'dark'], problems }, null, 2));
    assert.equal(problems.length, 0, `${problems.length} page failures; details in .cache/event-verification/token2049-browser-report.json`);
    console.log(`Passed: ${events.length} event pages and covers; desktop 1440px, mobile 390/320px; light/dark; no overflow, clipped headings, leaked markup, or distorted covers.`);
  } finally {
    await browser?.close();
    server?.kill('SIGTERM');
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
