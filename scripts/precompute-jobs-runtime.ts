import * as fs from "fs";
import * as path from "path";
import type { Job } from "../src/types";
import { buildJobsListing } from "../src/lib/jobs-listing-build";
import { buildCompanyLogoMapSync } from "../src/lib/job-logo-map";
import {
  JOB_SHARD_COUNT,
  getJobSlugShardIndex,
  getJobShardFilename,
} from "../src/lib/job-shards";

const CACHE_PATH = path.join(process.cwd(), "content/jobs-cache.json");
const OUT_PATH = path.join(process.cwd(), "content/jobs-runtime.json");
const PUBLIC_DATA_PATH = path.join(process.cwd(), "public/data/jobs-runtime.json");
const HOMEPAGE_PATH = path.join(process.cwd(), "content/homepage-jobs.json");
const JOB_SHARDS_DIR = path.join(process.cwd(), "content/job-shards");
const PUBLIC_JOB_SHARDS_DIR = path.join(process.cwd(), "public/job-shards");
const HOMEPAGE_INITIAL = 50;

function writeJobShards(listing: Job[]) {
  fs.mkdirSync(JOB_SHARDS_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_JOB_SHARDS_DIR, { recursive: true });

  const shards: Record<string, Job>[] = Array.from({ length: JOB_SHARD_COUNT }, () => ({}));

  for (const job of listing) {
    const slug = job.slug?.toLowerCase().trim();
    if (!slug) continue;
    const shardIndex = getJobSlugShardIndex(slug);
    shards[shardIndex][slug] = job;
  }

  for (let i = 0; i < JOB_SHARD_COUNT; i++) {
    const filename = getJobShardFilename(i);
    const json = `${JSON.stringify(shards[i])}\n`;
    fs.writeFileSync(path.join(JOB_SHARDS_DIR, filename), json, "utf-8");
    fs.writeFileSync(path.join(PUBLIC_JOB_SHARDS_DIR, filename), json, "utf-8");
  }

  const written = fs.readdirSync(JOB_SHARDS_DIR).filter((name) => /^job-shard-\d{2}\.json$/.test(name));
  if (written.length !== JOB_SHARD_COUNT) {
    throw new Error(`Expected ${JOB_SHARD_COUNT} job shards, found ${written.length}`);
  }
  console.log(`Wrote ${JOB_SHARD_COUNT} job shards (${listing.length} total jobs) to ${JOB_SHARDS_DIR}`);
}

function main() {
  const raw = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8")) as Job[];
  const listing = buildJobsListing(raw).map((job) => {
    const { description: _desc, ...rest } = job;
    return rest as Job;
  });
  const json = `${JSON.stringify(listing)}\n`;
  fs.writeFileSync(OUT_PATH, json, "utf-8");
  console.log(`Wrote ${listing.length} jobs to ${OUT_PATH}`);
  fs.mkdirSync(path.dirname(PUBLIC_DATA_PATH), { recursive: true });
  fs.writeFileSync(PUBLIC_DATA_PATH, json, "utf-8");
  console.log(`Wrote ${listing.length} jobs to ${PUBLIC_DATA_PATH}`);

  const initialJobs = listing.slice(0, HOMEPAGE_INITIAL);
  const homepage = {
    total: listing.length,
    initialJobs,
    companyLogos: buildCompanyLogoMapSync(initialJobs),
  };
  fs.writeFileSync(HOMEPAGE_PATH, `${JSON.stringify(homepage)}\n`, "utf-8");
  console.log(`Wrote homepage snapshot (${initialJobs.length} jobs) to ${HOMEPAGE_PATH}`);
  writeJobShards(listing);
}

main();
