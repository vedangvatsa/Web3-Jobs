import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import type { Web3Event } from '../src/lib/events';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import { hasEventEnded } from './lib/event-dates.mjs';
import { assertToken2049CatalogPublication } from './lib/token2049-catalog-assertions';
import migrations from '../content/events/slug-migrations.json';
import history from '../content/event-slug-history.json';
import identityMerges from '../content/events/identity-merges.json';

const imported = JSON.parse(fs.readFileSync('content/events/sources/token2049-discovered.json', 'utf8')) as Web3Event[];
const catalog = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
const now = Date.now();
const published = assertToken2049CatalogPublication(imported, catalog, { migrations, history, identityMerges }, now);
let localCovers = 0;
for (const event of imported) {
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
  if (hasEventEnded(event, now)) continue;
  if (event.coverImage?.startsWith('/events/')) {
    assert.ok(fs.existsSync(`public${event.coverImage}`), `Missing local cover for ${event.name} (${event.slug || event.id}): public${event.coverImage}`);
    localCovers++;
  }
}
console.log(JSON.stringify({ imported: imported.length, published, localCovers, totalCatalog: catalog.length }));
