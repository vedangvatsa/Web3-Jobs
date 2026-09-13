import assert from 'node:assert/strict';
import { getEvents } from '../src/lib/events-server';
import { getPublicEvent } from '../src/lib/event-public';

const blockedName = ['web3', 'voyager'].join('');
const blockedDomain = `${blockedName}.com`;

function collectUrls(value: unknown): string[] {
  if (typeof value === 'string') return /^https?:\/\//i.test(value) ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(collectUrls);
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).flatMap(collectUrls);
}

async function main() {
  const events = await getEvents();
  assert.ok(events.length > 0, 'the event loader must return upcoming events');

  for (const event of events) {
    const publicEvent = getPublicEvent(event);
    const serialized = JSON.stringify(publicEvent).toLowerCase();

    assert.equal('source' in publicEvent, false, `${event.id} exposes internal provenance`);
    assert.equal('website' in publicEvent, false, `${event.id} exposes its raw website`);
    assert.equal('registrationUrl' in publicEvent, false, `${event.id} exposes its raw registration URL`);
    assert.equal(serialized.includes(blockedName), false, `${event.id} exposes blocked branding`);
    assert.equal(serialized.includes(blockedDomain), false, `${event.id} exposes a blocked domain`);

    for (const url of collectUrls(publicEvent)) {
      const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
      assert.equal(
        hostname === blockedDomain || hostname.endsWith(`.${blockedDomain}`),
        false,
        `${event.id} exposes an aggregator URL: ${url}`,
      );
    }
  }

  console.log(`Event public-data tests passed for ${events.length} events.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
