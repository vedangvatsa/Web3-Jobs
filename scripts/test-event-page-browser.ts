import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import puppeteer from 'puppeteer';
import { getEventSlug, type Web3Event } from '../src/lib/events';
import { buildGoogleEventSchema } from '../src/lib/event-schema';
import { resolveEventGuide } from '../src/lib/event-guide-store';

async function main() {
  const events = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
  const luma = events.filter((event) => event.sourceVerification);
  assert.ok(luma.length, 'Run event verification and precompute first');
  const eligible = luma.find((event) => buildGoogleEventSchema(event, { pageUrl: `https://hashtagweb3.com/${getEventSlug(event)}` }));
  const long = [...luma].sort((a, b) => b.description.length - a.description.length)[0];
  const gated = luma.find((event) => event.approvalRequired);
  const official = events.find((event) => event.descriptionSource && !event.sourceVerification);
  const unavailable = events.find((event) => !event.description);
  const token2049 = events.find((event) => event.slug === 'token2049');
  const samples = [...new Set([eligible, long, gated, official, unavailable, token2049].filter((event): event is Web3Event => !!event))];
  const browser = await chromium.launch({ executablePath: await puppeteer.executablePath(), headless: true });
  try {
    for (const event of samples) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const slug = getEventSlug(event);
      const response = await page.goto(`http://localhost:3100/${slug}`, { waitUntil: 'domcontentloaded', timeout: 180_000 });
      assert.equal(response?.status(), 200, slug);
      await page.locator('[data-event-page] h1').waitFor();
      const guide = await resolveEventGuide(event);
      assert.equal(await page.locator('[data-event-description]').getAttribute('data-content-status'), guide.descriptionStatus);
      if (guide.descriptionStatus === 'unavailable') {
        await page.getByText('An organizer description has not been verified for this event.', { exact: true }).waitFor();
      } else {
        assert.equal(await page.getByRole('link', { name: 'Description source', exact: true }).getAttribute('href'), guide.descriptionSource?.url);
      }
      for (const section of guide.sections) {
        assert.ok((await page.locator('[data-event-page] h2').allTextContents()).includes(section.heading), `${slug}: missing ${section.heading}`);
      }
      const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent || '{}')));
      const actual = schemas.find((schema) => schema['@type'] === 'Event');
      const expected = buildGoogleEventSchema(event, { pageUrl: `https://hashtagweb3.com/${slug}` });
      assert.equal(!!actual, !!expected, `${slug}: JSON-LD eligibility mismatch`);
      if (actual) {
        assert.equal(actual.name, event.name);
        assert.equal(actual.startDate, event.startDate);
        assert.equal(actual.location['@type'], 'Place');
      }
      for (const colorScheme of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme });
        await page.evaluate((dark) => document.documentElement.classList.toggle('dark', dark), colorScheme === 'dark');
        for (const width of [1280, 390]) {
          await page.setViewportSize({ width, height: 900 });
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
          assert.equal(overflow, false, `${slug}: horizontal overflow at ${width}px (${colorScheme})`);
        }
      }
      const firstLink = page.locator('[data-event-page] a[href]').first();
      assert.ok(await firstLink.getAttribute('href'));
      await firstLink.focus();
      assert.equal(await firstLink.evaluate((element) => element === document.activeElement), true);
      await page.locator('[data-event-page] h2').first().scrollIntoViewIfNeeded();
      const out = path.join('.cache/event-verification', `page-${slug}.png`);
      await page.screenshot({ path: out, fullPage: false });
      assert.deepEqual(errors, [], `${slug}: browser errors`);
      console.log(`Browser passed: /${slug}, desktop/mobile, light/dark, headings and Event JSON-LD.`);
      await page.close();
    }
  } finally { await browser.close(); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
