import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from '@playwright/test';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { NOMAD_TOOLS } from '../src/lib/nomads/routes';

const label = process.argv.find(value => value.startsWith('--label='))?.slice(8) || 'review';
assert.match(label, /^[a-z0-9-]+$/);
const output = path.resolve(`.cache/nomads/design-${label}`);
const origin = process.env.NOMAD_REVIEW_BASE_URL || 'http://127.0.0.1:3186';
const routes = process.argv.includes('--city-details') ? ['/resources', '/nomads/cities/lisbon', '/nomads/cities/chiang-mai', '/nomads/cities/madrid'] : [
  '/resources', '/salary-calculator', '/remote-work-checklist', '/events',
  ...NOMAD_TOOLS.map(tool => tool.href),
  '/digital-nomad-visas?tab=checker&passport=india',
  '/nomads/cities/lisbon', '/nomads/cities/ho-chi-minh-city', '/nomads/cities/madrid',
];
const modes = [
  { name: 'desktop', width: 1440, height: 1000, dark: false },
  { name: 'mobile', width: 390, height: 900, dark: false },
  ...(process.argv.includes('--dark') ? [{ name: 'dark', width: 390, height: 900, dark: true }] : []),
];

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const standalone = path.resolve('.next/standalone');
  if (!process.env.NOMAD_REVIEW_BASE_URL) fs.cpSync('.next/static', path.join(standalone, '.next/static'), { recursive: true });
  const server = process.env.NOMAD_REVIEW_BASE_URL ? undefined : spawn(process.execPath, [path.join(standalone, 'server.js')], { cwd: standalone, env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: '3186' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  server?.stdout?.on('data', chunk => logs += chunk);
  server?.stderr?.on('data', chunk => logs += chunk);
  const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || puppeteer.executablePath(), headless: true });
  const results: unknown[] = [];
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) { try { ready = (await fetch(`${origin}/icon.png`)).ok; } catch {} if (ready) break; await delay(300); }
    assert.ok(ready, logs);
    for (const mode of modes) {
      let reference: { font: string; titleSize: string; contentLeft: number; contentWidth: number } | undefined;
      const context = await browser.newContext({ viewport: { width: mode.width, height: mode.height }, colorScheme: mode.dark ? 'dark' : 'light' });
      await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
      await context.addInitScript(() => localStorage.setItem('hw3_popup_dismissed', 'true'));
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
      const captures: Array<{ title: string; file: string }> = [];
      for (const [index, route] of routes.entries()) {
        await page.goto(`${origin}${route}`, { waitUntil: 'load' });
        await page.locator('main h1').waitFor();
        if (route.startsWith('/nomads') || route.startsWith('/digital-nomad-visas')) await page.locator('main .animate-pulse').first().waitFor({ state: 'hidden' });
        if (route === '/nomads') await page.locator('[data-nomad-city]').first().waitFor();
        if (route === '/nomads/places') await page.locator('main li:has(h2)').first().waitFor();
        if (route === '/nomads/compare' || route.includes('tab=checker')) await page.locator('main tbody tr').first().waitFor();
        await page.evaluate(async dark => {
          await document.fonts.ready;
          document.documentElement.classList.toggle('dark', dark);
          await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        }, mode.dark);
        const metrics = await page.locator('main').evaluate(main => {
          const heading = main.querySelector('h1')!, style = getComputedStyle(heading);
          const container = main.querySelector('.site-container')!.getBoundingClientRect();
          const fields = Array.from(main.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>('input:not([type="checkbox"]):not([type="hidden"]), select, button[role="combobox"]')).filter(field => field.getBoundingClientRect().height > 2 && !field.closest('[aria-hidden="true"]'));
          return {
            title: heading.textContent, font: style.fontFamily, titleSize: style.fontSize,
            titleAlign: style.textAlign, contentLeft: container.x, contentWidth: container.width, colorScheme: getComputedStyle(main).colorScheme,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            fields: fields.map(field => ({ label: field.getAttribute('aria-label') || field.labels?.[0]?.textContent, height: field.getBoundingClientRect().height, size: getComputedStyle(field).fontSize, left: field.getBoundingClientRect().left, right: field.getBoundingClientRect().right })),
            clippedToolkitLinks: Array.from(main.querySelectorAll<HTMLElement>('.nomad-navigation a')).filter(link => {
              const box = link.getBoundingClientRect();
              return box.height > 0 && (box.left < 0 || box.right > innerWidth);
            }).map(link => link.textContent),
          };
        });
        if (route === '/resources') reference = metrics;
        if (process.argv.includes('--verify') && (route.startsWith('/nomads') || route.startsWith('/digital-nomad-visas'))) {
          assert.ok(reference);
          assert.equal(metrics.font, reference.font, `${route} font family`);
          assert.equal(metrics.titleSize, reference.titleSize, `${route} heading scale`);
          assert.equal(metrics.contentLeft, reference.contentLeft, `${route} content alignment`);
          assert.equal(metrics.contentWidth, reference.contentWidth, `${route} content width`);
          assert.equal(metrics.titleAlign, route.includes('/cities/') ? 'start' : 'center', `${route} title alignment`);
          assert.equal(metrics.colorScheme, mode.dark ? 'dark' : 'light', `${route} native control theme`);
          assert.deepEqual(metrics.clippedToolkitLinks, [], `${route} toolkit navigation clips links`);
          for (const field of metrics.fields) {
            assert.ok(field.height >= 44, `${route}: ${field.label} has a small touch target`);
            assert.ok(field.left >= 0 && field.right <= mode.width, `${route}: ${field.label} is clipped`);
            if (mode.width < 640) assert.ok(parseFloat(field.size) >= 16, `${route}: ${field.label} can trigger mobile input zoom`);
          }
        }
        const file = path.join(output, `${mode.name}-${String(index + 1).padStart(2, '0')}.png`);
        await page.screenshot({ path: file, animations: 'disabled' });
        captures.push({ title: `${index + 1}. ${route}`, file });
        if (mode.width < 640) {
          await page.evaluate(() => window.scrollTo(0, 650));
          await page.screenshot({ path: file.replace('.png', '-content.png'), animations: 'disabled' });
        }
        if (process.argv.includes('--city-details') && route.includes('/cities/')) {
          await page.locator('#climate').screenshot({ path: file.replace('.png', '-climate.png'), animations: 'disabled' });
          await page.getByRole('region', { name: 'Other cities to explore' }).screenshot({ path: file.replace('.png', '-nearby.png'), animations: 'disabled' });
          const tabs = page.locator('#community [role="tab"]');
          for (let tab = 0; tab < await tabs.count(); tab++) {
            await tabs.nth(tab).click();
            await page.locator('#community').screenshot({ path: file.replace('.png', `-connections-${tab + 1}.png`), animations: 'disabled' });
          }
        }
        results.push({ mode: mode.name, route, ...metrics });
        assert.equal(metrics.overflow, false, `${route} at ${mode.width}`);
        console.log(`${mode.name} ${route}: h1 ${metrics.titleSize}, ${metrics.titleAlign}; ${metrics.fields.length} fields`);
      }
      results.push({ mode: mode.name, baselineErrors: errors.filter(error => !/\/nomads|\/digital-nomad-visas/.test(error)) });
      assert.deepEqual(errors.filter(error => /\/nomads|\/digital-nomad-visas/.test(error)), []);
      const thumbWidth = mode.width < 640 ? 300 : 480;
      const thumbHeight = Math.round(mode.height * thumbWidth / mode.width), cellHeight = thumbHeight + 30;
      const columns = mode.width < 640 ? 3 : 2;
      for (let start = 0; start < captures.length; start += 6) {
        const group = captures.slice(start, start + 6);
        const composites: sharp.OverlayOptions[] = [];
        for (const [index, capture] of group.entries()) {
          const left = index % columns * thumbWidth, top = Math.floor(index / columns) * cellHeight;
          const text = capture.title.replace(/&/g, '&amp;').replace(/</g, '&lt;');
          composites.push({ input: Buffer.from(`<svg width="${thumbWidth}" height="30"><rect width="100%" height="100%" fill="#e4e4e7"/><text x="8" y="20" font-family="Arial" font-size="12">${text}</text></svg>`), left, top });
          composites.push({ input: await sharp(capture.file).resize(thumbWidth, thumbHeight).toBuffer(), left, top: top + 30 });
        }
        await sharp({ create: { width: columns * thumbWidth, height: Math.ceil(group.length / columns) * cellHeight, channels: 3, background: '#ffffff' } }).composite(composites).png().toFile(path.join(output, `${mode.name}-sheet-${start / 6 + 1}.png`));
      }
      await context.close();
    }
    fs.writeFileSync(path.join(output, 'metrics.json'), JSON.stringify(results, null, 2));
    console.log(`Design review: ${routes.length * modes.length} page/viewport checks; screenshots and contact sheets in ${output}`);
  } finally { await browser.close(); server?.kill('SIGTERM'); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
