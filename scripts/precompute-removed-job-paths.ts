import fs from 'node:fs';
import type { RemovedJobListing } from '../src/lib/job-source-policy';
import { getJobIdentity } from '../src/lib/job-slugs';
import { loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import type { Job } from '../src/types';

const removed = JSON.parse(fs.readFileSync('content/removed-job-listings.json', 'utf8')) as Record<string, RemovedJobListing>;
const slugs = [...new Set(Object.values(removed).flatMap(record => record.blockedSlugs || [record.slug, ...(record.aliases || [])]))].sort();
fs.writeFileSync('content/removed-job-paths.json', `${JSON.stringify(slugs)}\n`);
const jobs = JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8')) as Job[];
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
console.log(`Removed-job path index: ${slugs.length} URLs.`);
console.log(`Recovered job redirects: ${Object.keys(redirects).length} aliases.`);
