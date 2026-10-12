import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import type { Job } from '../src/types';
import { extractBreezyPostingDate } from '../src/lib/breezy-posting-date';
import { hasRequiredJobDateProvenance, preserveOriginalJobDate, type JobDateHistory } from '../src/lib/job-source-date';
import { isJobAgeEligible } from '../src/lib/job-age-policy.mjs';
import { getJobIdentity } from '../src/lib/job-slugs';
import { getJobSourceIssue, REMOVED_JOB_LISTINGS } from '../src/lib/job-source-policy';
import { fetchBreezyPrimaryDate } from './lib/breezy-primary-date';
import { buildJobsListing } from '../src/lib/jobs-listing-build';
import { paginatePublicJobs } from '../src/lib/jobs-public-listing';
import { buildCompaniesFromJobs } from '../src/lib/companies';

const job: Job = { id: 'a9b77e7301f601', slug: 'marketing211', title: 'Brand Marketing Manager, Global Sponsorships', company: 'Nexo', source: 'Breezy: Nexo [nexo]', link: 'https://nexo.breezy.hr/p/a9b77e7301f601-brand-marketing-manager-global-sponsorships', date: '2026-10-09T11:48:18.204Z', dateVerified: true, active: true };
const posted = { '@type': 'JobPosting', title: job.title, hiringOrganization: { name: 'Nexo', sameAs: 'https://nexo.breezy.hr' }, url: `${job.link}?source=GoogleJobs`, datePosted: '2026-01-29', description: '<p>Source description</p>' };
const htmlFor = (value: unknown) => `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
const proof = (html: string) => ({ url: job.link, checkedAt: '2026-10-12T21:35:55.773Z', bodySha256: createHash('sha256').update(html).digest('hex') });

test('matching employer JobPosting overrides the Breezy API republish date and corrupt earliest history', () => {
  const html = htmlFor(posted);
  const verified = extractBreezyPostingDate(job, html, proof(html))!;
  assert.equal(verified.date, '2026-01-29');
  assert.equal(hasRequiredJobDateProvenance({ ...job, ...verified }), true);
  assert.equal(hasRequiredJobDateProvenance({ ...job, ...verified, link: 'https://example.com/job', dateEvidence: { ...verified.dateEvidence!, url: 'https://example.com/job' } }), false, 'A provider flag cannot validate another host');
  const history: JobDateHistory = { [getJobIdentity(job)]: { date: '2019-01-01', dateVerified: true } };
  const corrected = preserveOriginalJobDate({ ...job, ...verified }, history);
  assert.equal(corrected.date, '2026-01-29', 'An unproven API date is not an original-date anchor');
  assert.equal(isJobAgeEligible(corrected, Date.parse(proof(html).checkedAt)), false);
  const freshHtml = htmlFor({ ...posted, datePosted: '2026-10-12' });
  const republished = extractBreezyPostingDate(job, freshHtml, proof(freshHtml))!;
  assert.equal(preserveOriginalJobDate({ ...job, ...republished }, history).date, '2026-01-29', 'Once proven, original posting time cannot advance');
});

test('source identity, title, employer board, strict calendar and unambiguous date are required', () => {
  for (const posting of [
    { ...posted, url: job.link.replace(job.id, 'another-id') },
    { ...posted, title: 'Another role' },
    { ...posted, hiringOrganization: { name: 'Another company', sameAs: 'https://other.breezy.hr' } },
    { ...posted, datePosted: '2026-02-30' },
    { ...posted, datePosted: undefined },
    [posted, { ...posted, datePosted: '2026-10-12' }],
  ]) {
    const html = htmlFor(posting);
    assert.equal(extractBreezyPostingDate(job, html, proof(html)), null);
  }
  const html = htmlFor(posted);
  assert.equal(extractBreezyPostingDate({ ...job, source: 'Breezy: Nexo [unrelated-board]' }, html, proof(html)), null);
  assert.equal(extractBreezyPostingDate(job, html, { ...proof(html), url: 'https://other.breezy.hr/p/a9b77e7301f601-role' }), null);
  const displayName = htmlFor({ ...posted, hiringOrganization: { name: 'Nexo Display Name', sameAs: 'https://nexo.breezy.hr' } });
  assert.equal(extractBreezyPostingDate(job, displayName, proof(displayName))?.date, '2026-01-29', 'The exact posting and employer board establish identity without a company-alias allowlist');
});

test('missing primary evidence and failed GETs cannot recover through legacy or verified history', async () => {
  const html = htmlFor(posted);
  const verified = extractBreezyPostingDate(job, html, proof(html))!;
  const history: JobDateHistory = {};
  preserveOriginalJobDate({ ...job, ...verified }, history);
  assert.equal(preserveOriginalJobDate(job, history).dateVerified, false);
  assert.equal(preserveOriginalJobDate({ ...job, source: 'Imported' }, history).dateVerified, false);
  for (const status of [403, 404, 429, 503]) {
    const response = await fetchBreezyPrimaryDate(job, async () => new Response('', { status }));
    assert.equal(response, null);
  }
  assert.equal(await fetchBreezyPrimaryDate(job, async () => { throw new Error('timeout'); }), null);
  assert.equal(await fetchBreezyPrimaryDate(job, async () => new Response('<h1>Open role</h1>', { headers: { 'Content-Type': 'text/html' } })), null);
  const response = await fetchBreezyPrimaryDate(job, async () => new Response(html, { headers: { 'Content-Type': 'text/html' } }));
  assert.equal(response?.date, '2026-01-29');
});

test('explicitly closed primary pages retain their original date but never become active', () => {
  const html = `${htmlFor(posted)}<h1>Position Closed</h1><p>Sorry, this position is no longer accepting candidates.</p>`;
  const verified = extractBreezyPostingDate(job, html, proof(html))!;
  assert.equal(verified.date, '2026-01-29');
  assert.equal(verified.active, false);
});

test('raw active API dates cannot bypass website generators, company lists or client catalogs', () => {
  const apiOnly = { ...job, date: new Date().toISOString() };
  assert.equal(isJobAgeEligible(apiOnly), true);
  assert.deepEqual(buildJobsListing([apiOnly]), []);
  assert.deepEqual(buildCompaniesFromJobs([apiOnly], {}), []);
  assert.equal(paginatePublicJobs([apiOnly], { limit: 50, offset: 0 }).meta.total, 0);
});

test('recorded audit corrections and application exclusions persist outside active catalogs', () => {
  const history = JSON.parse(fs.readFileSync('content/job-date-history.json', 'utf8')) as JobDateHistory;
  assert.equal(history[getJobIdentity(job)].date, '2026-01-29');
  assert.equal(history['breezy:nexo.breezy.hr:1d398ae5f95b01'].date, '2020-09-03');
  const audit = JSON.parse(fs.readFileSync('content/job-primary-audit-integration.json', 'utf8')) as { linkExclusions: Array<{ identity: string; slug: string; reason: string; atsState: string }> };
  const cache = JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8')) as Job[];
  for (const exclusion of audit.linkExclusions) {
    const policy = REMOVED_JOB_LISTINGS[exclusion.identity];
    assert.equal(getJobSourceIssue({ link: policy.link }), exclusion.reason);
    assert.equal(cache.some(job => getJobIdentity(job) === exclusion.identity), false);
    if (exclusion.atsState === 'active') {
      assert.equal(policy.applicationState, 'unavailable');
      assert.equal(policy.reason, 'application-not-found');
    }
  }
  for (const current of cache) assert.equal(hasRequiredJobDateProvenance(current), true);
});
