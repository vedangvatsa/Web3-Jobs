import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import postcss from 'postcss';
import tailwind from 'tailwindcss';
import { chromium } from 'playwright';
import puppeteer from 'puppeteer';
import config from '../tailwind.config';
import { buildSynthesizedJobContent } from '../src/lib/job-guides';
import { buildJobsListing } from '../src/lib/jobs-listing-build';
import { getJobContentKey } from '../src/lib/job-slugs';
import { readJobDescriptionStore } from './lib/job-description-store';
import { buildEventsListing } from '../src/lib/events-listing-build';
import { resolveEventGuide } from '../src/lib/event-guide-store';
import { EventGuideContent } from '../src/components/event-guide-content';
import type { Job } from '../src/types';

async function main() {
  const jobs = buildJobsListing(JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8')) as Job[]);
  const store = readJobDescriptionStore();
  const samples: Array<{ slug: string; html: string; salary?: boolean; ordered?: boolean }> = [];
  for (const pattern of [/Zone A: \(\$/, /Zone A: USD/, /<ol\b/, /<ul>[\s\S]*<ul>/]) {
    const job = jobs.find(j => pattern.test(store.descriptions[getJobContentKey(j)] || ''));
    if (!job || samples.some(sample => sample.slug === job.slug)) continue;
    const body = buildSynthesizedJobContent(job, store.descriptions[getJobContentKey(job)]);
    samples.push({ slug: job.slug!, salary: /Zone A: \(\$/.test(body), ordered: /<ol\b/.test(body), html: `<section class="prose prose-slate mt-10 min-w-0 max-w-none break-words [overflow-wrap:anywhere] dark:prose-invert">${body}</section>` });
  }
  const events = await buildEventsListing();
  const long = [...events].sort((a, b) => b.description.length - a.description.length)[0];
  for (const event of [events.find(e => e.slug === 'revo-connect'), long].filter(e => !!e)) {
    const editorial = await resolveEventGuide(event);
    samples.push({ slug: event.slug || event.id, html: renderToStaticMarkup(createElement(EventGuideContent, { editorial })) });
  }
  const { css } = await postcss([tailwind(config)]).process(fs.readFileSync('src/app/globals.css', 'utf8'), { from: 'src/app/globals.css' });
  const executablePath = process.env.BROWSER_EXECUTABLE || (process.env.CI ? undefined : await puppeteer.executablePath());
  const browser = await chromium.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => route.abort());
    for (const sample of samples) {
      await page.setContent(`<html><head><style>${css}</style></head><body><main class="site-container py-8">${sample.html}</main></body></html>`);
      for (const theme of ['light', 'dark']) {
        await page.evaluate(dark => document.documentElement.classList.toggle('dark', dark), theme === 'dark');
        for (const width of [1280, 390, 320]) {
          await page.setViewportSize({ width, height: 900 });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false, `${sample.slug}: overflow ${width}px ${theme}`);
          assert.equal(await page.locator('main').evaluate(el => /###(?:BLOCK|HEADING)###/.test(el.textContent || '')), false);
          if (sample.salary) {
            const rows = page.locator('p').filter({ hasText: /^Zone [A-D]:/ });
            assert.equal(await rows.count(), 4);
            const boxes = await rows.evaluateAll(els => els.map(el => ({ top: el.getBoundingClientRect().top, bottom: el.getBoundingClientRect().bottom })));
            for (let i = 1; i < boxes.length; i++) assert.ok(boxes[i].top > boxes[i - 1].bottom, 'Salary rows need visible vertical spacing');
            assert.equal(await page.locator('h3').filter({ hasText: 'Application Guidelines' }).count(), 1);
          }
          if (sample.ordered) assert.equal(await page.locator('ol').first().evaluate(el => getComputedStyle(el).listStyleType), 'decimal');
        }
      }
      console.log(`Browser formatting passed: ${sample.slug}, 1280/390/320px, light/dark`);
    }
  } finally { await browser.close(); }
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
