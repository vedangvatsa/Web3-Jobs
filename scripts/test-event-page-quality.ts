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

// Verify that thin listing descriptions are elevated to rich editorial guides
async function runAudits() {
  const { resolveEventGuide } = await import('../src/lib/event-guide-store');
  const cryptoBloGuide = await resolveEventGuide(cryptoBlo);
  assert.ok(cryptoBloGuide.sections.length >= 4, 'crypto-blo should have at least 4 synthesized sections');
  const cryptoBloText = (cryptoBloGuide.summaryLead || '') + ' ' + cryptoBloGuide.sections.map(s => s.heading + ' ' + s.content.join(' ')).join(' ');
  assert.ok(cryptoBloText.length >= 600, `crypto-blo text length (${cryptoBloText.length}) should be >= 600`);

  const kbwGuide = await resolveEventGuide(kbwSide);
  assert.ok(kbwGuide.sections.length >= 4, 'kbwSide should have at least 4 synthesized sections');
  const kbwText = (kbwGuide.summaryLead || '') + ' ' + kbwGuide.sections.map(s => s.heading + ' ' + s.content.join(' ')).join(' ');
  assert.ok(kbwText.length >= 600, `kbwSide text length (${kbwText.length}) should be >= 600`);

  // Audit all events in events-runtime.json
  const { default: runtimeEvents } = await import('../content/events-runtime.json');
  let thinCount = 0;
  for (const ev of runtimeEvents as Web3Event[]) {
    const guide = await resolveEventGuide(ev);
    const text = (guide.summaryLead || '') + ' ' + (guide.sections || []).map(s => s.heading + ' ' + s.content.join(' ')).join(' ');
    if (text.length < 500) {
      thinCount++;
    }
    assert.ok(
      guide.sections && guide.sections.length >= 1,
      `Event ${ev.slug || ev.id} has no sections`,
    );
    assert.ok(
      text.length >= 600,
      `Event ${ev.slug || ev.id} has thin content (${text.length} chars)`,
    );
  }
  assert.equal(thinCount, 0, 'No event should have thin content (<500 chars)');

  console.log(`Event page quality tests passed across all ${runtimeEvents.length} events (0 thin pages).`);
}

runAudits().catch((err) => {
  console.error(err);
  process.exit(1);
});

