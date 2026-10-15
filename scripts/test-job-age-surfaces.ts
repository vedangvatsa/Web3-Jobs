import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import type { Job } from '../src/types';
import { isJobAgeEligible, MAX_JOB_AGE_DAYS } from '../src/lib/job-age-policy.mjs';
import { preserveOriginalJobDate, normalizeSourcePostingDate, type JobDateHistory } from '../src/lib/job-source-date';
import { buildJobsListing } from '../src/lib/jobs-listing-build';
import { getJobs } from '../src/lib/jobs';
import { fetchJobBySlug, fetchJobById } from '../src/lib/job-by-slug-record';
import { resolveJobSlug, findLiveJobForArchived } from '../src/lib/job-guides';
import { getCompanies, getCompanyBySlug, hasPublishedCompanyProfile } from '../src/lib/companies';
import { isExpiredJobPath } from '../src/lib/job-age-path';
import { jobAgePageCache } from '../src/lib/job-age-page-cache';
import { middleware } from '../src/middleware';
import { GET as catalog } from '../src/app/job-catalog/[...parts]/route';
import { GET as jsonFeed } from '../src/app/jobs/feed.json/route';
import { GET as rssFeed } from '../src/app/jobs/feed.xml/route';
import { GET as joraFeed } from '../src/app/jobs/jora.xml/route';
import { getJobDescriptionShardFilename, getJobDescriptionShardIndex } from '../src/lib/job-description-shards';
import { getJobContentKey, getJobIdentity } from '../src/lib/job-slugs';
import { readJobDescriptionStore } from './lib/job-description-store';
import { readValidatedJobAgeArtifacts } from './lib/job-age-build-snapshot';

test('ingestion preserves original identity dates and normalizes explicit UTC without rollover', () => {
  const history: JobDateHistory = {};
  const old: Job = { id: 'e18deeab-40ef-4a00-b627-d20fae6cb410', title: 'Marketing Lead', company: 'Harmony', link: 'https://jobs.lever.co/harmony/e18deeab-40ef-4a00-b627-d20fae6cb410', date: '2024-03-09T05:33:00.298Z', active: true, source: 'Lever: Harmony' };
  preserveOriginalJobDate(old, history);
  const refreshed = preserveOriginalJobDate({ ...old, date: new Date().toISOString() }, history);
  assert.equal(refreshed.date, old.date);
  const before = JSON.stringify(history);
  assert.equal(preserveOriginalJobDate({ ...old, date: new Date().toISOString(), dateSource: 'updated_at' }, history).date, old.date);
  assert.equal(JSON.stringify(history), before, 'An update timestamp cannot reset first publication history');
  assert.equal(isJobAgeEligible(refreshed), false);
  assert.equal(buildJobsListing([refreshed]).length, 0);
  const unrelated = preserveOriginalJobDate({ ...old, company: 'Other', link: 'https://example.com/jobs/other', date: new Date().toISOString() }, history);
  assert.equal(isJobAgeEligible(unrelated), true, 'A reused numeric/provider id cannot retire another employer');
  assert.equal(normalizeSourcePostingDate('2026-10-09 22:28:48 UTC'), '2026-10-09T22:28:48Z');
  assert.equal(normalizeSourcePostingDate('2026-02-30 22:28:48 UTC'), '');
  assert.equal(normalizeSourcePostingDate(undefined), '');
  const unknownHistory: JobDateHistory = {};
  assert.equal(isJobAgeEligible(preserveOriginalJobDate({ ...old, date: new Date().toISOString(), dateSource: 'fetchedAt' }, unknownHistory)), false);
  assert.deepEqual(unknownHistory, {}, 'Discovery time cannot seed original-date history');
  const unverified = preserveOriginalJobDate({ ...old, date: new Date().toISOString(), dateVerified: false }, unknownHistory);
  assert.equal(isJobAgeEligible(unverified), false);
  assert.deepEqual(unknownHistory, {});
  assert.equal(isJobAgeEligible(preserveOriginalJobDate({ ...old, date: '' }, unknownHistory)), false);
  const recovered = preserveOriginalJobDate({ ...old, date: new Date().toISOString(), dateVerified: true, dateSource: 'schema.org.datePosted' }, unknownHistory);
  assert.equal(isJobAgeEligible(recovered), true, 'Unknown history can recover only from an actual source date');
});

test('active artifacts contain only eligible jobs and preserve matching description keys', () => {
  const { cache, runtime } = readValidatedJobAgeArtifacts();
  if (fs.existsSync('.git')) {
    const before = JSON.parse(execFileSync('git', ['show', 'HEAD:content/jobs-cache.json'], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })) as Job[];
    const previousByIdentity = new Map(before.map(job => [getJobIdentity(job), job]));
    for (const job of cache) {
      const previous = previousByIdentity.get(getJobIdentity(job));
      if (previous) assert.equal(job.slug, previous.slug, `Stable slug changed for ${job.id}`);
    }
  }
  for (const jobs of [cache, runtime]) {
    assert.equal(jobs.some(job => job.company === 'Harmony'), false);
  }
  const keys = new Set(cache.map(getJobContentKey));
  const store = readJobDescriptionStore();
  assert.ok(Object.keys(store.descriptions).every(key => keys.has(key)), 'No removed-job description is published');
  assert.ok(Object.values(store.aliases).every(key => keys.has(key)));
  assert.equal(fs.existsSync('public/preview/marketing4.html'), false);
  assert.equal(fs.existsSync('public/og/jobs/marketing4.png'), false);
});

