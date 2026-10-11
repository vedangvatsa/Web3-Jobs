import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { buildEventSlugIndex } from '../src/lib/event-slug-index';
import { assignStableEventSlugs, type EventSlugHistory } from '../src/lib/event-slug-assignment';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import type { Web3Event } from '../src/lib/events';

const runtime = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
const report = JSON.parse(fs.readFileSync('content/events/mumbai-audit-report.json', 'utf8')) as {
  calendars: Array<{ entries: number; pages: number; paginationExhausted: boolean }>;
  records: Array<{ url: string; status: string; ids: string[]; eventId?: string; startDate?: string; endDate?: string; timezone?: string; before?: Array<{ id: string; slug?: string }>; locationHidden?: boolean }>;
  sheet: { populatedRows: number; rows: Array<{ row: number; ids: string[] }> };
};
const index = buildEventSlugIndex(runtime);
assert.deepEqual(report.calendars.map(c => [c.entries, c.pages, c.paginationExhausted]), [[19, 1, true], [57, 2, true]]);
assert.equal(report.sheet.populatedRows, 43);
let verified = 0;
for (const record of report.records) {
  const found = runtime.filter(e => record.ids.includes(e.id) || Boolean(record.eventId && e.sourceVerification?.eventId === record.eventId));
  if (['added', 'verified-updated'].includes(record.status)) {
    assert.equal(found.length, 1, `Exactly one canonical record for ${record.url}`);
    const e = found[0];
    assert.equal(e.startDate, record.startDate, record.url);
    assert.equal(e.endDate, record.endDate, record.url);
    assert.equal(e.timezone, record.timezone, record.url);
    assert.ok(getVerifiedEventDescription(e));
    for (const before of record.before || []) {
      if (before.id === e.id && before.slug) assert.equal(e.slug, before.slug, `Canonical slug changed: ${e.id}`);
    }
    verified++;
  } else assert.equal(found.length, 0, `Excluded event leaked into catalog: ${record.url}`);
}
assert.equal(verified, 52);
for (const e of EVENT_SOURCES.flatMap(s => s.events).filter(e => e.locationHidden && report.records.some(r => r.ids.includes(e.id)))) {
  for (const field of ['coordinates', 'streetAddress', 'venueName', 'postalCode', 'neighborhood'] as const) assert.equal(e[field], undefined, `Private location leaked: ${e.id}.${field}`);
}
assert.equal(index.get('dssd2')?.id, 'ibw-official-defi-security-summit-day-1-11-01');
assert.equal(index.get('usd2')?.id, 'premier-unchained-summit-india-2026');
assert.equal(index.get('rbe')?.name, 'Afterhours Mixer: Mumbai');
assert.equal(index.get('cw0h549b')?.startDate, '2026-11-04T05:30:00.000Z');
assert.equal(index.get('mip-20')?.startDate, '2026-10-30T09:30:00.000Z');
assert.equal(index.get('pragma-mumbai')?.startDate, '2026-11-06');
assert.equal(index.get('devcon')?.endDate, '2026-11-06');
assert.equal(index.get('team1mumbai')?.locationHidden, true);
assert.deepEqual(report.sheet.rows.find(r => r.row === 43)?.ids, ['premier-ethmumbai-2026']);
assert.equal(fs.readFileSync('content/events-runtime.json', 'utf8'), fs.readFileSync('public/data/events-runtime.json', 'utf8'));

const fixture: Web3Event = { id: 'conference', slug: 'conf', aliases: ['day-two'], name: 'Conference', description: '', startDate: '2027-01-01', location: '', url: '', coverImage: null };
const history: EventSlugHistory = { conference: { slug: 'conf' }, old: { slug: 'day-two', canonicalId: 'conference' } };
assert.ok(assignStableEventSlugs([fixture], new Set(), history)[0].aliases?.includes('day-two'));
assert.ok(!assignStableEventSlugs([fixture], new Set(), { ...history, old: { slug: 'day-two' } })[0].aliases?.includes('day-two'), 'Unreviewed retired slugs cannot be claimed');
assert.ok(!assignStableEventSlugs([fixture, { ...fixture, id: 'old', slug: 'day-two', aliases: [] }], new Set(), history)[0].aliases?.includes('day-two'), 'Live canonical owners cannot be displaced');
console.log('Mumbai audit passed: 52 verified canonical events, 43 sheet rows, exclusions, dates, privacy, stable identities and reviewed duplicate aliases.');
