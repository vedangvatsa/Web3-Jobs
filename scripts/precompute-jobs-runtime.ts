import * as fs from 'fs';
import * as path from 'path';
import type { Job } from '../src/types';
import { buildJobsListing } from '../src/lib/jobs-listing-build';

const CACHE_PATH = path.join(process.cwd(), 'content/jobs-cache.json');
const OUT_PATH = path.join(process.cwd(), 'content/jobs-runtime.json');

function main() {
  const raw = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8')) as Job[];
  const listing = buildJobsListing(raw);
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(listing)}\n`, 'utf-8');
  console.log(`Wrote ${listing.length} jobs to ${OUT_PATH}`);
}

main();
