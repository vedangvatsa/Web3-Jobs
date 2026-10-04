import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import type { Web3Event } from '../src/lib/events';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import { hasEventEnded } from './lib/event-dates.mjs';

const imported = JSON.parse(fs.readFileSync('content/events/sources/token2049-discovered.json', 'utf8')) as Web3Event[];
const catalog = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
const missing: { name: string; id: string; slug?: string }[] = [];
const slugs = new Set<string>();
let localCovers = 0;
let published = 0;
for (const event of imported) {
  assert.ok(event.slug && !slugs.has(event.slug), `Duplicate imported slug: ${event.slug}`);
  slugs.add(event.slug!);
  assert.ok(getVerifiedEventDescription(event), `Unverified description: ${event.name}`);
  assert.equal(event.descriptionSource?.sha256, createHash('sha256').update(event.description).digest('hex'));
  assert.ok(!/web3meetups\.xyz/i.test(JSON.stringify(event)));
  assert.ok(!/\/event\/manage\//.test(event.url), `Admin URL published for ${event.name}`);
  assert.ok(!/cancelled|canceled|new-design-test/i.test(event.name));
  assert.ok(!event.endDate || Date.parse(event.endDate) >= Date.parse(event.startDate));
  if (event.locationHidden) {
    assert.equal(event.streetAddress, undefined);
    assert.equal(event.coordinates, undefined);
  }
  // Archived source records can outlive their pruned cover files.
  if (hasEventEnded(event)) continue;
  if (event.coverImage?.startsWith('/events/')) {
    assert.ok(fs.existsSync(`public${event.coverImage}`), `Missing local cover for ${event.name} (${event.slug || event.id}): public${event.coverImage}`);
    localCovers++;
  }
  const publishedEvent = catalog.find(row => row.id === event.id);
  if (publishedEvent) {
    assert.equal(publishedEvent.slug, event.slug, `Canonical URL changed for ${event.name}`);
    published++;
  }
  else if (!catalog.some(row => row.aliases?.includes(event.slug!) || row.aliases?.includes(event.id))) missing.push({ name: event.name, id: event.id, slug: event.slug });
}
assert.deepEqual(missing, [], 'Verified imported events are missing from the listing');
console.log(JSON.stringify({ imported: imported.length, published, localCovers, totalCatalog: catalog.length }));
