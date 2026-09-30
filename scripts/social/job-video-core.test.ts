import test from 'node:test';
import assert from 'node:assert/strict';
import {assertCapacity, assertPostingTime, captions, jobPostings, matchesSnapshot} from './job-video-core.ts';
import type {Video, Ledger} from './job-video-core.ts';
const video: Video = {slug: 'fe12', company: 'Tether', title: 'Frontend Software Engineer', facts: ['100% Remote'], mode: 'catalog-source', videoUrl: 'https://example.com/job.mp4', bytes: 100, descriptionHash: null, snapshot: {slug: 'fe12', id: '1', company: 'Tether', title: 'Frontend Software Engineer (100% Remote)', link: 'https://careers.tether.io/job', location: 'Lahore'}};
test('approved captions use the bare domain, relevant tags and no colons', () => {
  const result = captions(video);
  for (const text of [result.instagram, result.tiktok, result.youtube]) {
    assert.match(text, /Find the role on hashtagweb3\.com/);
    assert.doesNotMatch(text, /https?:|hashtagweb3\.com\/|:/);
    assert.match(text, /#Hiring #RemoteJobs #TechJobs/);
    assert.doesNotMatch(text, /worldwide|Lahore|local AI/i);
  }
  assert.equal(result.youtubeTitle, 'Frontend Software Engineer at Tether · 100% Remote');
});
test('caps two videos per slot and six per UTC day even on manual retries', () => {
  const ledger: Ledger = {version: 1, slots: {'2026-10-01:morning': ['a', 'b'], '2026-10-01:afternoon': ['c', 'd'], '2026-10-01:evening': ['e', 'f']}, jobs: {}};
  assert.throws(() => assertCapacity(ledger, '2026-10-01:evening', 1), /limit/);
  assert.doesNotThrow(() => assertCapacity(ledger, '2026-10-01:evening', 0));
  assert.doesNotThrow(() => assertCapacity(ledger, '2026-10-02:morning', 2));
  assert.throws(() => assertCapacity(ledger, '2026-10-02:morning', 3), /limit/);
});
test('late automatic backups do not publish; explicit manual run still requires today', () => {
  const now = new Date('2026-10-01T05:00:00Z');
  assert.throws(() => assertPostingTime('2026-10-01', 'morning', false, now), /window/);
  assert.doesNotThrow(() => assertPostingTime('2026-10-01', 'morning', true, now));
  assert.throws(() => assertPostingTime('2026-09-30', 'morning', true, now), /today/);
});
test('closed jobs, changed pay or changed employers cannot reuse old videos', () => {
  assert.equal(matchesSnapshot(video, {...video.snapshot, active: true}), true);
  for (const change of [{active: false}, {company: 'Another'}, {salary: '$100k'}, {link: 'https://other.example/job'}]) assert.equal(matchesSnapshot(video, {...video.snapshot, ...change}), false);
  assert.equal(matchesSnapshot({...video, mode: 'listing-overview-unverified-availability'}, video.snapshot), false);
});
test('reads nested JobPosting without treating generic pages as jobs', () => {
  assert.equal(jobPostings('<script type="application/ld+json">{"@graph":[{"@type":"JobPosting","title":"Engineer"}]}</script>')[0].title, 'Engineer');
  assert.deepEqual(jobPostings('<script type="application/ld+json">{"@type":"Event"}</script>'), []);
});
