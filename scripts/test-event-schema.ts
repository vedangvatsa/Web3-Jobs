import assert from 'node:assert/strict';
import { buildGoogleEventSchema } from '../src/lib/event-schema';
import type { Web3Event } from '../src/lib/events';

const sourceUrl = 'https://events.example.com/register';
const pageUrl = 'https://hashtagweb3.com/example-event';

function event(overrides: Partial<Web3Event> = {}): Web3Event {
  return {
    id: 'example-event',
    name: 'Example Web3 Summit',
    description: 'A public, in-person event for Web3 builders.',
    startDate: '2027-05-10T09:00:00-04:00',
    endDate: '2027-05-10T17:00:00-04:00',
    location: 'Example Convention Center, 100 Main Street, New York, NY 10001, United States',
    url: sourceUrl,
    coverImage: null,
    ...overrides,
  };
}

function schema(overrides: Partial<Web3Event> = {}) {
  return buildGoogleEventSchema(event(overrides), { pageUrl });
}

const valid = schema({ price: 'USD 25' });
assert.ok(valid, 'a public event with a detailed address should emit schema');
assert.deepEqual(valid.location, {
  '@type': 'Place',
  name: 'Example Convention Center, 100 Main Street, New York, NY 10001, United States',
  address: {
    '@type': 'PostalAddress',
    name: 'Example Convention Center, 100 Main Street, New York, NY 10001, United States',
  },
});
assert.deepEqual(valid.offers, {
  '@type': 'Offer',
  url: sourceUrl,
  price: 25,
  priceCurrency: 'USD',
});
assert.equal('eventStatus' in valid, false, 'an unstated event status must not be fabricated');
assert.equal('organizer' in valid, false, 'organizers must not be inferred from the event title or URL');
assert.equal('performer' in valid, false, 'performers must not be inferred from speakers or event text');

assert.equal(schema({ endDate: '2027-05-09T17:00:00-04:00' }), null, 'an end date before start must suppress schema');
assert.equal(schema({ description: 'Join our virtual livestream from anywhere.' }), null, 'virtual descriptions must suppress schema');
assert.equal(schema({ location: 'TBD' }), null, 'TBD locations must suppress schema');
assert.equal(schema({ location: 'New York, United States' }), null, 'city-only locations must suppress schema');
assert.equal(schema({ description: 'A private event for invited guests.' }), null, 'private events must suppress schema');
assert.equal(schema({ location: 'Online', city: 'Online', attendanceMode: 'online' }), null, 'Google excludes virtual-only experiences');
assert.equal(schema({ approvalRequired: true }), null, 'approval-gated events must not be marked up as public registration');
assert.equal(schema({ locationHidden: true }), null, 'withheld addresses must not be published as confirmed venues');
assert.equal(schema({ visibility: 'private' }), null);
assert.equal(schema({ startDate: '2027-02-30' }), null);
assert.equal(schema({ streetAddress: 'Mumbai' }), null, 'a city in streetAddress must suppress schema');
assert.equal(schema({ streetAddress: 'Jio World Centre' }), null, 'a venue-only streetAddress must suppress schema');
assert.equal(schema({ streetAddress: '10' }), null, 'a bare streetAddress number must suppress schema');
assert.ok(schema({ streetAddress: '42 Rue de Rivoli, 75001 Paris' }), 'a detailed international streetAddress should emit schema');

const free = schema({ price: 'Free' });
assert.ok(free?.offers, 'Free should emit an offer');
assert.ok(!Array.isArray(free.offers));
assert.equal(free.offers.price, 0);
assert.equal('priceCurrency' in free.offers, false, 'Free must not invent a currency');

const ambiguous = schema({ price: '$25' });
assert.ok(ambiguous, 'an otherwise eligible event should still emit schema');
assert.equal('offers' in ambiguous, false, 'ambiguous currency symbols must not emit offers');

const verified = schema({
  city: 'Wrong fallback city', country: 'Wrong fallback country',
  streetAddress: '100 Main Street', addressLocality: 'New York', addressRegion: 'NY', postalCode: '10001', addressCountry: 'US',
  eventStatus: 'EventRescheduled', previousStartDate: '2027-05-01T09:00:00-04:00',
  ticketOffers: [{ url: sourceUrl, name: 'Standard', price: 25, priceCurrency: 'USD', availability: 'SoldOut', validFrom: '2027-01-01' }],
});
assert.equal(verified?.location.address.addressCountry, 'US');
assert.equal(verified?.location.address.addressLocality, 'New York');
assert.equal(verified?.eventStatus, 'https://schema.org/EventRescheduled');
assert.equal(verified?.previousStartDate, '2027-05-01T09:00:00-04:00');
assert.ok(verified?.offers && !Array.isArray(verified.offers));
assert.equal(verified.offers.availability, 'https://schema.org/SoldOut');
assert.equal(verified.offers.validFrom, '2027-01-01');

console.log('Event schema tests passed.');
