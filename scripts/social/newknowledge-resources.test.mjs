import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { assertThreadResourceFreshness, renderThread, sha256 } from './newknowledge-content.mjs';

const root = new URL('../../', import.meta.url);
const read = async name => JSON.parse(await fs.readFile(new URL(name, root), 'utf8'));
const content = await read('social-assets/knowledge-threads-month/content.json');
const calendar = await read('social-assets/knowledge-threads-month/calendar.json');
const protectedPrefix = await read('social-assets/knowledge-threads-month/assets/revision/protected-prefix.json');

test('claimed campaign dates retain exact content, calendar entries and source image bytes', async () => {
  assert.deepEqual(content.threads.filter(t => t.sequence <= 3), protectedPrefix.threads);
  assert.deepEqual(calendar.dates.filter(d => d.sequence <= 3), protectedPrefix.calendar);
  for (const [file, expected] of Object.entries(protectedPrefix.imageHashes)) {
    assert.equal(sha256(await fs.readFile(new URL(`social-assets/knowledge-threads-month/${file}`, root))), expected, file);
  }
});

test('all replacement resource links use the supported platform suffixes and concrete evidence', () => {
  const replacement = content.threads.filter(t => t.sequence > 3);
  assert.equal(replacement.length, 27);
  for (const thread of replacement) {
    assert.ok(thread.sources.every(source => /^https:\/\//.test(source.url)));
    for (const post of thread.posts) assert.ok(post.visual.items?.length, `${thread.id}/${post.number}: missing concrete visual facts`);
    for (const platform of ['x', 'threads']) {
      const posts = renderThread(thread, platform);
      for (const post of posts.filter(p => p.text.includes('hashtagweb3.com/'))) assert.ok(post.text.endsWith(platform === 'x' ? '/x' : '/th'));
    }
  }
});

test('event comparisons declare every reviewed identity, date range and material detail', () => {
  for (const thread of content.threads.filter(t => t.freshness)) {
    const date = calendar.dates.find(d => d.id === thread.id).date;
    assert.equal(thread.freshness.kind, 'events');
    assert.equal(new Set(thread.freshness.eventIds).size, thread.freshness.eventIds.length);
    for (const id of thread.freshness.eventIds) {
      const range = thread.freshness.expectedDates[id];
      assert.ok(range.startDate >= date && range.endDate >= range.startDate);
      assert.ok(thread.freshness.expectedDetails[id].name);
    }
  }
});

const event = { id: 'dated-example', startDate: '2026-11-02T23:00:00Z', endDate: '2026-11-04T10:00:00Z', timezone: 'Asia/Tokyo', visibility: 'public', approvalRequired: true, city: 'Tokyo' };
const thread = { id: 'example', freshness: { kind: 'events', eventIds: [event.id], expectedDates: { [event.id]: { startDate: '2026-11-03', endDate: '2026-11-04' } }, expectedDetails: { [event.id]: { city: 'Tokyo', approvalRequired: true, locationHidden: null } } } };
const now = Date.parse('2026-11-01T11:30:00Z');

test('event checks use local calendar dates and preserve public approval restrictions', () => {
  assert.doesNotThrow(() => assertThreadResourceFreshness(thread, [event], now));
  assert.doesNotThrow(() => assertThreadResourceFreshness({}, [], now));
});

test('an explicitly offset timestamp keeps its stated local date without a separate IANA zone', () => {
  const local = { ...event, timezone: undefined, startDate: '2026-11-28T09:00:00+11:00', endDate: '2026-11-29T18:00:00+11:00' };
  const reviewed = structuredClone(thread);
  reviewed.freshness.expectedDates[event.id] = { startDate: '2026-11-28', endDate: '2026-11-29' };
  assert.doesNotThrow(() => assertThreadResourceFreshness(reviewed, [local], now));
  assert.throws(() => assertThreadResourceFreshness(reviewed, [{ ...local, startDate: '2026-11-27T22:00:00Z' }], now), /start date changed/);
});

test('unavailable, ended, private, cancelled, moved or differently restricted events stop publication', () => {
  assert.throws(() => assertThreadResourceFreshness(thread, [], now), /no longer listed/);
  assert.throws(() => assertThreadResourceFreshness(thread, [event], Date.parse('2026-11-05T00:00:00Z')), /ended/);
  for (const patch of [
    { visibility: 'private' }, { visibility: 'unlisted' }, { publicationStatus: 'needs-review' },
    { eventStatus: 'EventCancelled' }, { eventStatus: 'EventPostponed' },
    { startDate: '2026-11-06' }, { endDate: '2026-11-07' }, { city: 'Osaka' },
    { approvalRequired: false }, { locationHidden: true }, { registrationAvailability: 'sold-out' },
  ]) assert.throws(() => assertThreadResourceFreshness(thread, [{ ...event, ...patch }], now));
});
