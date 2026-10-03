import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, expect, type Browser } from '@playwright/test';
import { load } from 'cheerio';
import removedSlugs from '../content/removed-job-paths.json';
import type { Job } from '../src/types';

async function main() {
  const standalone = path.resolve('.next/standalone'), origin = 'http://127.0.0.1:3198';
  fs.cpSync('.next/static', path.join(standalone, '.next/static'), { recursive: true });
  const server = spawn(process.execPath, [path.join(standalone, 'server.js')], { cwd: standalone, env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: '3198' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '', browser: Browser | undefined;
  server.stdout.on('data', chunk => logs += chunk); server.stderr.on('data', chunk => logs += chunk);
  const humanHeaders = { 'User-Agent': 'Mozilla/5.0', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document' };
  try {
    let ready = false;
    for (let i = 0; i < 80; i++) { try { ready = (await fetch(`${origin}/robots.txt`)).ok; } catch {} if (ready) break; await delay(300); }
    assert.ok(ready, logs);
    let cursor = 0;
    await Promise.all(Array.from({ length: 8 }, async () => {
      while (cursor < removedSlugs.length) {
        const slug = removedSlugs[cursor++];
        const response = await fetch(`${origin}/${slug}`, { headers: humanHeaders });
        assert.equal(response.status, 410, `Removed URL is still served: /${slug}`);
        assert.equal(response.headers.get('x-robots-tag'), 'noindex');
        await response.arrayBuffer();
      }
    }));
    for (const slug of ['eio', 'marketing220']) for (const suffix of ['', '?amp&amp', '/tg', '/li']) {
      const response = await fetch(`${origin}/${slug}${suffix}`, { headers: { 'User-Agent': 'TelegramBot' } });
      assert.equal(response.status, 410, `${slug}${suffix} crawler response`);
      assert.doesNotMatch(await response.text(), /og:image|Apply Now|Explore Invity|Ecosystem Growth/);
    }
    for (const route of ['/global', '/nomad', '/nomads', '/it3', '/product578']) assert.equal((await fetch(`${origin}${route}`, { headers: humanHeaders })).status, 200, `Unrelated page lost: ${route}`);
    const runtime = await (await fetch(`${origin}/data/jobs-runtime.json`)).json() as Job[];
    assert.deepEqual(runtime, JSON.parse(fs.readFileSync('content/jobs-runtime.json', 'utf8')));
    assert.equal(runtime.find(job => job.slug === 'it3')?.location, 'Remote (Worldwide)');
    assert.ok(!runtime.some(job => removedSlugs.includes(job.slug || '')));
    const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
    for (const slug of removedSlugs) assert.ok(!sitemap.includes(`https://hashtagweb3.com/${slug}</loc>`), slug);
    assert.match(await (await fetch(`${origin}/robots.txt`)).text(), /User-agent: YandexBot\s+Allow: \/\s+Clean-param: amp \//);
    const remoteJob = load(await (await fetch(`${origin}/it3`, { headers: humanHeaders })).text());
    assert.match(remoteJob('[data-job-page]').text(), /Remote \(Worldwide\)/);
    const schema = remoteJob('script[type="application/ld+json"]').toArray().map(element => JSON.parse(remoteJob(element).text())).find(value => value['@type'] === 'JobPosting');
    assert.equal(schema?.jobLocationType, 'TELECOMMUTE');
    assert.equal(schema?.applicantLocationRequirements, undefined, 'Worldwide role was country-restricted');
    const feed = load(await (await fetch(`${origin}/jobs/adzuna.xml`)).text(), { xmlMode: true });
    let regionalJobs = 0;
    feed('job').each((_, element) => {
      const entry = feed(element), location = entry.find('location').text(), country = entry.find('country').text();
      assert.ok(country, 'Regional feed entry has no country');
      assert.ok(!/Remote \(United States\)/.test(location) || country === 'US', 'US remote job assigned the wrong country');
      assert.ok(!/Remote \(Worldwide\)/.test(location), 'Worldwide role assigned an invented feed country');
      regionalJobs++;
    });
    assert.ok(regionalJobs > 0);
    browser = await chromium.launch({ executablePath: process.env.CHROME_BIN, headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    await context.addInitScript(() => localStorage.setItem('hw3_popup_dismissed', 'true'));
    const page = await context.newPage(), errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/it3`, { waitUntil: 'load' });
    await expect(page.locator('[data-job-page]')).toContainText('Remote (Worldwide)');
    await page.goto(`${origin}/digital-nomad-visas`, { waitUntil: 'load' });
    const links = page.locator('main article a[aria-label^="Official visa program website"]');
    await expect(links).toHaveCount(45);
    await expect(page.getByText('Official program website', { exact: true })).toHaveCount(0);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const link of await links.all()) {
        assert.equal(await link.evaluate(element => element.parentElement?.classList.contains('flex-row')), true);
        const box = await link.boundingBox(); assert.ok(box && box.x >= 0 && box.x + box.width <= width + 1 && box.width >= 44 && box.height >= 44);
      }
    }
    await page.goto(`${origin}/compare-cities`, { waitUntil: 'load' });
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText(/The cost difference|per month than|Both cities have the same monthly estimate/)).toHaveCount(0);
    await page.goto(`${origin}/city-report`, { waitUntil: 'load' });
    await expect(page.locator('.nomad-report-city')).toHaveCount(50);
    await expect(page.getByRole('heading', { name: 'How to use this report' })).toHaveCount(0);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ goneUrls: removedSlugs.length, activeJobs: runtime.length, regionalFeedJobs: regionalJobs, protectedEventAndPopup: 'passed', remotePageAndSchema: 'passed', officialHeaderLinks: 45, browserErrors: errors }, null, 2));
  } catch (error) { console.error(logs); throw error; }
  finally { await browser?.close(); server.kill('SIGTERM'); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
