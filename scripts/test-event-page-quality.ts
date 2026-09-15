import assert from 'node:assert/strict';
import type { Web3Event } from '../src/types';
import {
  isDisplayableEventFact,
  isThinEventListingDescription,
  sanitizeEventEditorial,
} from '../src/lib/event-editorial-facts';

const cryptoBlo: Web3Event = {
  id: 'luma-crypto-PJA3o7ucniYAKBP',
  slug: 'crypto-blo',
  name: 'Crypto And Blockchain.',
  description: 'Crypto And Blockchain. - Web3 community event in New Delhi, India.',
  startDate: '2026-09-19T10:30:00.000Z',
  endDate: '2026-09-19T14:30:00.000Z',
  city: 'New Delhi',
  country: 'India',
  location: 'Tim Hortons, New Delhi',
  url: 'https://luma.com/of9hwrqv',
  source: 'luma-crypto',
};

const kbwSide: Web3Event = {
  id: 'kbw-official-hcds',
  slug: 'hcds',
  name: 'Hyperliquid Community Dinner Seoul',
  description:
    'Hyperliquid Community Dinner Seoul is listed in the official Korea Blockchain Week 2026 side-event calendar.',
  startDate: '2026-09-29T10:00:00+09:00',
  city: 'Seoul',
  country: 'South Korea',
  location: 'Seoul',
  url: 'https://luma.com/example',
  source: 'kbw-official',
};

assert.equal(isThinEventListingDescription(cryptoBlo.description!), true);
assert.equal(isThinEventListingDescription(kbwSide.description!), true);
assert.equal(isDisplayableEventFact('See the official registration page'), false);
assert.equal(isDisplayableEventFact('$550 General Admission'), true);
assert.equal(isDisplayableEventFact('GA $108 / GA+ $207'), true);

const sanitized = sanitizeEventEditorial({
  summaryLead: 'Lead',
  sections: [],
  ticketPricing: 'Institutional pricing tiers; check official site',
  expectedAttendance: '10,000+ attendees',
});
assert.equal(sanitized.ticketPricing, undefined);
assert.equal(sanitized.expectedAttendance, '10,000+ attendees');

console.log('Event page quality tests passed.');
