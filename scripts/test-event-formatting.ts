import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as cheerio from 'cheerio';
import { EventGuideContent } from '../src/components/event-guide-content';
import { buildEditorialFromOrganizerDescription } from '../src/lib/luma-event-content';
import { renderDescriptionInline, renderEventBodyInline } from '../src/lib/description-inline';
import { polishEventDescriptionLinks } from '../src/lib/event-description-links';
import { splitEventDescriptionBlocks } from '../src/lib/event-description-blocks';
import { descriptionFormattingIssues, textJunkRunIssues } from './lib/description-format-checks';
import type { Web3Event } from '../src/lib/events';

const description = '# About the event\nA workshop for developers.\n## Schedule\n09:00 - 10:00 Check-in\nSpeaker:\nSam Smith\n' +
  'Time: 3:30pm - Registration | 4:00pm - 6:00pm Conversations followed by reception ending at 8:00pm\n' +
  '## Registration\n3. Submit the form\n  - Include your **project**\n  - Include your portfolio\n4. Bring confirmation\n' +
  'Read [the guide](https://example.com/guide) and bring `node` installed.\n' +
  `## ${'This is a long source paragraph, not a giant heading. '.repeat(5)}\n` +
  '```js\nconst value = "<div>";\n  return value;\n```';
const event: Web3Event = { id: 'formatting-example', name: 'Developer workshop', startDate: '2027-01-01',
  location: 'London', url: 'https://example.com/event', coverImage: null, description };
const editorial = buildEditorialFromOrganizerDescription(event);
const html = renderToStaticMarkup(createElement(EventGuideContent, { editorial, contentMarker: 'grant' }));
const $ = cheerio.load(html);
assert.deepEqual(descriptionFormattingIssues(html), []);
assert.ok($('h2').toArray().some(el => $(el).text() === 'Schedule'));
assert.equal($('ol').attr('start'), '3');
assert.equal($('ol > li').length, 2);
assert.equal($('ol > li > ul > li').length, 2);
assert.equal($('strong').first().text(), 'project');
assert.ok($.text().includes('the guide'), 'organizer copy keeps link labels without outbound URLs');
assert.equal($('a[href^="http"]').length, 0, 'editorial renderer does not emit outbound anchors');
assert.equal($('pre code').text(), 'const value = "<div>";\n  return value;');
assert.ok($('p').toArray().some(el => $(el).text().startsWith('4:00pm')));
assert.ok(!$('h2,h3').toArray().some(el => /Speaker|Sam Smith/.test($(el).text())));

const linked = renderToStaticMarkup(createElement('p', null, renderDescriptionInline(
  'Visit https://example.com/path_(one)). Or [**the guide**](https://example.com/guide). <img src=x onerror=alert(1)>')));
const links = cheerio.load(linked);
assert.equal(links('a').first().attr('href'), 'https://example.com/path_(one)');
assert.equal(links('a strong').text(), 'the guide');
assert.equal(links('img').length, 0);
assert.ok(links('p').text().includes(')). Or'));
const schedule = splitEventDescriptionBlocks('Day 1, Wednesday 16 September 11:30 AM Doors open 12:00 to 12:20 PM Kickoff and standup 12:20 to 3:30 PM Focused work 3:30 PM onwards Mentor walk ins');
assert.equal(schedule.filter(block => block.type === 'agenda').length, 6);
const prose = 'The morning starts with coffee at 8:30 a.m., a panel at 9:00, then networking from 9:45. Doors close at 9:00 a.m. sharp.';
assert.deepEqual(splitEventDescriptionBlocks(prose), [{ type: 'p', text: prose }]);
const studyGroup = 'The gathering has a Bitcoin study group from 13:30 to 15:00, followed by a cypherpunk discussion from 16:00 to 17:30. Everyone is welcome.';
assert.deepEqual(splitEventDescriptionBlocks(studyGroup), [{ type: 'p', text: studyGroup }], 'time ranges inside prose must not split it into agenda fragments');
const proseEvent = { ...event, description: studyGroup };
const proseHtml = renderToStaticMarkup(createElement(EventGuideContent, { editorial: buildEditorialFromOrganizerDescription(proseEvent) }));
assert.equal(cheerio.load(proseHtml)('p').text(), studyGroup, 'rendered prose retains spaces before inline times');

