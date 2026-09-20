import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { canonicalLumaUrl, lumaSourcePatch, object, type LumaSnapshot } from './luma-source-record';

const cache = path.join(process.cwd(), '.cache/event-verification');
let checked = 0;
let textNodes = 0;
let ticketPrices = 0;
const actorRows = new Map<string, Record<string, unknown>[]>();

for (const { events } of EVENT_SOURCES) {
  for (const event of events) {
    const url = [event.registrationUrl, event.url, event.website].map(canonicalLumaUrl).find(Boolean);
    if (!url) continue;
    const file = path.join(cache, 'pages', `${createHash('sha256').update(url).digest('hex')}.json`);
    if (!fs.existsSync(file)) continue;
    const snapshot = JSON.parse(fs.readFileSync(file, 'utf8')) as LumaSnapshot;
    const patch = lumaSourcePatch(snapshot);
    assert.equal(snapshot.url, url);
    assert.ok(patch.sourceVerification?.eventId.startsWith('evt-'));
    const checkText = (value: unknown) => {
      if (Array.isArray(value)) return value.forEach(checkText);
      const node = object(value);
      if (typeof node.text === 'string' && node.text.trim()) {
        assert.ok(patch.description?.includes(node.text.trim()), `${event.id}: source text was lost: ${node.text.slice(0, 80)}`);
        textNodes++;
      }
      if (node.content) checkText(node.content);
    };
    checkText(snapshot.data.description_mirror);
    if (patch.locationHidden) {
      assert.equal(patch.streetAddress, undefined);
      assert.equal(patch.coordinates, undefined);
      assert.equal(patch.venueName, undefined);
    }
    if (snapshot.apifyRunId) {
      if (!actorRows.has(snapshot.apifyRunId)) {
        actorRows.set(snapshot.apifyRunId, JSON.parse(fs.readFileSync(path.join(cache, `${snapshot.apifyRunId}-items.json`), 'utf8')));
      }
      const actor = actorRows.get(snapshot.apifyRunId)!.find((row) => row.eventId === patch.sourceVerification?.eventId);
      assert.ok(actor, `${event.id}: provenance does not match an Apify result`);
      for (const offer of patch.ticketOffers || []) {
        const actorTicket = (Array.isArray(actor.ticketTypes) ? actor.ticketTypes : []).map(object).find((ticket) => ticket.name === offer.name && String(ticket.currency || '').toUpperCase() === (offer.priceCurrency || ''));
        if (actorTicket && typeof actorTicket.price === 'number') {
          assert.ok(Math.abs(actorTicket.price - offer.price) < 0.001, `${event.id}: source price disagrees with Apify (${offer.price} vs ${actorTicket.price})`);
          ticketPrices++;
        }
      }
    }
    checked++;
  }
}
assert.ok(checked > 0, 'No snapshots available; run event verification first');
console.log(`Verified ${checked} source records, preserved ${textNodes} source text nodes, and cross-checked ${ticketPrices} ticket prices against Apify.`);