test('Harmony and archived pages cannot regain Apply content through aliases or crawler shells', async () => {
  assert.equal((await resolveJobSlug('marketing4')).job, null);
  for (const pathname of ['/marketing4', '/marketing4/li', '/jobs/marketing4', '/preview/marketing4.html', '/preview/jobs/marketing4.html', '/og/jobs/marketing4.png']) {
    const response = await middleware(new NextRequest(`https://hashtagweb3.com${pathname}`, { headers: { 'user-agent': 'LinkedInBot' } }));
    assert.equal(response.status, 410, pathname);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=0, s-maxage=300, must-revalidate');
    assert.doesNotMatch(await response.text(), /JobPosting|Apply now|Marketing Lead/i);
  }
  const jobs = await getJobs();
  if (jobs.length) assert.equal(findLiveJobForArchived({ title: jobs[0].title, company: jobs[0].company }, jobs), null, 'Same title/employer alone is not posting identity');
});

test('warm loaders, feeds, companies, catalog shards and crawler paths expire without a rebuild', async context => {
  const originalNow = Date.now;
  const jobs = await getJobs();
  if (!jobs.length) { context.skip('Empty catalog; no live record to advance past its expiry'); return; }
  const job = jobs[0];
  const companies = await getCompanies();
  const company = await getCompanyBySlug(companies[0].slug);
  const cacheNow = Date.now();
  assert.deepEqual(jobAgePageCache(`/${companies[0].slug.toUpperCase()}`, cacheNow), jobAgePageCache(`/${companies[0].slug}`, cacheNow), 'Case variants must share the same expiry window');
  assert.ok(company?.jobs.length);
  assert.ok(await fetchJobBySlug(job.slug!));
  assert.ok(await fetchJobById(job.id));
  try {
    const boundary = Date.parse(job.date) + MAX_JOB_AGE_DAYS * 86400000;
    Date.now = () => boundary;
    assert.ok(await fetchJobBySlug(job.slug!));
    assert.equal(isExpiredJobPath(`/${job.slug}`), false);
    Date.now = () => boundary + 1;
    assert.equal(await fetchJobBySlug(job.slug!), null);
    assert.equal(await fetchJobById(job.id), null);
    assert.equal(isExpiredJobPath(`/preview/${job.slug}.html`), true);
    Date.now = () => Math.max(...jobs.map(job => Date.parse(job.date))) + 31 * 86400000;
    assert.deepEqual(await getJobs(), []);
    assert.deepEqual(await getCompanies(), []);
    assert.equal((await getCompanyBySlug(companies[0].slug))?.jobs.length, 0);
    for (const parts of [['jobs-runtime.json'], ['companies-runtime.json'], ['job-description-shards', getJobDescriptionShardFilename(getJobDescriptionShardIndex(job))]]) {
      const response = await catalog(new Request('https://hashtagweb3.com/'), { params: Promise.resolve({ parts }) });
      assert.equal(response.headers.get('cache-control'), 'public, max-age=0, s-maxage=3600, must-revalidate');
      const data = await response.json();
      if (parts[0] === 'companies-runtime.json') {
        const overviews = await getCompanies(true);
        assert.deepEqual(Object.keys(data).sort(), overviews.map(company => company.slug).sort());
        for (const [slug, row] of Object.entries(data) as [string, { jobCount: number; jobIds: string[]; description: string }][]) {
          assert.equal(await hasPublishedCompanyProfile(slug), true, 'Only verified, published employer overviews survive without jobs');
          assert.equal(row.jobCount, 0);
          assert.deepEqual(row.jobIds, []);
          assert.ok(row.description);
        }
      } else assert.deepEqual(parts[0] === 'job-description-shards' ? data.descriptions : data, parts[0] === 'jobs-runtime.json' ? [] : {});
    }
    const sitemap = await catalog(new Request('https://hashtagweb3.com/'), { params: Promise.resolve({ parts: ['sitemap.json'] }) });
    assert.equal((await sitemap.json()).urls.some((row: { url: string }) => row.url === `https://hashtagweb3.com/${job.slug}`), false);
    for (const feed of [jsonFeed, rssFeed, joraFeed]) {
      const response = await feed();
      assert.equal(response.headers.get('cache-control'), 'public, max-age=0, s-maxage=3600, must-revalidate');
      assert.equal((await response.text()).includes(job.id), false);
    }
  } finally { Date.now = originalNow; }
});
