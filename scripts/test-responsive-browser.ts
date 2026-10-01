import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import puppeteer from 'puppeteer';
import jobs from '../content/jobs-runtime.json';

const origin = 'http://127.0.0.1:3167';
async function main() {
  const standalone = path.resolve('.next/standalone');
  fs.cpSync('.next/static', path.join(standalone, '.next/static'), { recursive: true });
  const server = spawn(process.execPath, [path.join(standalone, 'server.js')], { cwd: standalone, env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: '3167' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = ''; server.stdout.on('data', chunk => logs += chunk); server.stderr.on('data', chunk => logs += chunk);
  let browser;
  try {
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) { try { ready = (await fetch(origin + '/icon.png')).ok; } catch {} if (ready) break; await delay(300); }
    assert.ok(ready, logs);
    browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || puppeteer.executablePath(), headless: true });
    const results = [];
    for (const [width, dpr] of process.argv.includes('--jobs-only') ? [] : [[390, 1], [390, 2], [390, 3], [1440, 2]]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: dpr });
      await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
      await context.addInitScript(() => localStorage.setItem('hw3_popup_dismissed', 'true'));
      const page = await context.newPage();
      const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
      assert.equal((await page.goto(origin + '/crypto-vc', { waitUntil: 'load' }))?.status(), 200);
      const image = page.locator('main img[alt="Crypto VC & Investment Roundtable"]');
      await image.evaluate(async element => { await (element as HTMLImageElement).decode(); });
      const current = await image.evaluate(element => ({ src: (element as HTMLImageElement).currentSrc, box: element.getBoundingClientRect().toJSON() }));
      assert.ok(current.src.includes('/responsive/'), 'Large event poster must use a responsive variant');
      assert.ok(current.box.height <= 321, 'Poster frame grew');
      const bytes = fs.statSync(path.join('public', new URL(current.src).pathname)).size;
      assert.ok(bytes < 400_000, `Event variant is unnecessarily large: ${bytes}`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      await page.goto(origin + '/metamask-split', { waitUntil: 'load' });
      const articleImage = page.locator('main img[alt$="article cover"]').first();
      await articleImage.evaluate(async element => { await (element as HTMLImageElement).decode(); });
      const articleVariant = new URL(await articleImage.evaluate(element => (element as HTMLImageElement).currentSrc)).pathname;
      assert.ok(articleVariant.endsWith('.avif'));
      results.push({ width, dpr, eventVariant: new URL(current.src).pathname, bytes, articleVariant, articleBytes: fs.statSync(path.join('public', articleVariant)).size });
      if (width === 390 && dpr === 2) await articleImage.screenshot({ path: '.cache/metamask-responsive-mobile.png' });
      await page.goto(origin + '/community', { waitUntil: 'load' });
      const gallery = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Community Moments', exact: true }) });
      await gallery.scrollIntoViewIfNeeded();
      await gallery.locator('img').first().evaluate(async element => { await (element as HTMLImageElement).decode(); });
      assert.ok(await gallery.locator('img[srcset]').count(), 'Gallery must expose responsive candidates');
      if (dpr === 1) await page.waitForFunction(() => Array.from(document.querySelectorAll('img')).some(image => image.alt.includes('community networking event') && image.currentSrc.includes('/responsive/')));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      assert.deepEqual(errors, []);
      await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await context.route('**/*', route => route.request().url().startsWith(origin) && !route.request().url().includes('/responsive/') ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('pageerror', error => { logs += `\nBrowser: ${error.stack || error.message}`; });
    await page.goto(origin + '/crypto-vc', { waitUntil: 'load' });
    await page.waitForFunction(() => { const image = document.querySelector('main img[alt="Crypto VC & Investment Roundtable"]') as HTMLImageElement | null; return image?.complete && image.naturalWidth > 0 && image.currentSrc.includes('/events/'); });
    const companyJobs = jobs.filter(job => job.company === 'Open Standard');
    assert.equal(companyJobs.length, 5);
    assert.ok(companyJobs.every(job => !/general interest/i.test(job.title)));
    await page.goto(origin + '/open-standard', { waitUntil: 'load' });
    assert.equal(await page.locator('main h1').textContent(), 'Open Standard');
    assert.equal(await page.locator('main a[href="https://joinopenstandard.com"]').count(), 1);
    const logo = page.locator('main img[alt="Open Standard logo"]').first();
    await logo.evaluate(async element => { await (element as HTMLImageElement).decode(); });
    for (const job of companyJobs) {
      const response = await page.goto(`${origin}/${job.slug}`, { waitUntil: 'load' });
      assert.equal(response?.status(), 200, `${job.slug}: ${logs}`);
      const heading = await page.getByRole('heading', { level: 1, name: job.title, exact: true }).textContent({ timeout: 10000 });
      assert.equal(heading, job.title);
      assert.ok(await page.locator('a[href^="https://jobs.ashbyhq.com/openstandard/"]').count());
    }
    console.log(JSON.stringify({ responsiveChecks: results, variantFailureFallsBackToOriginal: true, openStandardSpecificRoles: companyJobs.length, generalInterestExcluded: true }, null, 2));
    await context.close();
  } finally { await browser?.close(); server.kill('SIGTERM'); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
