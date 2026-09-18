import * as fs from 'fs';
import * as path from 'path';
import type { Job } from '../src/types';
import { buildJobsListing } from '../src/lib/jobs-listing-build';
import { buildCompanyLogoMapSync } from '../src/lib/job-listing';

const CACHE_PATH = path.join(process.cwd(), 'content/jobs-cache.json');
const OUT_PATH = path.join(process.cwd(), 'content/jobs-runtime.json');
const HOMEPAGE_PATH = path.join(process.cwd(), 'content/homepage-jobs.json');
const HOMEPAGE_INITIAL = 12;

function main() {
  const raw = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8')) as Job[];
  const listing = buildJobsListing(raw);
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(listing)}\n`, 'utf-8');
  console.log(`Wrote ${listing.length} jobs to ${OUT_PATH}`);

  const initialJobs = listing.slice(0, HOMEPAGE_INITIAL);
  const homepage = {
    total: listing.length,
    initialJobs,
    companyLogos: buildCompanyLogoMapSync(initialJobs),
  };
  fs.writeFileSync(HOMEPAGE_PATH, `${JSON.stringify(homepage)}\n`, 'utf-8');
  console.log(`Wrote homepage snapshot (${initialJobs.length} jobs) to ${HOMEPAGE_PATH}`);
}

main();
