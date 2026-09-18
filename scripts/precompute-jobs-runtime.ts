import * as fs from 'fs';
import * as path from 'path';
import type { Job } from '../src/types';
import { buildJobsListing } from '../src/lib/jobs-listing-build';
import { buildCompanyLogoMapSync } from '../src/lib/job-logo-map';

const CACHE_PATH = path.join(process.cwd(), 'content/jobs-cache.json');
const OUT_PATH = path.join(process.cwd(), 'content/jobs-runtime.json');
const PUBLIC_DATA_PATH = path.join(process.cwd(), 'public/data/jobs-runtime.json');
const HOMEPAGE_PATH = path.join(process.cwd(), 'content/homepage-jobs.json');
const HOMEPAGE_INITIAL = 50;

function main() {
  const raw = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8')) as Job[];
  const listing = buildJobsListing(raw).map((job) => {
    const { description: _desc, ...rest } = job;
    return rest as Job;
  });
  const json = `${JSON.stringify(listing)}\n`;
  fs.writeFileSync(OUT_PATH, json, 'utf-8');
  console.log(`Wrote ${listing.length} jobs to ${OUT_PATH}`);
  fs.mkdirSync(path.dirname(PUBLIC_DATA_PATH), { recursive: true });
  fs.writeFileSync(PUBLIC_DATA_PATH, json, 'utf-8');
  console.log(`Wrote ${listing.length} jobs to ${PUBLIC_DATA_PATH}`);

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
