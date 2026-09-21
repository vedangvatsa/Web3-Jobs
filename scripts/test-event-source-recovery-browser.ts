import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
import puppeteer from 'puppeteer';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { buildEventSlugIndex } from '../src/lib/event-slug-index';
import { getEventSlug, type Web3Event } from '../src/lib/events';

async function main() {
  const runtime = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
  const plan = JSON.parse(fs.readFileSync('content/events/source-recovery.json', 'utf8')) as { repairs: Array<{ id: string; kind: string }> };
  const index = buildEventSlugIndex(runtime);
  const sources = EVENT_SOURCES.flatMap((source) => source.events);
  const browser = await chromium.launch({ executablePath: await puppeteer.executablePath(), headless: true });
  const failures: string[] = [];
  try {
    for (const repair of plan.repairs.filter((entry) => entry.kind !== 'quarantine')) {
      const source = sources.find((event) => event.id === repair.id)!;
      const originalSlug = getEventSlug(source);
      const canonical = index.get(originalSlug) || index.get(repair.id.toLowerCase());
      assert.ok(canonical, `Missing recovered route: ${repair.id}`);
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      try {
        const response = await page.goto(`http://localhost:3100/${originalSlug}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
        assert.equal(response?.status(), 200);
        await page.locator('[data-event-description][data-content-status="source-backed"]').waitFor();
        assert.equal(new URL(page.url()).pathname, `/${getEventSlug(canonical)}`);
        assert.equal(await page.getByText('An organizer description has not been verified for this event.', { exact: true }).count(), 0);
        assert.ok((await page.locator('[data-event-description] h2').count()) > 0);
        if (canonical.eventStatus === 'EventPostponed') {
          assert.match(await page.locator('[data-event-description] > p').first().innerText(), /postponed/);
          assert.equal(await page.getByRole('link', { name: 'Add to Calendar' }).count(), 0);
        }
        await page.setViewportSize({ width: 390, height: 844 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'mobile overflow');
        assert.deepEqual(errors, []);
        console.log(`Verified /${originalSlug}${originalSlug !== getEventSlug(canonical) ? ` -> /${getEventSlug(canonical)}` : ''}`);
      } catch (error) { failures.push(`${originalSlug}: ${String(error)}`); }
      finally { await page.close(); }
    }
  } finally { await browser.close(); }
  assert.deepEqual(failures, []);
  console.log('All 32 recovered event URLs passed browser checks, including aliases, source-backed bodies, mobile layout, and postponed-event controls.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
