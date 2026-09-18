import assert from 'node:assert/strict';
import type { Web3Event } from '../src/types';
import {
  isDisplayableEventFact,
  isThinEventListingDescription,
  sanitizeEventEditorial,
} from '../src/lib/event-editorial-facts';
import { buildEditorialFromOrganizerDescription } from '../src/lib/luma-event-content';

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

const lumaMultiParagraph: Web3Event = {
  id: 'luma-test-multiline',
  slug: 'luma-test-multiline',
  name: 'Sample Luma Event',
  description:
    'Opening paragraph about the event.\nSecond paragraph with more detail.\nWhat to expect\nCo-working all day\nSchedule\n11:00 AM - Brunch\n12:00 PM - Panel',
  startDate: '2026-09-19T12:00:00.000Z',
  endDate: '2026-09-19T20:00:00.000Z',
  city: 'New York',
  country: 'United States',
  location: 'New York, United States',
  url: 'https://luma.com/example',
  source: 'luma-crypto',
  price: 'Free',
};

const lumaEditorial = buildEditorialFromOrganizerDescription(lumaMultiParagraph);
assert.ok(lumaEditorial.summaryLead.length < 160, 'summary lead should be date/meta only');
assert.equal(lumaEditorial.sections.some((s) => s.heading === 'What to expect'), true);
assert.equal(lumaEditorial.sections.some((s) => s.heading === 'Schedule'), true);
assert.ok(
  lumaEditorial.sections.find((s) => s.heading === 'About the event')!.content.length >= 2,
  'intro paragraphs should land in About the event',
);

console.log('Event page quality tests passed.');
