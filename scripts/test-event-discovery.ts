import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import type { Web3Event } from '../src/lib/events';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import { buildEventSlugIndex } from '../src/lib/event-slug-index';
import { listUnmappedMapEvents } from '../src/lib/event-map-locations';
import { canImportEvent } from './lib/event-retention.mjs';
import { hasEventEnded } from './lib/event-dates.mjs';
import { expectedEventDescriptionHash } from './lib/event-grammar-audit';

type AuditEvent = Pick<Web3Event, 'id' | 'startDate' | 'endDate' | 'timezone' | 'eventStatus'>;
type DiscoveryAudit = {
  records: Array<AuditEvent & { sourceFile: string; disposition: string }>;
  previousCatalog: Array<AuditEvent & { slug: string; aliases: string[]; descriptionSha256: string }>;
  corrections: Array<{ id: string }>;
};

const audit = JSON.parse(fs.readFileSync('content/events/discovery-audit-2026-10-20.json', 'utf8')) as DiscoveryAudit;
const runtime = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
const tombstones = JSON.parse(fs.readFileSync('content/event-tombstones.json', 'utf8'));
const index = buildEventSlugIndex(runtime);
const liveById = new Map(runtime.map(event => [event.id, event]));
const corrected = new Set(audit.corrections.map(record => record.id));
let currentAdditions = 0;

for (const record of audit.records) {
  if (hasEventEnded(record)) continue;
  const matches = runtime.filter(event => event.id === record.id);
  assert.equal(matches.length, 1, `${record.id}: expected exactly one current listing`);
  const event = matches[0];
  const source = EVENT_SOURCES.find(feed => feed.file === record.sourceFile)?.events.find(row => row.id === record.id);
  assert.ok(source, `${record.id}: durable source missing`);
  assert.equal(event.startDate, record.startDate, `${record.id}: reviewed date changed`);
  assert.equal(event.endDate, record.endDate, `${record.id}: reviewed end changed`);
  assert.equal(event.visibility, 'public', `${record.id}: non-public event imported`);
  assert.equal(event.publicationStatus, undefined, `${record.id}: publication hold bypassed`);
  assert.ok(canImportEvent(event, tombstones), `${record.id}: tombstone bypassed`);
  assert.ok(getVerifiedEventDescription(source), `${record.id}: missing source provenance`);
  assert.match(source.descriptionSource?.sha256 || '', /^[a-f0-9]{64}$/);
  assert.ok(source.descriptionSource?.evidence?.length, `${record.id}: primary fetch evidence missing`);
  assert.ok(source.descriptionSource.evidence.every(item => /^https?:/.test(item.url) && /^[a-f0-9]{64}$/.test(item.sha256) && Number.isFinite(Date.parse(item.fetchedAt))));
  assert.equal(index.get(event.slug!)?.id, event.id, `${record.id}: root URL collision`);
  assert.notEqual(event.slug, 'web3-event', `${record.id}: unhelpful generated slug`);
  assert.doesNotMatch(event.description, /\u2014|Web3 community event\.|is listed in the official/);
  if (event.locationHidden) {
    for (const key of ['venueName', 'streetAddress', 'addressLocality', 'addressRegion', 'postalCode', 'addressCountry', 'coordinates', 'venueAddresses', 'venueAddressSource'] as const) {
      assert.equal(event[key], undefined, `${record.id}: hidden ${key} leaked`);
    }
  }
  if (event.coverImage) {
    assert.ok(event.coverImage.startsWith('/events/'), `${record.id}: cover is not self-hosted`);
    assert.ok(fs.existsSync(`public${event.coverImage}`), `${record.id}: cover file missing`);
  }
  currentAdditions++;
}

for (const previous of audit.previousCatalog) {
  if (hasEventEnded(previous)) continue;
  const event = liveById.get(previous.id);
  assert.ok(event, `${previous.id}: prior upcoming event lost`);
  assert.equal(event.slug, previous.slug, `${previous.id}: published URL changed`);
  for (const alias of previous.aliases) assert.equal(index.get(alias)?.id, event.id, `${previous.id}: historical alias lost`);
  if (!corrected.has(previous.id)) {
    assert.equal(createHash('sha256').update(event.description).digest('hex'), expectedEventDescriptionHash(previous.id, previous.descriptionSha256), `${previous.id}: existing description changed without a reviewed correction`);
  }
}

const privacyCorrection = liveById.get('w3v-200ms-26-11-13');
if (privacyCorrection) {
  assert.equal(privacyCorrection.slug, '200ms');
  assert.equal(privacyCorrection.locationHidden, true);
  assert.equal(privacyCorrection.streetAddress, undefined);
  assert.equal(privacyCorrection.coordinates, undefined);
  assert.doesNotMatch(privacyCorrection.description, /Olympia|Hammersmith|W14/i);
}
assert.deepEqual(listUnmappedMapEvents(runtime), { missingCoordinates: [], missingCountry: [] });
assert.equal(fs.readFileSync('content/events-runtime.json', 'utf8'), fs.readFileSync('public/data/events-runtime.json', 'utf8'));
console.log(`Verified ${currentAdditions} discovered/recovered listings: primary evidence, privacy, images, map coverage, existing descriptions and URL ownership.`);
