import assert from 'node:assert/strict';
import { getEventExternalUrl } from '../src/lib/event-external-url';
import type { Web3Event } from '../src/lib/events';

function event(overrides: Partial<Web3Event> = {}): Web3Event {
  return {
    id: 'example-event',
    name: 'Example Web3 Summit',
    description: 'A public event for Web3 builders.',
    startDate: '2027-05-10T09:00:00Z',
    location: 'New York, United States',
    url: 'https://example.org/event',
    coverImage: null,
    ...overrides,
  };
}

assert.equal(
  getEventExternalUrl(event({
    registrationUrl: 'https://tickets.example.org/register',
    website: 'https://example.org',
  })),
  'https://tickets.example.org/register',
  'registration URLs take priority',
);
assert.equal(
  getEventExternalUrl(event({ website: 'https://example.org/official', url: 'https://other.example.org/event' })),
  'https://example.org/official',
  'official websites are the fallback',
);
assert.equal(
  getEventExternalUrl(event({ registrationUrl: 'https://bit.ly/example', website: 'https://example.org/official' })),
  'https://example.org/official',
  'blocked registration URLs fall through to a safe official website',
);
assert.equal(
  getEventExternalUrl(event({ url: 'https://lu.ma/direct-registration' })),
  'https://lu.ma/direct-registration',
  'direct Luma registrations are allowed',
);

for (const url of [
  'https://conferenceindex.org/event/example',
  'https://events.web3voyager.com/example',
  'https://www.marketacross.com/crypto-events/example',
  'https://deeptechtimes.com/events/example',
  'https://coinmarketcap.com/events/example',
  'https://web.dev.events/example',
  'https://www.cloud.google.com/application/web3/events',
  'https://community.ethereum.org/community/events/conferences/example',
]) {
  assert.equal(getEventExternalUrl(event({ url })), undefined, `${url} must be blocked`);
}

for (const url of [
  'https://bit.ly/example',
  'https://www.bit.ly/example',
  'not a url',
  'mailto:events@example.org',
  'javascript:alert(1)',
]) {
  assert.equal(getEventExternalUrl(event({ url })), undefined, `${url} must be blocked`);
}

console.log('Event external URL tests passed.');
