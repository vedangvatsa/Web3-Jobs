import assert from 'node:assert/strict';
import { extractOfficialEventDescription } from './official-event-description';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { createHash } from 'node:crypto';

const event = { name: 'Wallet Builders Summit 2026', startDate: '2026-10-01' };
const html = `<title>Wallet Builders Summit 2026</title><script type="application/ld+json">${JSON.stringify({ '@graph': [
  { '@type': 'Event', name: 'Wallet Builders Summit 2025', startDate: '2025-10-01', description: 'The old edition must not become the current description.' },
  { '@type': 'Event', name: 'Wallet Builders Summit 2026', startDate: '2026-09-30', endDate: '2026-10-01', description: '<p>Build recovery tools with wallet engineers.</p><ul><li>Recovery sessions</li><li>Security workshop</li></ul>' },
] })}</script>`;
const result = extractOfficialEventDescription(html, event).result;
assert.equal(result?.method, 'event-jsonld');
assert.ok(result?.description.includes('Recovery sessions'));
assert.ok(!result?.description.includes('old edition'));
assert.equal(result?.eventFacts?.startDate, '2026-09-30', 'verified dates override stale listing dates');
assert.equal(extractOfficialEventDescription('<title>Wallet Company</title><meta name="description" content="A generic company selling wallets to consumers across the world.">', event).reason, 'event-not-matched');
assert.equal(extractOfficialEventDescription('<title>Wallet Builders Summit 2025</title><meta name="description" content="Wallet Builders Summit brings together engineers to build recovery tools.">', event).reason, 'different-event-edition');
assert.equal(extractOfficialEventDescription('<title>Just a moment...</title>', event).reason, 'blocked-or-error-page');
const duplicated = '<title>Wallet Builders Summit 2026</title><main><h2>About the event</h2><p>Meet wallet engineers for practical recovery sessions and a security workshop.</p><p>Meet wallet engineers for practical recovery sessions and a security workshop.</p><p>The program also includes hands-on sessions about account recovery and transaction signing.</p><footer>Subscribe to our newsletter</footer></main>';
const body = extractOfficialEventDescription(duplicated, event).result?.description || '';
assert.equal(body.split('Meet wallet engineers').length - 1, 1);
assert.ok(!body.includes('newsletter'));
let verified = 0;
for (const { events } of EVENT_SOURCES) {
  for (const stored of events) {
    if (!stored.descriptionSource) continue;
    assert.equal(createHash('sha256').update(stored.description).digest('hex'), stored.descriptionSource.sha256, `${stored.id}: description changed without a new source verification`);
    verified++;
  }
}
console.log(`Checked source-text hashes for ${verified} official descriptions.`);
console.log('Official event extraction tests passed: event/edition matching, full descriptions, date corrections, and duplicate/navigation cleanup.');