// Catalog junk detectors: hard kinds (chopped-sentence, stat-line) must fire on
// real scrape damage and stay silent on legitimate formatting styles.
const chopped = textJunkRunIssues('Hello, the\nWhitepaper Reading Club\nis collaborating with\nZypherpurr Society.\nBring questions.');
assert.ok(chopped.some(issue => issue.kind === 'chopped-sentence'), 'chopped sentence fragments hard-fail');
const statLeak = textJunkRunIssues('Great conference.\n1200\nAttendees joined us.');
assert.ok(statLeak.some(issue => issue.kind === 'stat-line'), 'a surviving stat fragment hard-fails');
const legitimate = [
  'Registration is open.\nDoors close at 9. Refreshments provided.',
  '## Agenda\n09:00 - 10:00 Check-in\n10:00 Keynote\nTime: 3:30pm - Registration\nSpeakers: announced soon\n',
  'No panels\nNo presentations\nNo pitches. Just building together.',
  'Date – Monday, November 16, 2026\nTime - 7:30-10pm\nVenue - FRAMELESS',
  'Unit No. 6, INS Towers\nNear Trident Hotel, G Block\nBandra Kurla Complex, Mumbai',
  '主辦：環球數字資本孵化器\n時間：14:00–20:00\n地點：香港尖沙咀',
  '🥇 1st Place: $300\n🥈 2nd Place: $200\nRegister now.',
];
for (const text of legitimate) {
  const hard = textJunkRunIssues(text).filter(issue => issue.kind !== 'junk-run');
  assert.deepEqual(hard, [], `legitimate formatting must not hard-fail: ${text.slice(0, 40)}`);
}

import {
  bulletizeShortFeatureRuns,
  cleanupEventDescriptionFormat,
  rebreakCollapsedEventParagraphs,
  stripLumaExportChrome,
} from '../src/lib/event-description-cleanup';
const collapsed =
  "Toronto week wraps the industry. TUESDAY, NOVEMBER 24 DIGITAL ASSET SUMMIT TORONTO 9:00 AM - 5:00 PM - Toronto A full day of panels. TUESDAY EVENING - VIP DINNER An exclusive reception.";
const rebroken = rebreakCollapsedEventParagraphs(collapsed);
assert.ok(rebroken.includes('TUESDAY, NOVEMBER 24'), 'weekday section break');
assert.ok(rebroken.includes('DIGITAL ASSET SUMMIT'), 'session title break');
assert.ok(!/^\s*-\s+Toronto/m.test(rebroken), 'no orphan dash-city line');

const lumaList =
  'Intro paragraph.\n\nWhat to expect\n- Welcome drinks on arrival\n- Cocktail hour, followed by wine\n- Cigar room\n\nThe venue\n\nLa Cava sits beneath the Rosewood.';
const listPreserved = cleanupEventDescriptionFormat(lumaList);
assert.match(listPreserved, /- Welcome drinks on arrival/, 'markdown bullets must survive cleanup on long Luma copy');
assert.doesNotMatch(listPreserved, /models,nSure/i);
const listEvent: Web3Event = {
  ...event,
  id: 'luma-bullets',
  description:
    `${lumaList}\n\nInstead of static rules or shared pooled models,nSureAI builds a dedicated model.\n\n` +
    'LinkedIn (https://example.com/in/co) | Website (https://example.com)',
};
const listHtml = renderToStaticMarkup(
  createElement(EventGuideContent, { editorial: buildEditorialFromOrganizerDescription(listEvent) }),
);
const listPage = cheerio.load(listHtml);
assert.ok(listPage('ul li').length >= 3, 'What to expect bullets render as a list');
assert.equal(listPage('a[href^="http"]').length, 0, 'event body must not render outbound hyperlinks');
assert.match(
  polishEventDescriptionLinks('LinkedIn (https://example.com/in/co) | Website (https://example.com)'),
  /LinkedIn · Website/,
);
assert.doesNotMatch(
  polishEventDescriptionLinks('Tria (https://x.com/useTria)'),
  /https?:\/\//,
);

const chrome =
  'Title · LumaSkip to Content\n\nHosted By\n\nAlice\n\nAbout Event\n\nReal copy paragraph one.\n\nReal copy paragraph two.\n\nLocation\n\nHidden address';
assert.ok(!stripLumaExportChrome(chrome).includes('LumaSkip'), 'Luma chrome stripped');
assert.match(stripLumaExportChrome(chrome), /Real copy paragraph one/);

const amenity = bulletizeShortFeatureRuns(
  'Venue and Facilities\n\nFour indoor pickleball courts\nTwo outdoor pickleball courts\nThree beach volleyball courts',
);
assert.match(amenity, /- Four indoor pickleball courts/);

const plainPartners = renderToStaticMarkup(createElement('p', null, renderEventBodyInline(
  'Co-hosts: Tria (https://x.com/useTria) · InstaSwap (https://x.com/InstaSwap_io)',
)));
assert.ok(!plainPartners.includes('http'), 'event inline renderer drops URLs');
assert.match(plainPartners, /Tria/);

console.log('Event formatting regression passed: agenda, nested lists, numbering, long headings, code, emphasis and safe links.');
