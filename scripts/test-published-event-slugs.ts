import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assignStableEventSlugs, type EventSlugHistory } from '../src/lib/event-slug-assignment';
import { buildEventSlugIndex } from '../src/lib/event-slug-index';
import type { Web3Event } from '../src/lib/events';
import { loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { assignJobSlugsAndSyncLegacyArchive } from '../src/lib/job-slugs';

const event = (id: string, slug: string, name = id): Web3Event => ({ id, slug, name, startDate: '2027-01-01', description: 'Verified description', location: 'Singapore', url: 'https://example.com', coverImage: null });
const history: EventSlugHistory = {
  conference: { slug: 'kbw', aliases: ['old_conference'] },
  afterdark: { slug: 'best-event2' },
  peak: { slug: 'best-event3' },
  retired: { slug: 'retired-event' },
};
const input = [event('new-party', 'kbw'), event('peak', 'best-event2'), event('conference', 'kbw'), event('afterdark', 'best-event2'), event('new', 'retired-event')];
const a = assignStableEventSlugs(input, new Set(['jobs']), history);
const b = assignStableEventSlugs([...input].reverse(), new Set(['jobs']), history);
assert.deepEqual(Object.fromEntries(a.map(e => [e.id, e.slug])), Object.fromEntries(b.map(e => [e.id, e.slug])));
const index = buildEventSlugIndex(a);
assert.equal(index.get('kbw')?.id, 'conference');
assert.equal(index.get('old_conference')?.id, 'conference');
assert.equal(index.get('best-event2')?.id, 'afterdark');
assert.equal(index.get('best-event3')?.id, 'peak');
assert.equal(index.has('retired-event'), false, 'Never reuse an expired event URL for another event');
assert.throws(() => assignStableEventSlugs(input, new Set(['kbw']), history), /collides/);
const live = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
const published = JSON.parse(fs.readFileSync('content/event-slug-history.json', 'utf8')) as EventSlugHistory;
const regenerated = assignStableEventSlugs([...live].reverse(), new Set(), published);
assert.deepEqual(Object.fromEntries(regenerated.map(e => [e.id, e.slug])), Object.fromEntries(live.map(e => [e.id, e.slug])));
const reserved = loadReservedRootSlugsSync();
assert.ok(reserved.has('ps3'), 'Published event /ps3 must be reserved before job minting');
const jobs = JSON.parse(fs.readFileSync('content/jobs-runtime.json', 'utf8')) as Array<{ slug: string }>;
assert.ok(jobs.every(job => !reserved.has(job.slug)), 'No active job occupies a reserved content URL');
const jobFixture = [
  { id: 'existing', title: 'Product Manager', company: 'Example', link: 'https://example.com/existing', slug: 'pm2' },
  { id: 'new', title: 'Product Manager', company: 'Example', link: 'https://example.com/new', slug: '' },
];
assignJobSlugsAndSyncLegacyArchive(jobFixture, {}, new Set(), new Set(['pm', 'pm2']));
assert.equal(jobFixture[0].slug, 'pm2', 'Keep the current owner of a published URL');
assert.equal(jobFixture[1].slug, 'pm3', 'Do not recycle historical share URLs for a new job');
console.log(`Published event URLs passed: ${live.length} stable canonical URLs, reordered input, late arrivals, retired URLs, underscore aliases, /ps3 reservation.`);
