import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolveEventGuide } from '../src/lib/event-guide-store';
import { getEventEditorialGuide, generateGoogleCalendarUrl, type Web3Event } from '../src/lib/events';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import { buildEditorialFromOrganizerDescription } from '../src/lib/luma-event-content';
import { getPublicEvent } from '../src/lib/event-public';
import { buildEventMetaDescription } from '../src/lib/event-editorial-facts';

const fixture: Web3Event = {
  id: 'premier-blockchain-life-2026', slug: 'kbw', name: 'Solana Breakpoint',
  startDate: '2027-01-01', location: 'London', coverImage: null,
  url: 'https://example.com/event',
  description: 'Unsupported promise about speakers, tickets, attendance, and travel.',
};

async function main() {
  const missing = await resolveEventGuide(fixture);
  assert.equal(missing.descriptionStatus, 'unavailable');
  assert.deepEqual(missing.sections, [], 'missing provenance must not trigger a generated guide');
  assert.equal(missing.ticketPricing, undefined);
  assert.equal(missing.expectedAttendance, undefined);
  assert.equal(missing.speakers, undefined);
  assert.equal(getPublicEvent(fixture).description, '');
  assert.ok(!buildEventMetaDescription(fixture, true).includes('Unsupported promise'));
  assert.deepEqual(getEventEditorialGuide(fixture), missing, 'legacy entry point must use the same source-only policy');
  const calendar = new URL(generateGoogleCalendarUrl(fixture));
  assert.ok(!calendar.searchParams.get('details')?.includes('Unsupported promise'));
  assert.equal(calendar.searchParams.get('dates'), '20270101/20270102');

  const verified: Web3Event = {
    ...fixture, description: 'A workshop on wallet recovery.',
    descriptionSource: { url: fixture.url, fetchedAt: '2026-09-20T00:00:00Z', method: 'official-meta', pageTitle: fixture.name, sha256: 'fixture' },
  };
  const shortGuide = await resolveEventGuide(verified);
  assert.equal(shortGuide.descriptionStatus, 'source-backed');
  assert.deepEqual(shortGuide.sections, [{ heading: 'About the event', content: [verified.description] }]);
  assert.equal(shortGuide.expectedAttendance, undefined, 'a famous event name must not add guessed facts');

  const events = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
  let sourced = 0;
  let unavailable = 0;
  for (const event of events) {
    const guide = await resolveEventGuide(event);
    const description = getVerifiedEventDescription(event);
    assert.deepEqual(getEventEditorialGuide(event), guide, `${event.id}: content entry points disagree`);
    if (description) {
      sourced++;
      assert.equal(guide.descriptionStatus, 'source-backed');
      assert.ok(guide.descriptionSource?.url, `${event.id}: no source link`);
      assert.deepEqual(guide.sections, buildEditorialFromOrganizerDescription({ ...event, description }).sections);
      const headings = guide.sections.map((section) => section.heading.toLowerCase().trim());
      assert.equal(new Set(headings).size, headings.length, `${event.id}: duplicate headings`);
      assert.ok(guide.sections.every((section) => section.heading.trim() && section.content.join(' ').trim()), `${event.id}: empty section`);
    } else {
      unavailable++;
      assert.equal(event.description, '', `${event.id}: unverified copy leaked into the runtime`);
      assert.equal(guide.descriptionStatus, 'unavailable');
      assert.deepEqual(guide.sections, [], `${event.id}: generated filler was added`);
    }
  }
  console.log(`All ${events.length} event pages passed: ${sourced} source-backed, ${unavailable} explicit unavailable states, zero generated/template descriptions.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
