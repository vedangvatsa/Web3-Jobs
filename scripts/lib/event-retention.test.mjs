import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { eventRetentionEnd } from './event-dates.mjs';
import { isEventRetentionDue, tombstoneExpiry, canImportEvent, removedEventStatus } from './event-retention.mjs';
import { retainEvents } from '../retain-events.mjs';

test('30 days starts at the actual end; date-only ends include the entire local day', () => {
  const event = { startDate: '2026-08-01T10:00:00Z', endDate: '2026-09-12T16:00:00Z' };
  const boundary = Date.parse('2026-10-12T16:00:00Z');
  assert.equal(isEventRetentionDue(event, boundary - 1), false);
  assert.equal(isEventRetentionDue(event, boundary), true);
  assert.equal(isEventRetentionDue({ ...event, endDate: '2026-10-13T16:00:00Z' }, boundary), false);
  assert.equal(eventRetentionEnd({ startDate: '2026-09-12', timezone: 'Asia/Kolkata' }), Date.parse('2026-09-12T18:30:00Z'));
  assert.equal(eventRetentionEnd({ startDate: '2026-03-08', timezone: 'America/New_York' }), Date.parse('2026-03-09T04:00:00Z'));
  for (const value of ['', 'unknown', '2026-02-30', '2026-02-30T10:00:00Z', '2026-09-12T10:00:00']) {
    assert.equal(isEventRetentionDue({ startDate: value }, boundary), false, value);
  }
  assert.equal(isEventRetentionDue({ startDate: '2026-01-01', timezone: 'Invalid/Zone' }, boundary), false);
  assert.equal(isEventRetentionDue({ startDate: '2026-01-01', eventStatus: 'EventPostponed' }, boundary), false);
  assert.equal(isEventRetentionDue({ startDate: '2027-01-01', endDate: '2026-01-01' }, boundary), false);
  assert.equal(isEventRetentionDue({ startDate: 'invalid', endDate: '2026-01-01' }, boundary), false);
});

test('tombstones last twelve calendar months, including leap-day clamping; imports stay blocked after expiry by date', () => {
  assert.equal(tombstoneExpiry(Date.parse('2024-02-29T18:15:00Z')), '2025-02-28T18:15:00.000Z');
  assert.equal(tombstoneExpiry(Date.parse('2023-03-01T00:00:00Z')), '2024-03-01T00:00:00.000Z');
  const until = '2027-10-12T00:00:00.000Z';
  const tombstones = { old: { until, slugs: ['old-event', 'old-alias'] } };
  for (const url of ['/old-event', '/old-alias', '/old-event/', '/preview/old-event.html']) {
    assert.equal(removedEventStatus(url, tombstones, Date.parse(until) - 1), 410);
    assert.equal(removedEventStatus(url, tombstones, Date.parse(until)), 404);
  }
  assert.equal(removedEventStatus('/unrelated', tombstones), null);
  assert.equal(canImportEvent({ id: 'old', startDate: '2028-01-01' }, tombstones, Date.parse('2026-10-13')), false);
  assert.equal(canImportEvent({ id: 'new-id', startDate: '2026-01-01' }, {}, Date.parse('2028-01-01')), false);
});

