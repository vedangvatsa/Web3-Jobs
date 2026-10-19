import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { EventVenueAddress, Web3Event } from '../src/lib/events';
import { applyEventVenueReview, type EventVenueReview } from '../src/lib/event-venue-review';
import { formatVenueAddress, getEventVenueLabel, hasDetailedStreetAddress, hasVerifiedVenueAddress } from '../src/lib/event-address';
import { buildGoogleEventSchema, getGoogleEventSchemaIssues } from '../src/lib/event-schema';
import { EventVenueAddresses } from '../src/components/event-venue-addresses';
import runtime from '../content/events-runtime.json';
import ibwAudit from '../content/events/ibw-description-audit.json';

Object.assign(globalThis, { React });
const event: Web3Event = {
  id: 'address-test', name: 'Public builder conference', startDate: '2026-11-15', endDate: '2026-11-17',
  description: 'Public conference with talks and workshops.', location: 'London, United Kingdom', city: 'London', country: 'United Kingdom',
  url: 'https://organizer.example/conference', coverImage: null, attendanceMode: 'offline', approvalRequired: false,
};
const address = {
  venueName: 'Olympia Convention Centre', streetAddress: 'Hammersmith Road', addressLocality: 'London', addressCountry: 'GB', postalCode: 'W14 8UX',
  location: 'Olympia Convention Centre, Hammersmith Road, London W14 8UX, United Kingdom',
};
const proof = { ...address, checkedAt: '2026-10-19T20:00:00Z', urls: ['https://organizer.example/conference', 'https://venue.example/address'] };
const review: EventVenueReview = { expectedStartDate: event.startDate, checkedAt: proof.checkedAt, patch: { ...address, venueAddressSource: proof } };
const context = { pageUrl: 'https://hashtagweb3.com/address-test' };

test('verified official unnumbered addresses qualify without inventing a house number', () => {
  assert.equal(hasDetailedStreetAddress(address.streetAddress), false);
  const enriched = applyEventVenueReview(event, review);
  assert.equal(hasVerifiedVenueAddress(enriched), true);
  assert.equal(buildGoogleEventSchema(enriched, context)?.location.address.streetAddress, 'Hammersmith Road');
  assert.equal(getEventVenueLabel(enriched), address.location);
  assert.equal(enriched.description, event.description);
  assert.equal(enriched.startDate, event.startDate);
});

test('an address proof cannot authorize changed or city-only fields', () => {
  const enriched = applyEventVenueReview(event, review);
  assert.equal(hasVerifiedVenueAddress({ ...enriched, streetAddress: 'Different Road' }), false);
  assert.equal(hasVerifiedVenueAddress({ ...enriched, location: 'Another venue, London' }), false);
  const cityOnly = { ...address, streetAddress: 'London' };
  assert.equal(hasVerifiedVenueAddress({ ...event, ...cityOnly, venueAddressSource: { ...proof, ...cityOnly } }), false);
  assert.equal(buildGoogleEventSchema({ ...event, ...address }, context), null, 'unnumbered source evidence must be present');
});

test('privacy and registration restrictions survive enrichment', () => {
  for (const restricted of [{ locationHidden: true }, { visibility: 'private' as const }, { visibility: 'unlisted' as const }]) {
    const original = { ...event, ...restricted };
    assert.deepEqual(applyEventVenueReview(original, review), original);
  }
  const gated = applyEventVenueReview({ ...event, approvalRequired: true }, review);
  assert.equal(gated.approvalRequired, true);
  assert.equal(buildGoogleEventSchema(gated, context), null);
  const extra = { ...review, patch: { ...review.patch, approvalRequired: false, description: 'Rewritten', startDate: '2027-01-01' } };
  const unchanged = applyEventVenueReview({ ...event, approvalRequired: true }, extra);
  assert.equal(unchanged.approvalRequired, true);
  assert.equal(unchanged.description, event.description);
  assert.equal(unchanged.startDate, event.startDate);
});

test('reviewed addresses do not transfer to a new date or source identity', () => {
  const nextEdition = { ...event, startDate: '2027-11-15' };
  assert.deepEqual(applyEventVenueReview(nextEdition, review), nextEdition);
  const otherSource = { ...event, sourceVerification: { url: event.url, eventId: 'evt-other', fetchedAt: '2026-10-20T10:00:00Z', method: 'luma-page' as const } };
  assert.deepEqual(applyEventVenueReview(otherSource, { ...review, expectedSourceEventId: 'evt-original' }), otherSource);
});

