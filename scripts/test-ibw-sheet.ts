import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { load } from 'cheerio';
import type { Web3Event } from '../src/lib/events';

async function main() {
  const events = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
  const report = JSON.parse(fs.readFileSync('content/events/ibw-sheet-audit-2026-10-23.json', 'utf8')) as { entries: Array<{ row: number; status: string; published: Array<{ id: string }> }> };
  assert.equal(report.entries.length, 78);
  assert.equal(new Set(report.entries.map(row => row.row)).size, 78);
  assert.equal(report.entries.filter(row => row.status === 'already-published').length, 68);
  assert.equal(report.entries.filter(row => row.status === 'added').length, 6);
  assert.deepEqual(report.entries.filter(row => row.status === 'held').map(row => row.row), [22, 29, 49, 71]);
  for (const row of report.entries.filter(row => row.status !== 'held')) {
    assert.equal(row.published.length, 1, `One canonical event for row ${row.row}`);
    assert.ok(events.some(event => event.id === row.published[0].id));
  }
  const checks = JSON.parse(fs.readFileSync('content/events/ibw-sheet-source-checks-2026-10-23.json', 'utf8')) as Array<{ row: number; eventId: string; patch: Partial<Web3Event> | null }>;
  for (const row of report.entries.filter(row => row.status === 'held')) {
    const check = checks.find(check => check.row === row.row)!;
    assert.ok(!events.some(event => check.eventId && event.sourceVerification?.eventId === check.eventId));
  }
  assert.deepEqual(Object.keys(checks.find(check => check.row === 49)!.patch!).sort(), ['name', 'sourceVerification', 'visibility']);
  const added = events.filter(event => event.id.startsWith('ibw-sheet-'));
  const baselinePath = '.cache/ibw-sheet-2026-10-23/runtime-before.json';
  if (fs.existsSync(baselinePath)) {
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8')) as Web3Event[];
    for (const before of baseline) assert.deepEqual(events.find(event => event.id === before.id), before, `Preserve ${before.id}`);
    assert.equal(events.length, baseline.length + 6);
  }
  const images = JSON.parse(fs.readFileSync('content/events/ibw-sheet-images-2026-10-23.json', 'utf8')) as Array<{ id: string; path: string; sha256: string }>;
  assert.equal(images.length, 6);
  for (const event of added) {
    assert.ok(event.descriptionSource?.evidence?.length);
    assert.ok(event.sideEventFor?.includes('ibw'));
    if (event.locationHidden) for (const key of ['venueName', 'streetAddress', 'coordinates'] as const) assert.equal(event[key], undefined);
    const image = images.find(image => image.id === event.id)!;
    const bytes = fs.readFileSync(`public${image.path}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256);
    assert.equal((await sharp(bytes).metadata()).format, 'webp');
    if (process.env.TEST_BASE_URL) {
      const response = await fetch(`${process.env.TEST_BASE_URL}/${event.slug}`, { signal: AbortSignal.timeout(60_000) });
      assert.equal(response.status, 200, event.slug);
      const $ = load(await response.text());
      assert.equal($('h1').first().text(), event.name);
      assert.equal($('link[rel="canonical"]').attr('href'), `https://hashtagweb3.com/${event.slug}`);
    }
  }
  console.log('IBW sheet: all 78 rows accounted for; six source-backed additions, four holds, unchanged existing records and six verified images.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