test('cleanup removes records, aliases, descriptions, audit copies and unused assets, preserving shared and unknown records', t => {
  fs.mkdirSync('.cache', { recursive: true });
  const root = fs.mkdtempSync(path.resolve('.cache/event-retention-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (file, data) => { fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); fs.writeFileSync(path.join(root, file), typeof data === 'string' ? data : JSON.stringify(data)); };
  const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const old = { id: 'old', slug: 'old', startDate: '2026-01-01', description: 'Delete this description', coverImage: '/events/shared.webp' };
  const live = { id: 'live', slug: 'live', startDate: '2027-01-01', coverImage: '/events/shared.webp' };
  write('content/events/sources/fixture.json', [old, live, { id: 'unknown', startDate: 'unknown', coverImage: '/events/unknown.webp' }, { id: 'contradictory', startDate: '2026-01-01' }]);
  write('content/events/sources/other.json', [{ id: 'contradictory', startDate: '2027-01-01' }]);
  write('content/event-slug-history.json', { old: { slug: 'old', aliases: ['alias'] }, live: { slug: 'live' } });
  write('content/event-tombstones.json', {});
  write('content/events/editorial/generated-event-guides.json', { old: { description: 'gone' }, live: { description: 'kept' } });
  write('content/events/verification-report.json', { records: [{ id: 'old', before: 'full copy' }, { id: 'live' }] });
  write('content/events/FIXTURE_AUDIT.md', '# Source audit\n\n| Event | Evidence |\n| --- | --- |\n| /old-event-slug | Full expired description |\n| live | Keep this evidence |\n');
  old.aliases = ['old-event-slug'];
  write('content/events/sources/fixture.json', [old, live, { id: 'unknown', startDate: 'unknown', coverImage: '/events/unknown.webp' }, { id: 'contradictory', startDate: '2026-01-01' }]);
  write('content/events/redirects.json', { 'redirect-alias': 'old' });
  write('content/nomads/cities.json', [{ slug: 'city' }]);
  write('content/event-slug-history.json', { old: { slug: 'old', aliases: ['alias', 'city'] }, live: { slug: 'live' }, canonical: { slug: 'canonical' }, duplicate: { slug: 'duplicate', canonicalId: 'canonical' } });
  write('content/events/sources/merged.json', [{ id: 'canonical', startDate: '2026-01-01', endDate: '2027-01-01' }, { id: 'duplicate', startDate: '2026-01-01' }]);
  write('public/preview/city.html', '<html>Current city page</html>');
  write('content/responsive-images.json', { '/events/unused.webp': { files: ['/responsive/unused/320.webp'] } });
  write('public/preview/.preview-manifest.json', { '/old': 'hash', '/alias': 'hash' });
  for (const slug of ['old', 'alias']) write(`public/preview/${slug}.html`, '<html>Private event copy</html>');
  write('public/preview/old.html', '<meta property="og:image" content="https://hashtagweb3.com/og/external/old.webp">');
  write('public/og/external/old.webp', 'cached poster');
  write('content/articles/shared.md', '![Shared artwork](/events/article.webp)');
  write('public/events/article.webp', 'shared article artwork');
  for (const name of ['shared', 'unknown', 'unused']) write(`public/events/${name}.webp`, 'image');
  write('public/responsive/unused/320.webp', 'variant');
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['add', '.'], { cwd: root });
  const now = Date.parse('2026-10-12T00:00:00Z');
  const preview = retainEvents({ root, now, dryRun: true });
  assert.equal(preview.removedSourceRecords, 1);
  assert.equal(read('content/events/sources/fixture.json').length, 4);
  const result = retainEvents({ root, now });
  assert.equal(result.removedSourceRecords, 1);
  assert.equal(read('content/events/sources/fixture.json').length, 3);
  assert.equal(read('content/events/sources/merged.json').length, 2, 'An old merged row follows the ongoing multi-day canonical event');
  assert.deepEqual(read('content/events/verification-report.json').records, [{ id: 'live' }]);
  assert.deepEqual(read('content/events/editorial/generated-event-guides.json'), { live: { description: 'kept' } });
  assert.deepEqual(read('content/event-tombstones.json').old.slugs, ['old', 'alias', 'old-event-slug', 'redirect-alias']);
  assert.ok(!fs.readFileSync(path.join(root, 'content/events/FIXTURE_AUDIT.md'), 'utf8').includes('Full expired description'));
  assert.deepEqual(read('content/events/redirects.json'), {});
  for (const file of ['public/preview/old.html', 'public/preview/alias.html', 'public/events/unused.webp', 'public/responsive/unused/320.webp', 'public/og/external/old.webp']) assert.equal(fs.existsSync(path.join(root, file)), false, file);
  for (const name of ['shared', 'unknown', 'article']) assert.ok(fs.existsSync(path.join(root, `public/events/${name}.webp`)));
  assert.ok(fs.existsSync(path.join(root, 'public/preview/city.html')));
  assert.equal(removedEventStatus('/city', read('content/event-tombstones.json'), now), null);
  assert.equal(retainEvents({ root, now }).changedFiles, 0);
  fs.rmSync(path.join(root, '.git'), { recursive: true });
  assert.equal(retainEvents({ root, now }).changedFiles, 0, 'App Hosting source archives work without Git metadata');
  retainEvents({ root, now: Date.parse('2027-10-12T00:00:00Z') });
  assert.equal(read('content/event-tombstones.json').old, undefined);
  assert.equal(removedEventStatus('/old', read('content/event-tombstones.json'), Date.parse('2027-10-12T00:00:00Z')), null);
});
