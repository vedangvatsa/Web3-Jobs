import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { buildEventSlugIndex } from '../src/lib/event-slug-index';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import { formatEventLocation, getEventDatePill, getEventSlug, type Web3Event } from '../src/lib/events';
import { resolveEventGuide } from '../src/lib/event-guide-store';

async function main() {
  const events = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
  const report = JSON.parse(fs.readFileSync('content/events/source-recovery-report.json', 'utf8')) as { originalGaps: number; recovered: number; quarantined: number; failures: unknown[]; records: Array<{ id: string; outcome: string }> };
  const index = buildEventSlugIndex(events);
  const sourceRecords = EVENT_SOURCES.flatMap((source) => source.events);
  assert.equal(report.originalGaps, 33);
  assert.equal(report.recovered, 34, '32 original gaps plus two previously hidden duplicate records');
  assert.equal(report.quarantined, 1);
  assert.deepEqual(report.failures, []);
  for (const row of report.records) {
    const stored = sourceRecords.find((event) => event.id === row.id)!;
    assert.ok(stored, `${row.id}: source record was lost`);
    if (row.outcome === 'needs-review') {
      assert.equal(stored.publicationStatus, 'needs-review');
      assert.ok(!events.some((event) => event.id === row.id), `${row.id}: conflicting source was published`);
      assert.ok(stored.description.length > 0, 'the archived organizer copy must be retained');
      continue;
    }
    const published = index.get(getEventSlug(stored)) || index.get(row.id.toLowerCase());
    assert.ok(published, `${row.id}: corrected or merged page does not resolve`);
    assert.ok(getVerifiedEventDescription(published), `${row.id}: corrected page has no verified description`);
    if (stored.descriptionSource) assert.equal(createHash('sha256').update(stored.description).digest('hex'), stored.descriptionSource.sha256);
  }
  for (const event of events) {
    assert.ok(getVerifiedEventDescription(event), `${event.id}: an unverified description reached publication`);
    assert.equal((await resolveEventGuide(event)).descriptionStatus, 'source-backed');
  }
  const postponed = events.find((event) => event.id === 'ma-bitcoin-mena')!;
  assert.equal(postponed.eventStatus, 'EventPostponed');
  assert.equal(getEventDatePill(postponed.startDate, postponed.timezone, postponed.eventStatus).day, 'TBA');
  assert.match((await resolveEventGuide(postponed)).summaryLead, /postponed/);
  assert.ok(!(await resolveEventGuide(postponed)).summaryLead.includes('Dec 7'));
  assert.equal(sourceRecords.find((event) => event.id === 'premier-ethmumbai-2026')!.startDate, '2026-11-05');
  assert.equal(sourceRecords.find((event) => event.id === 'premier-bigwhale')!.city, 'Geneva');
  assert.equal(formatEventLocation(events.find((event) => event.id === 'w3v-crypto-worlds-fair-hackathon-by-colosseum')!), 'Online');
  const fixture = { ...postponed, id: 'alias-owner', slug: 'canonical', aliases: ['old-page', 'other'] };
  const other = { ...postponed, id: 'other-id', slug: 'other' };
  const aliasIndex = buildEventSlugIndex([fixture, other]);
  assert.equal(aliasIndex.get('old-page')?.id, fixture.id);
  assert.equal(aliasIndex.get('other')?.id, other.id, 'an alias must not overwrite a canonical route');
  console.log(`Source recovery passed: 32 original descriptions restored, two related duplicates corrected, one conflicting source held for review; all ${events.length} published pages have sourced descriptions.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
