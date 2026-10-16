import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import type { Web3Event } from '../src/lib/events';
import { buildEventSlugIndex } from '../src/lib/event-slug-index';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import { hasEventEnded } from './lib/event-dates.mjs';
import { isEventRetentionDue } from './lib/event-retention.mjs';
import report from '../content/events/devcon8-coverage.json';
import plans from '../content/events/devcon8-reviewed-additions.json';
import ibw from '../content/events/ibw-description-audit.json';
import history from '../content/event-slug-history.json';
import baseline from './fixtures/devcon8-coverage.json';

const hash = (s: string) => createHash('sha256').update(s).digest('hex');
const readText = (p: string) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const read = <T,>(p: string): T => JSON.parse(readText(p));
const canonical = (value: unknown): unknown => Array.isArray(value) ? value.map(canonical)
  : value !== null && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => [k, canonical(v)]))
    : value;
const digest = (events: Web3Event[]) => hash(JSON.stringify(canonical([...events].sort((a, b) => a.id.localeCompare(b.id, 'en')))));
const auditAt = Date.parse(baseline.auditAt);
const runtime = read<Web3Event[]>('content/events-runtime.json');
const index = buildEventSlugIndex(runtime);
assert.equal(report.baselineHead, baseline.baselineHead);
assert.equal(report.generatedAt, baseline.auditAt);
assert.equal(report.complete, true);
assert.equal(report.calendarId, 'cal-uho3uXcPGigtake');
assert.equal(report.rows.length, 83);
assert.equal(new Set(report.rows.map(r => r.entryId)).size, 83);
assert.equal(new Set(report.rows.map(r => r.identity)).size, 77);
const cursors = new Set<string>();
assert.deepEqual(report.pagination.map(p => p.period), ['future', 'past']);
assert.equal(report.pagination.reduce((n, p) => n + p.receipts.length, 0), baseline.pages.length);
for (const period of report.pagination) {
  const capturedIds: string[] = [];
  assert.equal(period.complete, true);
  assert.equal(period.pages, period.receipts.length);
  assert.equal(period.receipts.at(-1)?.hasMore, false);
  assert.equal(period.receipts.at(-1)?.nextCursor, null);
  assert.equal(period.receipts.reduce((n, p) => n + p.rawCount, 0), report.rows.filter(r => r.period === period.period).length);
  for (const [i, p] of period.receipts.entries()) {
    const fixture = baseline.pages.find(page => page.period === period.period && page.cursor === p.cursor);
    assert.ok(fixture, `Missing captured page ${period.period}/${i}`);
    capturedIds.push(...fixture.entryIds);
    assert.equal(fixture.entryIds.length, p.rawCount);
    assert.equal(fixture.hasMore, p.hasMore);
    assert.equal(fixture.nextCursor, p.nextCursor);
    assert.equal(fixture.sha256, p.sha256);
    assert.equal(p.status, 200);
    assert.deepEqual(p.repeatedEntryIds, []);
    assert.match(p.sha256, /^[a-f0-9]{64}$/);
    assert.equal(p.cursor, i ? period.receipts[i - 1].nextCursor : null);
    if (p.cursor) { assert.ok(!cursors.has(p.cursor)); cursors.add(p.cursor); }
    assert.equal(p.hasMore, i < period.receipts.length - 1);
  }
  assert.deepEqual(capturedIds.sort(), report.rows.filter(r => r.period === period.period).map(r => r.entryId).sort());
}
assert.deepEqual(report.summary.ongoing, { rows: 2, identities: 2 });
assert.deepEqual(report.summary.ended, { rows: 3, identities: 3 });
for (const [status, expected] of Object.entries({ covered: [52, 47], added: [15, 14], held: [16, 16] })) {
  const rows = report.rows.filter(r => r.status === status);
  const actual = { rows: rows.length, identities: new Set(rows.map(r => r.identity)).size };
  assert.deepEqual(actual, { rows: expected[0], identities: expected[1] });
  assert.deepEqual(report.summary[status as 'covered' | 'added' | 'held'], actual);
}
for (const r of report.rows) {
  assert.ok(r.reason.length > 20);
  assert.ok(r.primary.fetchedAt.startsWith('2026-10-16T'));
  assert.match(r.primary.sha256, /^[a-f0-9]{64}$/);
  assert.equal(r.runtimeAfter.length, r.status === 'held' ? 0 : 1);
  if (r.status !== 'held') assert.equal(index.get(r.runtimeAfter[0].slug!)?.id, r.runtimeAfter[0].id);
  if (r.primary.visibility === 'private' || r.kind === 'conflicting-date') assert.equal(r.status, 'held');
}
const newIds = new Set(plans.map(p => p.id));
assert.equal(plans.length, 14);
assert.equal(newIds.size, 14);
const added = runtime.filter(e => newIds.has(e.id));
assert.deepEqual(added.map(e => e.id).sort(), [...newIds].sort());
assert.deepEqual([...new Set(report.rows.filter(r => r.status === 'added').flatMap(r => r.runtimeAfter.map(e => e.id)))].sort(), [...newIds].sort());
for (const e of added) {
  assert.ok(!hasEventEnded(e, auditAt));
  assert.equal(e.visibility, 'public');
  assert.equal(e.timezone, 'Asia/Kolkata');
  if (!e.sourceVerification) {
    assert.match(e.startDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(e.endDate!, /^\d{4}-\d{2}-\d{2}$/);
  } else {
    const receipt = report.rows.find(r => r.eventId === e.sourceVerification?.eventId)!;
    assert.equal(e.startDate, receipt.primary.startDate);
    assert.equal(e.endDate, receipt.primary.endDate);
  }
  assert.ok(getVerifiedEventDescription(e));
  assert.equal(hash(e.description), e.descriptionSource?.sha256);
  assert.ok(e.descriptionSource?.evidence?.every(s => /^[a-f0-9]{64}$/.test(s.sha256)));
  assert.equal(e.slug, plans.find(p => p.id === e.id)?.slug);
  assert.equal((history as Record<string, { slug: string }>)[e.id].slug, e.slug);
  assert.match(e.slug!, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(runtime.filter(r => r.slug === e.slug).length, 1);
  assert.equal(runtime.filter(r => r.url === e.url).length, 1);
  if (e.sourceVerification) assert.equal(runtime.filter(r => r.sourceVerification?.eventId === e.sourceVerification?.eventId).length, 1);
  if (e.description.includes('requires host approval') || e.description.includes('host approval required')) assert.equal(e.approvalRequired, true);
  for (const alias of e.aliases || []) assert.equal(index.get(alias)?.id, e.id);
  if (e.locationHidden) for (const field of ['venueName', 'streetAddress', 'addressLocality', 'addressRegion', 'addressCountry', 'postalCode', 'neighborhood', 'coordinates'] as const) assert.equal(e[field], undefined, `${e.id}: hidden ${field}`);
  assert.ok(!/[—–“”‘’]/.test(e.description));
}
const preserved = runtime.filter(e => !newIds.has(e.id));
assert.equal(preserved.length, baseline.runtime.count - baseline.runtime.removed.length);
assert.equal(digest(preserved), baseline.runtime.preservedSha256, 'Existing runtime records changed');
for (const previous of baseline.runtime.removed) {
  assert.ok(!runtime.some(e => e.id === previous.id));
  assert.ok(hasEventEnded(previous, auditAt), `Unexpected runtime removal ${previous.id}`);
}
for (const [file, expected] of Object.entries(baseline.protectedHashes)) assert.equal(hash(readText(file)), expected, file);
assert.equal(ibw.rows.length, 54);
for (const row of ibw.rows) {
  const e = runtime.find(e => e.id === row.id);
  assert.ok(e, `Missing protected IBW record ${row.id}`);
  assert.equal(hash(e.description), row.afterSha256, `Protected IBW copy ${row.id}`);
}
assert.equal(index.get('free-society-hackathon')?.sourceVerification?.eventId, 'evt-B6kmWqZYUUeTkIP');
const removed = baseline.sources.flatMap(s => s.removed);
assert.deepEqual(EVENT_SOURCES.map(s => s.file).sort(), baseline.sources.map(s => s.file).sort());
assert.equal(baseline.sources.reduce((n, s) => n + s.enrichedIds.length, 0), 2);
assert.equal(report.summary.enrichedSourceOnlyRecords, 2);
assert.equal(report.summary.newSourceRecords, 12);
for (const s of baseline.sources) {
  const current = EVENT_SOURCES.find(source => source.file === s.file)!.events;
  const existing = current.filter(e => !newIds.has(e.id));
  assert.equal(existing.length, s.count - s.enrichedIds.length - s.removed.length, s.file);
  assert.equal(digest(existing), s.preservedSha256, `Unexpected source edit ${s.file}`);
  assert.deepEqual(current.filter(e => newIds.has(e.id)).map(e => e.id).sort(), plans.filter(p => p.file === s.file).map(p => p.id).sort());
  for (const id of s.enrichedIds) assert.ok(newIds.has(id));
  for (const previous of s.removed) {
    assert.ok(!current.some(e => e.id === previous.id));
    assert.ok(isEventRetentionDue(previous, auditAt), `Unexpected source removal ${previous.id}`);
  }
}
const publicRuntime = new URL('../public/data/events-runtime.json', import.meta.url);
const publicMirror = fs.existsSync(publicRuntime) ? 'matched' : 'not generated';
if (publicMirror === 'matched') assert.equal(readText('content/events-runtime.json'), fs.readFileSync(publicRuntime, 'utf8'));
const evidence = { checkedAt: new Date(Date.now()).toISOString(), auditAt: baseline.auditAt, calendarEntries: report.rows.length, calendarIdentities: new Set(report.rows.map(r => r.identity)).size, heldIdentities: report.summary.held.identities, runtimeEvents: runtime.length, addedRuntimeIdentities: added.length, protectedIbwRows: ibw.rows.length, retainedExistingRuntimeRecordsExact: preserved.length, retiredSourceRecords: removed, publicMirror, passed: ['pagination-exhaustion', 'no-repeated-cursors-or-entry-IDs', 'all-83-rows-accounted', 'primary-provenance-hash-format', 'private-and-conflict-holds', 'date-only-external-times', 'slug-and-alias-ownership', 'existing-record-preservation', 'hidden-venue-privacy', 'normal-retention', ...(publicMirror === 'matched' ? ['public-runtime-mirror'] : [])] };
console.log(JSON.stringify(evidence, null, 2));
