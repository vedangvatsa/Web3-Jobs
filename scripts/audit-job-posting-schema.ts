import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import type { Job } from '../src/types';
import { jobAgeExclusionReason } from '../src/lib/job-age-policy.mjs';
import { getJobPostingLocation } from '../src/lib/job-posting-location';
import { buildJobPostingSchema } from '../src/lib/job-posting-schema';
import { isGenericJobTemplateHtml } from '../src/lib/job-guides';

const siteUrl = 'https://hashtagweb3.com';
const sampleSlugs = ['mgr48', 'be80', 'arc25', 'mgr47', 'cmp24', 'pm312', 'eng621', 'rec42', 'sec20', 'int15', 'cmp118', 'eng625', 'eng45', 'dc', 'ops25', 'do16', 'int45'];

async function get(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
}

function increment(counts: Record<string, number>, reason: string) {
  counts[reason] = (counts[reason] || 0) + 1;
}

async function main() {
  const checkedAt = new Date().toISOString();
  const catalogUrl = `${siteUrl}/data/jobs-runtime.json`;
  const response = await get(catalogUrl);
  const body = await response.text();
  const jobs: Job[] = JSON.parse(body);
  const locationCounts: Record<string, number> = {};
  const ageCounts: Record<string, number> = {};
  for (const job of jobs) {
    const location = getJobPostingLocation(job);
    increment(locationCounts, location.reason || (location.fields?.jobLocationType ? 'eligible-remote' : 'eligible-physical'));
    increment(ageCounts, jobAgeExclusionReason(job, Date.parse(checkedAt)) || 'eligible');
  }

  const samples = [];
  for (const slug of sampleSlugs) {
    const job = jobs.find(row => row.slug === slug);
    if (!job) { samples.push({ slug, error: 'No longer in the live catalog' }); continue; }
    const url = `${siteUrl}/${slug}`;
    try {
      const page = await get(url);
      const $ = load(await page.text());
      const schemas = $('script[type="application/ld+json"]').toArray().map(element => JSON.parse($(element).text()));
      const postings = schemas.filter(schema => schema['@type'] === 'JobPosting');
      const posting = postings[0];
      const contentHtml = $('[data-job-page] section').first().html() || '';
      const after = buildJobPostingSchema({ job, contentHtml, descriptionIsFallback: isGenericJobTemplateHtml(contentHtml), siteUrl, now: Date.parse(checkedAt) });
      const values = (value: unknown) => value ? (Array.isArray(value) ? value : [value]) : [];
      const countries = [
        ...values(posting?.jobLocation).flatMap(place => place.address?.addressCountry ? [place.address.addressCountry] : []),
        ...values(posting?.applicantLocationRequirements).flatMap(area => area['@type'] === 'Country' ? [area.name] : []),
      ];
      samples.push({
        url, status: page.status, canonical: $('link[rel="canonical"]').attr('href'), isJobDetailPage: $('[data-job-page]').length === 1,
        robots: $('meta[name="robots"]').attr('content'), title: job.title, location: job.location,
        live: {
          postingCount: postings.length, hasCountry: countries.length > 0,
          employmentType: posting?.employmentType, directApply: posting?.directApply,
          validThrough: posting?.validThrough, salary: posting?.baseSalary,
          jobLocation: posting?.jobLocation, jobLocationType: posting?.jobLocationType,
          applicantLocationRequirements: posting?.applicantLocationRequirements,
        },
        patched: { emitsSchema: Boolean(after.schema), reasons: after.reasons },
      });
    } catch (error) {
      samples.push({ url, error: error instanceof Error ? error.message : String(error) });
    }
  }

  console.log(JSON.stringify({
    checkedAt, catalogUrl, catalogHttpDate: response.headers.get('date'),
    catalogSha256: createHash('sha256').update(body).digest('hex'), catalogCount: jobs.length,
    latestOriginalDate: jobs.map(job => job.date).sort((a, b) => Date.parse(b) - Date.parse(a))[0],
    ageCounts,
    // These are location checks over every catalog row, not full-page validation.
    patchedLocationCounts: locationCounts,
    legacyInternTitleFalsePositives: jobs.filter(job => /intern/i.test(job.title) && !/\bintern(?:ship)?\b/i.test(job.title)).map(job => ({ slug: job.slug, title: job.title })),
    legacyContractTitleFalsePositives: jobs.filter(job => /smart[ -]contract/i.test(job.title)).map(job => ({ slug: job.slug, title: job.title })),
    sampleSummary: {
      requested: sampleSlugs.length,
      fetched: samples.filter(sample => 'status' in sample).length,
      errors: samples.filter(sample => 'error' in sample).length,
      jobDetailPages: samples.filter(sample => 'isJobDetailPage' in sample && sample.isJobDetailPage).length,
      liveMissingCountry: samples.filter(sample => 'live' in sample && sample.live.postingCount > 0 && !sample.live.hasCountry).length,
      liveDirectApply: samples.filter(sample => 'live' in sample && sample.live.directApply === true).length,
      patchedEmitsSchema: samples.filter(sample => 'patched' in sample && sample.patched.emitsSchema).length,
    },
    samples,
  }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