test('a newer organizer source can withdraw or replace a previously verified address', () => {
  const enriched = applyEventVenueReview(event, review);
  const newer = { ...event, sourceVerification: { url: event.url, eventId: 'evt-original', fetchedAt: '2026-10-20T10:00:00Z', method: 'luma-page' as const } };
  const hidden = applyEventVenueReview(enriched, review, { ...newer, locationHidden: true });
  assert.equal(hidden.locationHidden, true);
  assert.equal(hidden.streetAddress, undefined);
  assert.equal(hidden.venueAddressSource, undefined);
  assert.equal(hidden.location, 'London, United Kingdom');
  const relocated = applyEventVenueReview(enriched, review, { ...newer, location: 'New Hall, 20 Main Street, London', venueName: 'New Hall', streetAddress: '20 Main Street' });
  assert.equal(relocated.streetAddress, '20 Main Street');
  assert.equal(relocated.venueAddressSource, undefined);
  assert.equal(relocated.postalCode, undefined, 'do not retain the previous venue postcode');
});

test('international compound street names are not mistaken for missing addresses', () => {
  for (const value of ['Chausseestraße 36, 10115 Berlin', 'Friedenstraße 24, München', 'Piet Heinkade 179, Amsterdam', '47 Quai Wilson', '2515 Speedway, Austin']) assert.equal(hasDetailedStreetAddress(value), true, value);
  for (const value of ['Berlin', 'Bandra West, Mumbai', 'SoHo, New York', 'Bandra Kurla Complex, Mumbai']) assert.equal(hasDetailedStreetAddress(value), false, value);
});

test('the generated catalog preserves every verified address instead of collapsing it to the city', () => {
  for (const entry of runtime as Web3Event[]) {
    if (entry.venueAddressSource) assert.equal(hasVerifiedVenueAddress(entry), true, entry.id);
  }
});

test('address enrichment preserves protected IBW descriptions and Free Society facts', () => {
  const catalog = runtime as Web3Event[];
  for (const row of ibwAudit.rows) {
    const item = catalog.find(entry => entry.id === row.id);
    // Ended events leave the runtime; retained descriptions must remain exact.
    if (item) assert.equal(createHash('sha256').update(item.description).digest('hex'), row.afterSha256, row.id);
  }
  const freeSociety = catalog.find(entry => entry.slug === 'free-society-hackathon');
  if (!freeSociety) return;
  assert.equal(freeSociety.sourceVerification?.eventId, 'evt-B6kmWqZYUUeTkIP');
  assert.equal(freeSociety.startDate, '2026-11-04T05:30:00.000Z');
  assert.equal(freeSociety.endDate, '2026-11-05T09:30:00.000Z');
  assert.equal(freeSociety.approvalRequired, true);
  assert.equal(freeSociety.price, 'Free');
  assert.match(freeSociety.description, /4,800.*competition awards.*200.*conditional/);
});

test('multiple public venues are displayed with their date scope instead of inventing one location', () => {
  const venues: EventVenueAddress[] = [
    { name: 'Day one venue', streetAddress: '100 Main Street', addressLocality: 'Seoul', addressCountry: 'KR', dateLabel: '7 November 2026' },
    { name: 'Day two venue', streetAddress: '200 Market Road', addressLocality: 'Seoul', addressCountry: 'KR', dateLabel: '8 November 2026' },
  ];
  const multi = { ...event, venueAddresses: venues };
  assert.deepEqual(getGoogleEventSchemaIssues(multi), ['multiple-venues']);
  assert.equal(buildGoogleEventSchema(multi, context), null);
  assert.equal(buildGoogleEventSchema({ ...multi, venueAddresses: venues.slice(0, 1) }, context), null, 'one known stop cannot stand in for an entire multi-venue program');
  const html = renderToStaticMarkup(React.createElement(EventVenueAddresses, { event: multi }));
  for (const venue of venues) {
    assert.ok(html.includes(venue.name));
    assert.ok(html.includes(formatVenueAddress(venue)));
    assert.ok(html.includes(venue.dateLabel!));
  }
  assert.equal(renderToStaticMarkup(React.createElement(EventVenueAddresses, { event: { ...multi, locationHidden: true } })), '');
  assert.ok(getGoogleEventSchemaIssues({ ...multi, venueAddresses: [...venues, { name: 'Named square', addressLocality: 'Seoul' }] }).includes('missing-detailed-address'));
});
