import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import puppeteer from 'puppeteer';

async function main() {
  const generated = JSON.parse(fs.readFileSync('public/data/jobs-runtime.json', 'utf8'));
  const invalid = generated.find((job: Record<string, unknown>) => ['id', 'title', 'company', 'slug'].some(key => typeof job[key] !== 'string'));
  assert.ok(!invalid, `Invalid generated record: ${JSON.stringify(invalid)}`);
  const require = createRequire(`${process.cwd()}/package.json`);
  const port = process.env.CATALOG_TEST_PORT || '3199';
  const base = `http://localhost:${port}`;
  const server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev', '-p', port], {
    cwd: process.cwd(), detached: true, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  server.stdout.on('data', chunk => { output = (output + chunk.toString()).slice(-20000); });
  server.stderr.on('data', chunk => { output = (output + chunk.toString()).slice(-20000); });
  try {
    for (let attempt = 0; !output.includes('Ready in'); attempt++) {
      if (attempt >= 60 || server.exitCode !== null) throw new Error(`Dev server failed: ${output}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const browser = await chromium.launch({ executablePath: await puppeteer.executablePath(), headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      page.on('pageerror', error => { output += `\nBrowser: ${error.stack || error.message}`; });
      await page.route('https://**/*', route => route.abort());
      page.on('console', message => { if (message.type() === 'error') output += `\nConsole: ${message.text()}`; });
      let injectedFailure = false;
      await page.route('**/data/jobs-runtime.json', route => {
        if (!injectedFailure) {
          injectedFailure = true;
          return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"Not Found"}' });
        }
        return route.continue();
      });
      await page.goto(`${base}/jobs`, { waitUntil: 'domcontentloaded', timeout: 180000 });
      await page.locator('[data-job-key]').first().waitFor({ timeout: 30000 });
      await page.waitForLoadState('load');
      await page.locator('[aria-live="polite"]').last().scrollIntoViewIfNeeded();
      const retry = page.getByRole('button', { name: 'Retry loading jobs' });
      try { await retry.waitFor({ timeout: 30000 }); }
      catch (error) {
        output += `\nFailure injected: ${injectedFailure}\n${JSON.stringify(await page.evaluate(() => ({ cards: document.querySelectorAll('[data-job-key]').length, scroll: window.scrollY, height: window.innerHeight, sentinels: [...document.querySelectorAll('[aria-live="polite"]')].map(el => ({ text: el.textContent, top: el.getBoundingClientRect().top })), errors: [...document.querySelectorAll('[role="alert"]')].map(el => el.textContent) })))}`;
        throw error;
      }
      assert.equal(await page.locator('[data-job-key]').count(), 50, 'Failed fetch must preserve initial cards');
      const recovered = page.waitForResponse(response => response.url().includes('/data/jobs-runtime.json') && response.status() === 200);
      await retry.click();
      await recovered;
      await page.waitForFunction(() => !document.querySelector('[role="alert"]') && !document.querySelector('[aria-label="Loading jobs"]'));
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(150);
      await page.locator('[aria-live="polite"]').last().scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelectorAll('[data-job-key]').length > 50, undefined, { timeout: 60000 });
      assert.equal(await page.getByRole('alert').filter({ hasText: 'Jobs could not be loaded' }).count(), 0);
      const catalogResponse = await page.request.get(`${base}/data/jobs-runtime.json`);
      assert.equal(catalogResponse.status(), 200);
      const catalog = await catalogResponse.json();
      assert.ok(Array.isArray(catalog) && catalog.length > 50);
      const missingResponse = await page.request.get(`${base}/data/no-such-asset.json`);
      assert.equal(missingResponse.status(), 404);
      await page.getByRole('textbox', { name: 'Search jobs' }).fill('Engineer');
      await page.waitForFunction(() => {
        const cards = [...document.querySelectorAll<HTMLElement>('[data-job-key]')];
        return cards.length > 0 && cards.every(card => /engineer/i.test(card.dataset.jobTitle || '') || /engineer/i.test(card.dataset.company || ''));
      }, undefined, { timeout: 30000 });
      console.log(`Browser catalog passed: ${catalog.length} jobs served, initial cards preserved on error, Retry restores pagination, search works, missing assets remain 404.`);
    } finally { await browser.close(); }
  } catch (error) {
    console.error(output);
    throw error;
  } finally {
    if (server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch {} }
  }
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
