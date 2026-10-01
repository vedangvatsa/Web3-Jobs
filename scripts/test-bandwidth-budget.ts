import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { config } from '../src/middleware';
import { getEvents } from '../src/lib/events-server';
import { getEventListItem, getPublicEvent } from '../src/lib/event-public';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import { loadEventSearchDescriptions } from '../src/lib/event-search-client';
import { isRetiredOrProbePath } from '../src/lib/retired-request';
import { groupEventsForMap } from '../src/lib/event-map-locations';
import { getEventSlug, isEventUpcoming } from '../src/lib/events';

async function main() {
  const events = (await getEvents()).filter(event => isEventUpcoming(event));
  const full = events.map(getPublicEvent);
  const listing = events.map(getEventListItem);
  for (let i = 0; i < events.length; i++) {
    const item = listing[i];
    assert.equal(item.slug, getEventSlug(events[i]));
    assert.equal(item.startDate, events[i].startDate);
    assert.equal(item.timezone, events[i].timezone);
    assert.ok(item.description.length <= 240);
    for (const key of ['source', 'sourceVerification', 'descriptionSource', 'registrationUrl', 'ticketOffers', 'speakers', 'coverImage']) {
      assert.equal(key in item, false, `${item.slug}: unnecessary listing field ${key}`);
    }
  }
  assert.deepEqual(groupEventsForMap(listing).map(g => [g.key, g.events.map(e => e.id)]), groupEventsForMap(full).map(g => [g.key, g.events.map(e => e.id)]));
  const fullBytes = gzipSync(JSON.stringify(full)).length;
  const listingBytes = gzipSync(JSON.stringify(listing)).length;
  assert.ok(listingBytes < fullBytes * 0.25, 'Event listing must save at least 75% of its compressed payload');
  console.log(`Event listing: ${events.length} records; gzip ${fullBytes} → ${listingBytes} bytes (${(100 * (1 - listingBytes / fullBytes)).toFixed(1)}% smaller).`);

  for (const url of ['/events', '/events?mode=agent', '/data/events-runtime.json', '/data/jobs-runtime.json', '/job-shards/00.json', '/articles-data/example.json', '/events/cover.webp']) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), false, `${url}: must be CDN eligible`);
  }
  for (const url of ['/events/tg', '/token2049', '/learn/fundamentals/web3', '/api/email/unsubscribe', '/api/jobs']) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), true, `${url}: middleware compatibility`);
  }
  for (const url of ['/api/jobs', '/api/v1/jobs', '/api/og', '/.env', '/wp-content/a.php']) assert.ok(isRetiredOrProbePath(url));
  for (const url of ['/api/email/unsubscribe', '/api/openapi.json', '/data/jobs-runtime.json', '/jobs', '/php-developer']) assert.equal(isRetiredOrProbePath(url), false);

  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async input => {
    assert.equal(input, '/data/events-runtime.json');
    calls++;
    if (calls === 1) return new Response('Unavailable', { status: 503 });
    if (calls === 2) return Response.json([{ id: 'bad' }]);
    return Response.json(events);
  };
  try {
    assert.equal(calls, 0, 'No full event download before searching');
    await assert.rejects(loadEventSearchDescriptions(), /HTTP 503/);
    await assert.rejects(loadEventSearchDescriptions(), /Invalid event search catalog/);
    const [first, second] = await Promise.all([loadEventSearchDescriptions(), loadEventSearchDescriptions()]);
    assert.strictEqual(first, second);
    assert.equal(calls, 3, 'Concurrent searches must share one download');
    for (const event of events) assert.equal(first[event.id], getVerifiedEventDescription(event).toLowerCase());
    await loadEventSearchDescriptions();
    assert.equal(calls, 3, 'Repeated searches must reuse full descriptions');
  } finally { globalThis.fetch = originalFetch; }
  console.log('Bandwidth regressions passed: listing budgets, map parity, on-demand full-text search/retries, middleware and retired routes.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
