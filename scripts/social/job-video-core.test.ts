import test from 'node:test';
import assert from 'node:assert/strict';
import {assertCapacity, assertPostingTime, captions, diverseCompanies, jobPostings, matchesSnapshot} from './job-video-core.ts';
import type {Video, Ledger} from './job-video-core.ts';
const video: Video = {slug: 'fe12', company: 'Tether', title: 'Frontend Software Engineer', facts: ['100% Remote'], mode: 'catalog-source', videoUrl: 'https://example.com/job.mp4', bytes: 100, descriptionHash: null, snapshot: {slug: 'fe12', id: '1', company: 'Tether', title: 'Frontend Software Engineer (100% Remote)', link: 'https://careers.tether.io/job', location: 'Lahore'}};
test('approved captions use the bare domain, relevant tags and no colons', () => {
  const result = captions(video);
  for (const text of [result.instagram, result.tiktok, result.youtube]) {
    assert.match(text, /Find the role on hashtagweb3\.com/);
    assert.doesNotMatch(text, /https?:|hashtagweb3\.com\/|:/);
    assert.doesNotMatch(text, /worldwide|Lahore|local AI/i);
  }
  assert.equal(result.instagram, 'Frontend Software Engineer at Tether\n\n100% Remote\n\nFind the role on hashtagweb3.com\n\n#Web3Jobs #TechJobs #RemoteJobs');
  assert.equal(result.youtubeTitle, 'Frontend Software Engineer at Tether · 100% Remote');
});
test('captions retain real location/pay without adding remote claims or sales filler', () => {
  const result = captions({...video, slug: 'design', title: 'Principal Brand Designer', facts: ['New York, NY (HQ)', '$100k – $130k/yr']});
  assert.match(result.instagram, /^Principal Brand Designer at Tether/);
  assert.match(result.instagram, /New York, NY \(HQ\) · \$100k - \$130k\/yr/);
  assert.match(result.instagram, /#DesignJobs/);
  assert.doesNotMatch(result.instagram, /Remote|MarketingJobs|unlock|opportunity|don.t miss|[—–…“”‘’]/i);
  assert.ok(captions({...video, title: 'Long title '.repeat(40)}).youtubeTitle.length <= 100);
});
test('automatic selection prefers two employers without excluding fallback videos', () => {
  const videos = [video, {...video, slug: 'second'}, {...video, slug: 'third', company: 'Stripe'}];
  assert.deepEqual(diverseCompanies(videos).map(v => v.slug), ['fe12', 'third', 'second']);
});
test('caps two videos per slot and six per UTC day even on manual retries', () => {
  const ledger: Ledger = {version: 1, slots: {'2026-10-01:morning': ['a', 'b'], '2026-10-01:afternoon': ['c', 'd'], '2026-10-01:evening': ['e', 'f']}, jobs: {}};
  assert.throws(() => assertCapacity(ledger, '2026-10-01:evening', 1), /limit/);
  assert.doesNotThrow(() => assertCapacity(ledger, '2026-10-01:evening', 0));
  assert.doesNotThrow(() => assertCapacity(ledger, '2026-10-02:morning', 2));
  assert.throws(() => assertCapacity(ledger, '2026-10-02:morning', 3), /limit/);
  assert.throws(() => assertCapacity(ledger, '2026-10-02:morning', -1), /count/);
  assert.throws(() => assertCapacity(ledger, '2026-10-02:morning', NaN), /count/);
  const malformed: Ledger = {...ledger, slots: {...ledger.slots, '2026-10-01:evening': [], '2026-10-01:old': ['e', 'f']}};
  assert.throws(() => assertCapacity(malformed, '2026-10-01:evening', 1), /daily limit/);
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
