import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';
import type { Job } from '../src/types';
import { getAtsBoardFromUrl, atsBoardKey } from '../src/lib/ats-board-identity';
import { REJECTED_ATS_BOARDS, getAtsSourceIssue, getJobSourceIssue } from '../src/lib/job-source-policy';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { buildJobsListing } from '../src/lib/jobs-listing-build';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey, getJobIdentity, type LegacySlugRecord } from '../src/lib/job-slugs';
import { configuredAtsBoards } from './lib/ats-source-inventory';
import { ASHBY_EMPLOYER_IDENTITIES, assertReviewedAshbyEmployer, validateAshbyOrganization } from './lib/ashby-employer-verification';
import { findLiveJobForArchived, resolveJobSlug } from '../src/lib/job-guides';
import { getCompanyBySlug } from '../src/lib/companies';
import { readJobDescriptionStore } from './lib/job-description-store';
import { shouldRunStep, stepInputHash } from './lib/prebuild-manifest';
import { classifySlug } from '../src/lib/slug-classifier';

const job = (company: string, link: string, slug = 'engineer'): Job => ({ id: '42', title: 'Software Engineer', company, link, slug, source: 'Imported', active: true, date: '2026-10-01' });

async function main() {
  assert.equal(atsBoardKey('Ashby', '%57arp'), 'ashby:warp');
  assert.deepEqual(getAtsBoardFromUrl('https://boards.greenhouse.io/embed/job_app?for=beam&token=123'), { provider: 'greenhouse', board: 'beam' });
  assert.deepEqual(getAtsBoardFromUrl('https://jobs.eu.lever.co/aavelabs/42'), { provider: 'lever', board: 'aavelabs', region: 'eu' });
  assert.equal(getAtsBoardFromUrl('https://apply.workable.com/j/ABC123'), undefined);
  assert.equal(getAtsBoardFromUrl('https://jobs.ashbyhq.com.evil.invalid/warp/42'), undefined);

  const wrongWarp = job('RedStone Oracles', 'https://jobs.ashbyhq.com/%57ARP/42?utm_source=test');
  const actualSui = job('Sui Foundation', 'https://jobs.ashbyhq.com/sui%20foundation/42');
  const unrelatedSchool = job('Sui Foundation', 'https://sui.bamboohr.com/careers/42');
  assert.ok(getJobSourceIssue(wrongWarp));
  assert.ok(getJobSourceIssue({ source: 'Ashby: RedStone Oracles [WARP]', link: 'https://example.com/careers/42' }));
  assert.ok(getJobSourceIssue({ source: 'ashby:warp' }));
  assert.ok(getJobSourceIssue({ applyUrl: 'https://jobs.lever.co/mantra/42/apply' }));
  assert.equal(isConcreteJobOpening('Software Engineer', wrongWarp.link), false);
  assert.deepEqual(buildJobsListing([wrongWarp, unrelatedSchool, actualSui]).map(row => row.link), [actualSui.link]);
  assert.equal(getJobSourceIssue(job('Toku', 'https://jobs.lever.co/toku/42')), undefined);
  assert.equal(getJobSourceIssue(job('Plume Network', 'https://ats.rippling.com/plume-network/jobs/42')), undefined);
  assert.equal(getJobSourceIssue(job('Safe', 'https://apply.workable.com/safeglobal/j/42')), undefined);

  const otherEmployer = job('Another Employer', 'https://another.bamboohr.com/careers/42', 'other');
  assert.equal(findLiveJobForArchived({ ...wrongWarp, newSlug: 'other' }, [otherEmployer]), null);
  assert.equal(findLiveJobForArchived({ id: '42', company: 'Original Employer', title: 'Software Engineer', link: 'https://original.bamboohr.com/careers/42', newSlug: 'other' }, [otherEmployer]), null);
  assert.equal(findLiveJobForArchived({ ...otherEmployer, link: `${otherEmployer.link}?utm_source=old` }, [otherEmployer]), otherEmployer);

  const openStandard = ASHBY_EMPLOYER_IDENTITIES['ashby:openstandard'];
  assert.ok(openStandard.organizationId);
  validateAshbyOrganization('openstandard', 'Open Standard', { organizationId: openStandard.organizationId! });
  assert.throws(() => validateAshbyOrganization('openstandard', 'Open Standard', { organizationId: 'another-employer' }), /identity unavailable or changed/);
  assert.throws(() => assertReviewedAshbyEmployer('openstandard', 'RedStone Oracles'), /Unreviewed/);
  assert.throws(() => assertReviewedAshbyEmployer('warp', 'RedStone Oracles'), /Rejected employer/);
  assert.throws(() => assertReviewedAshbyEmployer('new-unverified-board', 'Open Standard'), /Unreviewed/);
  const policyStep = { id: 'source-policy-test', inputs: ['content/rejected-ats-boards.json'], outputs: ['content/jobs-runtime.json'], command: '' };
  assert.equal(shouldRunStep(policyStep, { version: 1, steps: { [policyStep.id]: { inputHash: 'previous-policy' } } }, true), true, 'Fast builds must apply a changed employer policy');
  assert.equal(shouldRunStep(policyStep, { version: 1, steps: { [policyStep.id]: { inputHash: stepInputHash(policyStep) } } }, true), false);

  const configured = configuredAtsBoards();
  for (const source of configured) {
    assert.equal(getAtsSourceIssue(source.provider, source.board), undefined, `${source.file}: ${source.provider}:${source.board}`);
    if (source.provider === 'ashby') assertReviewedAshbyEmployer(source.board, source.company);
  }
  const cached = JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8')) as Job[];
  for (const row of cached) assert.equal(getJobSourceIssue(row), undefined, `Rejected cache row ${row.slug}`);
  if (process.argv.includes('--compare-head')) {
    const before = JSON.parse(execFileSync('git', ['show', 'HEAD:content/jobs-cache.json'], { maxBuffer: 64 * 1024 * 1024 }).toString()) as Job[];
    const afterByIdentity = new Map(cached.map(row => [getJobIdentity(row), row]));
    const preserved = before.filter(row => !getJobSourceIssue(row));
    for (const row of preserved) assert.deepEqual(afterByIdentity.get(getJobIdentity(row)), row, `Unrelated posting changed: ${row.slug}`);
    console.log(`Repair diff passed: ${before.length - preserved.length} rejected jobs removed, all ${preserved.length} unrelated jobs and their URLs unchanged, ${cached.length - preserved.length} verified replacement jobs added.`);
  }
  if (process.argv.includes('--sources-only')) {
    console.log(`ATS source checks passed: ${configured.length} configured mappings; ${cached.length} cached jobs.`);
    return;
  }

  const runtime = JSON.parse(fs.readFileSync('content/jobs-runtime.json', 'utf8')) as Job[];
  const publicRuntime = JSON.parse(fs.readFileSync('public/data/jobs-runtime.json', 'utf8')) as Job[];
  assert.deepEqual(publicRuntime, runtime);
  for (const row of runtime) assert.equal(getJobSourceIssue(row), undefined, `Rejected runtime row ${row.slug}`);
  const liveSlugs = new Set(runtime.map(row => row.slug));
  const protectedKeys = new Set(runtime.map(getJobContentKey));
  const archive = JSON.parse(fs.readFileSync('content/legacy-slugs-archive.json', 'utf8')) as Record<string, LegacySlugRecord>;
  const store = readJobDescriptionStore();
  const sitemap = new Set((JSON.parse(fs.readFileSync('content/sitemap-routes.json', 'utf8')) as Array<{ url: string }>).map(row => new URL(row.url).pathname));
  let retired = 0;
  for (const [slug, record] of Object.entries(archive)) {
    if (!getJobSourceIssue(record)) continue;
    retired++;
    assert.equal(record.retiredReason, 'incorrect-employer-source');
    const key = getJobContentKey(record as Job);
    if (!protectedKeys.has(key)) assert.equal(store.descriptions[key], undefined, `Rejected description ${slug}`);
    if (liveSlugs.has(slug)) continue;
    if (classifySlug(slug) === 'job') assert.ok(!sitemap.has(`/${slug}`), `Withdrawn job is still in the sitemap: ${slug}`);
    assert.equal((await resolveJobSlug(slug)).kind, 'unknown', `Rejected archive resurfaced: ${slug}`);
    const file = `public/preview/${slug}.html`;
    assert.ok(fs.existsSync(file), `Missing corrected preview: ${slug}`);
    const $ = load(fs.readFileSync(file, 'utf8'));
    assert.equal($('meta[property="og:title"]').attr('content'), 'Listing removed | Hashtag Web3', `Stale preview: ${slug}`);
    assert.ok(!$('meta[property="og:image"]').attr('content')?.includes(`/og/jobs/${slug}.`), `Stale job image: ${slug}`);
  }
  assert.ok(retired > 0);
  const nextJob = job('Open Standard', 'https://example.com/new-posting', '');
  assignJobSlugsAndSyncLegacyArchive([nextJob], archive);
  assert.ok(!archive[nextJob.slug!], 'A retired URL was reassigned');
  const redstone = await getCompanyBySlug('redstone-oracles');
  assert.equal(redstone?.jobCount, 0);
  assert.equal(redstone?.website, 'https://redstone.finance');
  assert.equal((await getCompanyBySlug('rain'))?.website, 'https://www.rain.xyz');
  assert.equal((await getCompanyBySlug('ramp'))?.website, 'https://ramp.com');
  assert.ok(runtime.some(row => row.company === 'Plume Network' && row.link.includes('rippling.com')));
  assert.ok(runtime.some(row => row.company === 'Sui Foundation' && row.link.includes('ashbyhq.com')));
  assert.equal(runtime.filter(row => row.company === 'Open Standard').length, 5);
  console.log(`ATS ownership checks passed: ${Object.keys(REJECTED_ATS_BOARDS).length} rejected boards, ${configured.length} configured mappings, ${runtime.length} jobs, ${retired} retired aliases; genuine Sui, Plume, Ramp, Rain and Open Standard roles preserved.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
