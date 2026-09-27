import assert from 'node:assert/strict';
import { test } from 'node:test';
import { officialSchedule, registrationUrl, urlIdentity, type DiscoveryEvent } from './lib/token2049-discovery';
import { existingMatch, usefulDescription } from './sync-token2049-events';
import { lumaSourcePatch } from './luma-source-record';
import { isEventUpcoming, type Web3Event } from '../src/lib/events';

test('source URLs keep external destinations and event-identifying query parameters', () => {
  assert.equal(registrationUrl('coinferencex.com/singapore'), 'https://coinferencex.com/singapore');
  assert.equal(registrationUrl('https://lu.ma/Example?utm_source=calendar'), 'https://luma.com/Example');
  assert.equal(urlIdentity('https://example.com/Event?id=A&utm_source=x'), 'example.com/Event?id=A');
  assert.equal(registrationUrl('Invite Only'), '');
  assert.equal(registrationUrl('http://127.0.0.1/private'), '');
  assert.equal(registrationUrl('javascript:alert(1)'), '');
});

test('official Singapore clocks preserve date ranges and overnight ends', () => {
  assert.deepEqual(officialSchedule('2026-10-09T00:00:00Z', '19:00', '06:00'), {
    startDate: '2026-10-09T19:00:00+08:00', endDate: '2026-10-09T22:00:00.000Z',
  });
  assert.deepEqual(officialSchedule('2026-10-06', '12:00', '23:59', '2026-10-07T23:59:00+08:00'), {
    startDate: '2026-10-06T12:00:00+08:00', endDate: '2026-10-07T23:59:00+08:00',
  });
});

test('page filters keep date-only events visible until their local final day ends', () => {
  const event = { startDate: '2026-09-28', timezone: 'Asia/Singapore' };
  assert.equal(isEventUpcoming(event, new Date('2026-09-28T12:00:00+08:00')), true);
  assert.equal(isEventUpcoming(event, new Date('2026-09-29T00:00:00+08:00')), false);
});

test('different dates and non-Latin names are not merged just because titles look generic', () => {
  const event: Web3Event = { id: 'existing', name: '资本晚宴', description: '', startDate: '2026-10-07T10:00:00Z', location: 'Singapore', url: 'https://luma.com/first', coverImage: null };
  const candidate: DiscoveryEvent = { source: 'test', id: 'other', name: '科技晚宴', url: 'https://luma.com/second', startDate: event.startDate, authoritativeSchedule: false };
  assert.equal(existingMatch([candidate], [event]), undefined);
  assert.equal(existingMatch([{ ...candidate, name: event.name, startDate: '2026-10-08T10:00:00Z' }], [event]), undefined);
  assert.equal(existingMatch([{ ...candidate, url: event.url }], [event]), event);
});

test('description extraction keeps programme facts and removes promotional or company-profile copy', () => {
  const text = 'Join us for an unforgettable evening.\nThe panel covers custody and settlement for institutional participants.\n## About the host\nOur dinner company is the leading global ecosystem.\n## Agenda\n14:00 | Workshop on wallet permissions';
  assert.equal(usefulDescription(text), 'The panel covers custody and settlement for institutional participants.\n\n14:00 | Workshop on wallet permissions');
});

test('daily main-conference listings resolve to the existing TOKEN2049 page', () => {
  const main: Web3Event = { id: 'main', slug: 'token2049', name: 'TOKEN2049 Singapore 2026', description: '', startDate: '2026-10-07', endDate: '2026-10-08', location: 'Singapore', url: 'https://token2049.com/singapore', coverImage: null };
  const entry: DiscoveryEvent = { source: 'test', id: 'day-one', name: 'TOKEN2049 Singapore - Day 1', url: 'https://luma.com/tk5qevxk', startDate: '2026-10-06T23:30:00Z', authoritativeSchedule: false };
  assert.equal(existingMatch([entry], [main]), main);
  assert.equal(existingMatch([{ ...entry, name: 'TOKEN2049 Singapore - Day 2', startDate: '2026-10-08T09:00:00+08:00' }], [main]), main);
  assert.equal(existingMatch([{ ...entry, name: 'TOKEN2049 Singapore - Day 1 Afterparty' }], [main]), undefined);
  assert.equal(existingMatch([{ ...entry, startDate: '2027-10-07' }], [main]), undefined);
});

test('verification respects hidden venues and cancelled status', () => {
  const patch = lumaSourcePatch({ url: 'https://luma.com/test', fetchedAt: '2026-09-27T00:00:00Z', method: 'luma-api', data: {
    event: { api_id: 'evt-test', name: 'Private dinner', start_at: '2026-10-07T10:00:00Z', cancelled_at: '2026-09-27T00:00:00Z', location_type: 'offline', geo_address_visibility: 'guests-only', geo_address_info: { country: 'Singapore', city: 'Singapore', full_address: 'Hidden residence', address: 'Hidden venue' }, coordinate: { latitude: 1, longitude: 103 } },
    description: 'A dinner for founders and investors.',
  } });
  assert.equal(patch.eventStatus, 'EventCancelled');
  assert.equal(patch.locationHidden, true);
  assert.equal(patch.venueName, undefined);
  assert.equal(patch.streetAddress, undefined);
  assert.equal(patch.coordinates, undefined);
});
