import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware';
import type { Job } from '../src/types';
import { getJobIdentity } from '../src/lib/job-slugs';
import { getJobSourceIssue, REMOVED_JOB_LISTINGS } from '../src/lib/job-source-policy';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { isRemovedJobPath } from '../src/lib/removed-job-path';
import { resolveJobLocation, isRemoteJob } from '../src/lib/job-location';
import { resolveJobSlug } from '../src/lib/job-guides';

async function main() {
  const cache = JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8')) as Job[];
  const runtime = JSON.parse(fs.readFileSync('content/jobs-runtime.json', 'utf8')) as Job[];
  const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
  for (const job of [...cache, ...runtime]) assert.equal(getJobSourceIssue(job), undefined, `Removed role in catalog: ${job.slug}`);
  assert.equal(isConcreteJobOpening('Explore Invity Open Roles', 'https://example.com/jobs/new-directory-id'), false);
  assert.equal(isConcreteJobOpening('Open Source Software Engineer', 'https://example.com/jobs/engineer'), true);
  for (const record of Object.values(REMOVED_JOB_LISTINGS)) {
    assert.ok(getJobSourceIssue({ link: record.link }));
    assert.ok(getJobSourceIssue({ applyUrl: `${record.link}${record.link.includes('?') ? '&' : '?'}utm_source=test` }));
    assert.equal(isConcreteJobOpening('Software Engineer', record.link), false, 'Retitling must not bypass source removal');
    for (const slug of record.blockedSlugs || [record.slug]) {
      assert.equal(isRemovedJobPath(`/${slug}`), true);
      assert.ok(!sitemap.includes(`https://hashtagweb3.com/${slug}</loc>`), `Removed URL in sitemap: ${slug}`);
      assert.ok(!runtime.some(job => job.slug === slug), `Removed slug reassigned: ${slug}`);
      assert.equal(fs.existsSync(`public/preview/${slug}.html`), false, `Removed job still has a preview file: ${slug}`);
    }
  }
  for (const slug of ['eio', 'marketing220']) {
    assert.equal((await resolveJobSlug(slug)).job, null, `${slug} reconstructed from archive`);
    for (const path of [`/${slug}`, `/${slug}?amp&amp`, `/${slug}/tg`, `/jobs/${slug}`, `/preview/${slug}.html`]) {
      for (const ua of ['Mozilla/5.0', 'YandexBot', 'TelegramBot']) {
        const response = await middleware(new NextRequest(`https://hashtagweb3.com${path}`, { headers: { 'User-Agent': ua } }));
        assert.equal(response.status, 410, `${path}: ${ua}`);
        assert.equal(response.headers.get('x-robots-tag'), 'noindex');
      }
    }
  }
  assert.equal(isRemovedJobPath('/%65io'), true);
  for (const path of ['/nomad', '/nomads', '/eio-unrelated', '/digital-nomad-visas', '/visas']) assert.equal(isRemovedJobPath(path), false);
  assert.equal(isRemovedJobPath('/product578'), false, 'The original Bybit alias must survive removal of the unrelated listing that reused it');
  assert.equal((await resolveJobSlug('product578')).job?.link, 'https://job-boards.eu.greenhouse.io/bybit/jobs/4944488101');
  const recovered = await middleware(new NextRequest('https://hashtagweb3.com/product578/tg?from=saved', { headers: { 'User-Agent': 'Mozilla/5.0', 'Sec-Fetch-Mode': 'navigate' } }));
  assert.equal(recovered.status, 308);
  assert.equal(recovered.headers.get('location'), 'https://hashtagweb3.com/product413/tg?from=saved');
  const source = (location: string, title = 'Software Engineer') => ({ location, title });
  assert.equal(resolveJobLocation({ ...source('Hungary', 'IT Department Lead - Remote, Worldwide'), isRemote: true }), 'Remote (Worldwide)');
  assert.equal(resolveJobLocation({ ...source('United States'), isRemote: true }), 'Remote (United States)');
  assert.equal(resolveJobLocation({ ...source('London'), workplaceType: 'hybrid' }), 'Hybrid (London)');
  assert.equal(resolveJobLocation({ ...source('London'), workplaceType: 'OnSite' }), 'London');
  assert.equal(resolveJobLocation(source('London', 'Remote Sensing Engineer')), 'London');
  assert.equal(resolveJobLocation({ title: 'Software Engineer' }), 'Not specified');
  assert.equal(resolveJobLocation({ ...source('Braiins'), company: 'Braiins', isRemote: true }), 'Remote');
  assert.equal(isRemoteJob({ ...source('Hungary'), isRemote: true }), true);
  assert.equal(isRemoteJob({ title: 'Software Engineer' }), false);
  assert.equal(isRemoteJob({ ...source('Hybrid (London)'), workplaceType: 'Hybrid' }), false);
  const remoteExample = runtime.find(job => job.slug === 'it3');
  if (remoteExample) assert.equal(remoteExample.location, 'Remote (Worldwide)');
  for (const job of runtime) assert.equal(resolveJobLocation(job), job.location, `Unnormalized work arrangement: ${job.slug}`);
  if (process.argv.includes('--compare-head')) {
    const before = JSON.parse(execFileSync('git', ['show', 'HEAD:content/jobs-cache.json'], { maxBuffer: 128 * 1024 * 1024 }).toString()) as Job[];
    const after = new Map(cache.map(job => [getJobIdentity(job), job]));
    for (const job of before) {
      if (getJobSourceIssue(job)) { assert.equal(after.has(getJobIdentity(job)), false); continue; }
      const current = after.get(getJobIdentity(job)); assert.ok(current, `Unrelated role removed: ${job.slug}`);
      const omitLocation = ({ location, isRemote, workplaceType, ...rest }: Job) => rest;
      assert.deepEqual(omitLocation(current), omitLocation(job), `Unrelated identity/content changed: ${job.slug}`);
    }
  }
  console.log(`Job cleanup passed: ${Object.keys(REMOVED_JOB_LISTINGS).length} excluded source identities, ${runtime.length} active listings, archive suppression, 410 responses and remote/region handling.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
