import assert from 'node:assert/strict';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { buildEditorialFromOrganizerDescription, isLumaListedEvent } from '../src/lib/luma-event-content';
import { splitEventDescriptionBlocks } from '../src/lib/event-description-blocks';
import { resolveEventGuide } from '../src/lib/event-guide-store';
import { isThinEventListingDescription } from '../src/lib/event-editorial-facts';
import { normalizeLumaDescriptionForStorage, proseMirrorToFormattedText } from './luma-page-description';
import type { Web3Event } from '../src/lib/events';
import { formatEventDate, getEventDatePill } from '../src/lib/events';
import { lumaSourcePatch } from './luma-source-record';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';

const example: Web3Event = {
  id: 'description-test', name: 'Description test', startDate: '2027-01-01',
  location: 'Seoul', url: 'https://luma.com/description-test', coverImage: null,
  description: 'About the event:\nOpening paragraph.\nSecond paragraph.\nSchedule:\n10:00 Welcome\nSpeaker:\nSam\n## Registration\n3. Fill in the form\n4. Bring confirmation\nAbout the event\nClosing paragraph.',
};

async function main() {
  assert.deepEqual(splitEventDescriptionBlocks('•First\n•Second'), [{ type: 'ul', items: ['First', 'Second'] }]);
  assert.deepEqual(splitEventDescriptionBlocks('1.First\n2.Second'), [{ type: 'ol', items: [{ number: 1, text: 'First' }, { number: 2, text: 'Second' }] }]);
  assert.deepEqual(splitEventDescriptionBlocks('**Hosts**'), [{ type: 'p', text: '**Hosts**' }]);
  assert.deepEqual(splitEventDescriptionBlocks('1.5 million'), [{ type: 'p', text: '1.5 million' }]);
  assert.equal(formatEventDate('2027-01-01T01:00:00Z', undefined, 'America/Los_Angeles'), 'Dec 31, 2026');
  assert.equal(getEventDatePill('2027-01-01T01:00:00Z', 'America/Los_Angeles').day, '31');
  assert.equal(formatEventDate('2027-01-01', undefined, 'America/Los_Angeles'), 'Jan 1, 2027');
  const privateAddress = lumaSourcePatch({
    url: example.url, fetchedAt: '2026-09-20T00:00:00Z', method: 'luma-page',
    data: {
      event: { api_id: 'evt-test', name: 'Source title', start_at: '2027-01-01T09:00:00Z', location_type: 'offline',
        geo_address_visibility: 'guests-only', geo_address_info: { mode: 'obfuscated', city: 'Seoul', country: 'South Korea', full_address: 'Must not publish this' }, coordinate: { latitude: 37, longitude: 127 } },
      ticket_info: { is_free: true, require_approval: true },
      description_mirror: { type: 'doc', content: [{ type: 'paragraph', content: [{ text: 'Verified source copy.' }] }] },
    },
  });
  assert.equal(privateAddress.name, 'Source title');
  assert.equal(privateAddress.description, 'Verified source copy.');
  assert.equal(privateAddress.locationHidden, true);
  assert.equal(privateAddress.streetAddress, undefined);
  assert.equal(privateAddress.coordinates, undefined);
  assert.equal(privateAddress.location, 'Seoul, South Korea');
  assert.equal(privateAddress.price, 'Free');
  assert.equal(privateAddress.approvalRequired, true);
  const longHeading: Web3Event = { ...example,
    description: '## We extend our sincere gratitude to our lead supporters and partners for making this event possible with a very long sentence that keeps going.\nDate: Tuesday.',
  };
  const longGuide = buildEditorialFromOrganizerDescription(longHeading);
  assert.ok(longGuide.sections.every((section) => section.heading.length <= 100), 'sentence-long headings must be demoted to body copy');
  assert.ok(longGuide.sections[0].content.join(' ').includes('sincere gratitude'), 'demoted heading text must be kept');

  const labels: Web3Event = { ...example,
    description: 'Intro paragraph.\nOur Mission\nMission statement here.\nFocus Areas\n- Area one\n- Area two\nTrack A\nFirst track question?\nPrizes\nTop prize details.\nWho is this for?\nBuilders.\nParticipants\nAlice\nBob',
  };
  const labelGuide = buildEditorialFromOrganizerDescription(labels);
  assert.deepEqual(labelGuide.sections.map((section) => section.heading), ['About the event', 'Our Mission', 'Focus Areas', 'Track A', 'Prizes', 'Who is this for?', 'Participants']);
  assert.deepEqual(labelGuide.sections[3].content, ['First track question?']);
  const messy: Web3Event = { ...example,
    description: '## MegaHit.ai (https://megahit.ai)\nSummit intro sentence here.\n## Schedule\n1 - Doors open\n2 - Keynotes\nRepeated paragraph that is long enough to trigger the duplication filter for this test case here.\nRepeated paragraph that is long enough to trigger the duplication filter for this test case here.\n10 - 20 attendees expected at the venue for this particular evening session.',
  };
  const messyGuide = buildEditorialFromOrganizerDescription(messy);
  const sponsor = messyGuide.sections.find((section) => section.heading === 'MegaHit.ai')!;
  assert.deepEqual(sponsor.content[0], 'https://megahit.ai', 'heading URLs move into link lines without loss');
  const schedule = messyGuide.sections.find((section) => section.heading === 'Schedule')!;
  assert.ok(schedule.content.join('\n').includes('1. Doors open'), 'dash-numbered runs become ordered lists');
  assert.ok(schedule.content.every((block) => !block.includes('Repeated paragraph') || schedule.content.indexOf(block) === schedule.content.findIndex((other) => other === block)), 'exact-duplicate paragraphs are removed');
  assert.equal(schedule.content.filter((block) => block.includes('Repeated paragraph')).length, 1);
  assert.ok(schedule.content.some((block) => block === '10 - 20 attendees expected at the venue for this particular evening session.'), 'single quantities stay body copy');

  const restated: Web3Event = { ...example,
    description: 'Intro line.\n## About Blockchain (https://blockchain.example)\nBlockchain (https://blockchain.example) is a platform for institutions worldwide with history.',
  };
  const restatedGuide = buildEditorialFromOrganizerDescription(restated);
  const aboutSection = restatedGuide.sections.find((section) => section.heading === 'About Blockchain')!;
  assert.deepEqual(aboutSection.content[0], 'https://blockchain.example');
  assert.ok(aboutSection.content.join(' ').includes('Blockchain is a platform'), 'restated heading links are not repeated');
  assert.ok(!aboutSection.content.join(' ').includes('(https://blockchain.example)'));
  const wallSentences = ['The program opens with a keynote on builder infrastructure', 'Mentors from three protocol teams will hold office hours', 'Workshops cover wallets, signing flows and account recovery', 'A panel discusses stablecoin settlement at noon', 'The venue provides food, drinks and quiet hacking space', 'Judges announce winners before the closing reception'];
  const wall: Web3Event = { ...example, description: `${wallSentences.map((sentence, k) => `Part ${k + 1}: ${sentence}.`).join(' ').repeat(6)}` };
  const wallGuide = buildEditorialFromOrganizerDescription(wall);
  assert.ok(wallGuide.sections[0].content.length > 1, 'very long paragraphs split at sentence boundaries');
  assert.ok(wallGuide.sections[0].content.every((block) => block.length <= 700));
  const editorial = buildEditorialFromOrganizerDescription(example);
  assert.deepEqual(editorial.sections.map((section) => section.heading), ['About the event', 'Schedule', 'Registration']);
  assert.deepEqual(editorial.sections[0].content, ['Opening paragraph.', 'Second paragraph.', 'Closing paragraph.']);
  assert.deepEqual(editorial.sections[1].content, ['10:00 Welcome', 'Speaker:', 'Sam']);
  assert.deepEqual(splitEventDescriptionBlocks(editorial.sections[2].content.join('\n')), [
    { type: 'ol', items: [{ number: 3, text: 'Fill in the form' }, { number: 4, text: 'Bring confirmation' }] },
  ]);
  assert.deepEqual(splitEventDescriptionBlocks('Intro\n\n- One\n\n- Two\n\n> Quote\n> Continued\n\nEnd'), [
    { type: 'p', text: 'Intro' }, { type: 'ul', items: ['One', 'Two'] },
    { type: 'quote', text: 'Quote\nContinued' }, { type: 'p', text: 'End' },
  ]);
  const richText = proseMirrorToFormattedText({ type: 'doc', content: [
    { type: 'heading', content: [{ text: 'Registration' }] },
    { type: 'ordered_list', attrs: { order: 3 }, content: [
      { type: 'list_item', content: [{ type: 'paragraph', content: [{ text: 'Form', marks: [{ type: 'link', attrs: { href: 'https://example.com/form' } }] }] }] },
      { type: 'list_item', content: [{ type: 'paragraph', content: [{ text: 'Confirmation' }] }] },
    ] },
  ] });
  assert.match(richText, /## Registration/);
  assert.match(richText, /3\. Form \(https:\/\/example.com\/form\)/);
  assert.match(richText, /4\. Confirmation/);
  assert.equal(normalizeLumaDescriptionForStorage('a'.repeat(6000)).length, 6000, 'full source descriptions must not be cut to the old 3500-character limit');

  let checked = 0;
  for (const { events, file } of EVENT_SOURCES) {
    for (const event of events) {
      if (!isLumaListedEvent(event) || !getVerifiedEventDescription(event)) continue;
      const expected = buildEditorialFromOrganizerDescription(event);
      const resolved = await resolveEventGuide(event);
      assert.deepEqual(resolved.sections, expected.sections, `${file}:${event.id} must show the stored organizer description`);
      assert.ok(expected.sections.length, `${event.id} lost its content`);
      const headings = expected.sections.map((section) => section.heading.toLowerCase());
      assert.equal(new Set(headings).size, headings.length, `${event.id} has duplicate headings`);
      checked++;
    }
  }
  console.log(`Event description tests passed; ${checked} stored Luma descriptions resolve to organizer copy.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
