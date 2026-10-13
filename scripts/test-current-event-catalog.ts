import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import events from '../content/events-runtime.json';
import migrations from '../content/events/slug-migrations.json';
import descriptions from '../content/events/catalog-reviewed-descriptions.json';
import history from '../content/event-slug-history.json';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { hasEventEnded } from './lib/event-dates.mjs';
import { assignStableEventSlugs } from '../src/lib/event-slug-assignment';
import { buildEventSlugIndex } from '../src/lib/event-slug-index';
import { applyEventCatalogReview } from '../src/lib/event-catalog-review';
import { getEventBaseSlug, type Web3Event } from '../src/lib/events';

const live = events as Web3Event[];
const index = buildEventSlugIndex(live);
for (const [oldSlug, newSlug] of Object.entries(migrations)) {
  if (!index.has(newSlug)) {
    const owner = Object.entries(history).find(([, record]) => record.slug === newSlug);
    assert.ok(owner, `Missing historical owner for /${newSlug}`);
    assert.ok(owner[1].aliases.includes(oldSlug), `Historical alias lost /${oldSlug}`);
    const source = EVENT_SOURCES.flatMap(source => source.events).find(event => event.id === owner[0]);
    assert.ok(source && hasEventEnded(source), `Unexpired migration missing /${newSlug}`);
    assert.equal(index.has(oldSlug), false, `Ended alias resurrected /${oldSlug}`);
    continue;
  }
  assert.equal(index.get(oldSlug)?.slug, newSlug, `Migration lost /${oldSlug}`);
  assert.equal(index.get(newSlug)?.id, index.get(oldSlug)?.id);
}
const ethwali = index.get('0ej7kbb0')!;
assert.equal(ethwali.slug, 'ethwali');
assert.match(ethwali.description, /Secret Society/);
assert.match(ethwali.description, /18:00 to 23:30 IST/);
assert.match(ethwali.description, /requires host approval/);
assert.equal(ethwali.locationHidden, true);
assert.equal(ethwali.approvalRequired, true);
const stale = { ...ethwali, description: 'A short imported meta description.', location: 'Private address', streetAddress: 'Private address' };
const refreshed = applyEventCatalogReview(stale);
assert.equal(refreshed.description, ethwali.description);
assert.equal(refreshed.streetAddress, undefined);
assert.ok(!refreshed.location.includes('Private address'));
for (const [id, entry] of Object.entries(descriptions)) {
  assert.equal(createHash('sha256').update(entry.description).digest('hex'), entry.descriptionSource.sha256, `${id}: description digest`);
  assert.ok(Number.isFinite(Date.parse(entry.descriptionSource.fetchedAt)));
}
assert.equal(getEventBaseSlug({ name: 'Digital Asset Security Summit 2027' }), 'digital-asset-security-summit');
const newEvent: Web3Event = { ...ethwali, id: 'new-event', name: 'Example Developer Summit', slug: '7xq0v3r9', aliases: [], city: 'Mumbai' };
assert.equal(assignStableEventSlugs([newEvent], new Set(), {})[0].slug, 'example-developer-summit');
assert.equal(assignStableEventSlugs([{ ...newEvent, name: 'SOL Developer Meetup', slug: 'sol12a8b' }], new Set(), {})[0].slug, 'sol-developer-meetup', 'A source code containing a title fragment is still opaque');
assert.equal(assignStableEventSlugs([newEvent], new Set(['example-developer-summit']), {})[0].slug, 'example-developer-summit-mumbai');
assert.throws(() => assignStableEventSlugs([ethwali], new Set(['ethwali']), { [ethwali.id]: { slug: '0ej7kbb0' } }), /collides/);
const migrated = assignStableEventSlugs([ethwali], new Set(), { [ethwali.id]: { slug: '0ej7kbb0', aliases: ['older-ethwali'] } })[0];
assert.ok(migrated.aliases?.includes('0ej7kbb0'));
assert.ok(migrated.aliases?.includes('older-ethwali'));
assert.equal(index.get('bitcoin-hong-kong-meetup-december-2026')?.startDate, '2026-12-17T11:30:00.000Z');
assert.equal(index.get('web3-digest-coffee-chat')?.eventStatus, 'EventPostponed');
assert.ok(!live.some(event => event.id === 'india-luma-9mjyny8k'), 'Past Jaipur event must not remain upcoming');
assert.equal(fs.readFileSync('content/events-runtime.json', 'utf8'), fs.readFileSync('public/data/events-runtime.json', 'utf8'));
console.log(`Current catalog passed: ${live.length} events, ${Object.keys(migrations).length} migrations, provenance, ingestion persistence, privacy, postponed dates and collisions.`);
