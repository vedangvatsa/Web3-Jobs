import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as cheerio from 'cheerio';
import { EventGuideContent } from '../src/components/event-guide-content';
import { buildEditorialFromOrganizerDescription } from '../src/lib/luma-event-content';
import { renderDescriptionInline } from '../src/lib/description-inline';
import { splitEventDescriptionBlocks } from '../src/lib/event-description-blocks';
import { descriptionFormattingIssues } from './lib/description-format-checks';
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
const html = renderToStaticMarkup(createElement(EventGuideContent, { editorial }));
const $ = cheerio.load(html);
assert.deepEqual(descriptionFormattingIssues(html), []);
assert.ok($('h2').toArray().some(el => $(el).text() === 'Schedule'));
assert.equal($('ol').attr('start'), '3');
assert.equal($('ol > li').length, 2);
assert.equal($('ol > li > ul > li').length, 2);
assert.equal($('strong').first().text(), 'project');
assert.equal($('a').first().text(), 'the guide');
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
assert.equal(schedule.filter(block => block.type === 'agenda').length, 4);
const prose = 'The morning starts with coffee at 8:30 a.m., a panel at 9:00, then networking from 9:45. Doors close at 9:00 a.m. sharp.';
assert.deepEqual(splitEventDescriptionBlocks(prose), [{ type: 'p', text: prose }]);
console.log('Event formatting regression passed: agenda, nested lists, numbering, long headings, code, emphasis and safe links.');
