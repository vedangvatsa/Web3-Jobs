import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import puppeteer from 'puppeteer';
import { load } from 'cheerio';
import type { Job } from '../src/types';
import type { LegacySlugRecord } from '../src/lib/job-slugs';

async function main() {
  const jobs = JSON.parse(fs.readFileSync('content/jobs-runtime.json', 'utf8')) as Job[];
  const archive = JSON.parse(fs.readFileSync('content/legacy-slugs-archive.json', 'utf8')) as Record<string, LegacySlugRecord>;
  const liveSlugs = new Set(jobs.map(job => job.slug));
  const withdrawn = Object.entries(archive).find(([slug, row]) => row.company === 'RedStone Oracles' && row.retiredReason && !liveSlugs.has(slug));
  assert.ok(withdrawn);
  const replacements = jobs.filter(job => ['Lever: Toku [toku]', 'Lever: Sphere [sphere-laboratories]', 'Lever: Saga [saga-xyz]', 'Teamtailor: Ethena Labs [ethena]'].includes(job.source));
  assert.ok(replacements.length);
  const standalone = path.resolve('.next/standalone');
  fs.cpSync('.next/static', path.join(standalone, '.next/static'), { recursive: true });
  const origin = 'http://127.0.0.1:3180';
  const server = spawn(process.execPath, [path.join(standalone, 'server.js')], { cwd: standalone, env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: '3180' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  server.stdout.on('data', chunk => logs += chunk);
  server.stderr.on('data', chunk => logs += chunk);
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) { try { ready = (await fetch(`${origin}/icon.png`)).ok; } catch {} if (ready) break; await delay(300); }
    assert.ok(ready, logs);
    browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || puppeteer.executablePath(), headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
    await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    await context.addInitScript(() => localStorage.setItem('hw3_popup_dismissed', 'true'));
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    assert.equal((await page.goto(`${origin}/redstone-oracles`, { waitUntil: 'load' }))?.status(), 200);
    assert.match((await page.locator('main h1').textContent()) || '', /redstone oracles/i);
    assert.ok(await page.locator('main a[href="https://redstone.finance"]').count());
    assert.equal(await page.locator('a[href*="ashbyhq.com/warp"]').count(), 0);
    assert.match((await page.locator('main').textContent()) || '', /no (?:open|active|current).*?(?:jobs|roles)|0 (?:open|active)/i);

    assert.equal((await page.goto(`${origin}/${withdrawn[0]}`, { waitUntil: 'load' }))?.status(), 404, logs);
    const preview = await fetch(`${origin}/${withdrawn[0]}`, { headers: { 'User-Agent': 'TelegramBot' } });
    assert.equal(preview.status, 200);
    const $ = load(await preview.text());
    assert.equal($('meta[property="og:title"]').attr('content'), 'Listing removed | Hashtag Web3');
    const image = $('meta[property="og:image"]').attr('content')!;
    assert.equal((await fetch(origin + new URL(image).pathname)).status, 200);

    for (const job of replacements) {
      assert.equal((await page.goto(`${origin}/${job.slug}`, { waitUntil: 'load' }))?.status(), 200, job.slug);
      assert.equal(await page.getByRole('heading', { level: 1, name: job.title, exact: true }).textContent(), job.title);
      assert.ok(await page.locator(`a[href="${job.link}"]`).count(), `Wrong application link: ${job.slug}`);
    }
    for (const [slug, website] of [['rain', 'https://www.rain.xyz'], ['ramp', 'https://ramp.com'], ['sui-foundation', 'https://sui.io'], ['plume-network', 'https://www.plumenetwork.xyz']]) {
      assert.equal((await page.goto(`${origin}/${slug}`, { waitUntil: 'load' }))?.status(), 200, slug);
      assert.ok(await page.locator(`main a[href="${website}"]`).count(), `Wrong website: ${slug}`);
      if (slug === 'ramp') {
        assert.ok(await page.locator('a[href="https://www.linkedin.com/company/ramp"]').count());
        assert.equal(await page.locator('a[href*="linkedin.com/company/rampnetwork"]').count(), 0);
      }
      if (slug === 'rain') {
        const logo = page.locator('main img[alt="Rain logo"]').first();
        await logo.evaluate(async element => { await (element as HTMLImageElement).decode(); });
        assert.doesNotMatch((await page.locator('main').textContent()) || '', /Bahrain|rain\.fi/);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ redstoneHasNoFalseJobs: true, withdrawnJob: withdrawn[0], withdrawnHumanStatus: 404, withdrawnSocialPreview: 'Listing removed', verifiedReplacementPages: replacements.length, companyMetadataAndMobileLayout: 'passed', browserErrors: errors }, null, 2));
    await context.close();
  } finally { await browser?.close(); server.kill('SIGTERM'); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
