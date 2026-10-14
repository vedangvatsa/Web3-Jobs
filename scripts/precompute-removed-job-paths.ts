import fs from 'node:fs';
import type { RemovedJobListing } from '../src/lib/job-source-policy';
import { getJobIdentity } from '../src/lib/job-slugs';
import { loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import type { Job } from '../src/types';
import { isJobAgeEligible } from '../src/lib/job-age-policy.mjs';
import { jobExpiryTime, visibleJobListingExpiries } from '../src/lib/job-age-cache.mjs';
import { buildCompaniesFromJobs, type CompanyProfileRow } from '../src/lib/companies';
import { buildJobsListing } from '../src/lib/jobs-listing-build';
import nomadCities from '../content/nomads/cities.json';

const removed = JSON.parse(fs.readFileSync('content/removed-job-listings.json', 'utf8')) as Record<string, RemovedJobListing>;
const slugs = [...new Set(Object.values(removed).flatMap(record => record.blockedSlugs || [record.slug, ...(record.aliases || [])]))].sort();
fs.writeFileSync('content/removed-job-paths.json', `${JSON.stringify(slugs)}\n`);
const jobs = (JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8')) as Job[]).filter(job => isJobAgeEligible(job));
const live = new Map(jobs.map(job => [getJobIdentity(job), job]));
const archive = JSON.parse(fs.readFileSync('content/legacy-slugs-archive.json', 'utf8')) as Record<string, Job & { recoveredFromMisattribution?: boolean }>;
const protectedSlugs = loadReservedRootSlugsSync();
const redirects: Record<string, string> = {};
for (const [slug, record] of Object.entries(archive)) {
  if (!record.recoveredFromMisattribution || !record.link || protectedSlugs.has(slug) || slugs.includes(slug)) continue;
  const job = live.get(getJobIdentity(record));
  if (job?.slug && job.slug !== slug && /^[a-z0-9][a-z0-9_-]*$/.test(slug)) redirects[slug] = `/${job.slug}`;
}
fs.writeFileSync('content/recovered-job-redirects.json', `${JSON.stringify(redirects)}\n`);
const dates: Record<string, string | null> = {};
for (const [slug, record] of Object.entries(archive)) {
  if (protectedSlugs.has(slug)) continue;
  const job = record.link ? live.get(getJobIdentity(record)) : undefined;
  dates[slug] = job && !slugs.includes(slug) ? job.date : null;
}
for (const job of jobs) {
  for (const slug of [job.slug, job.id]) {
    if (slug && !protectedSlugs.has(slug.toLowerCase()) && !slugs.includes(slug.toLowerCase())) dates[slug.toLowerCase()] = job.date;
  }
}
for (const slug of slugs) if (!protectedSlugs.has(slug)) dates[slug] = null;
fs.writeFileSync('content/job-age-paths.json', `${JSON.stringify(dates)}\n`);
const deadlines = (rows: Job[]) => [...new Set(rows.map(jobExpiryTime))].sort((a, b) => a - b);
const listing = buildJobsListing(jobs);
const scopes: Record<string, number[] | 'catalog'> = { '/': 'catalog', '/jobs': 'catalog', '/companies': 'catalog', '/community': visibleJobListingExpiries(listing, 9) };
const overridesFile = 'content/company-profile-overrides.json';
const verifiedProfiles = fs.existsSync(overridesFile) ? JSON.parse(fs.readFileSync(overridesFile, 'utf8')) as Record<string, CompanyProfileRow> : {};
for (const company of buildCompaniesFromJobs(listing, verifiedProfiles)) scopes[`/${company.slug}`] = deadlines(company.jobs);
for (const city of nomadCities) scopes[`/${city.slug}`] = 'catalog';
fs.writeFileSync('content/job-age-page-scopes.json', `${JSON.stringify(scopes)}\n`);
console.log(`Removed-job path index: ${slugs.length} URLs.`);
console.log(`Recovered job redirects: ${Object.keys(redirects).length} aliases.`);
