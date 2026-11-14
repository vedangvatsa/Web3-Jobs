#!/usr/bin/env tsx
/**
 * Fail the build if any homepage (or recent catalog) job slug cannot resolve.
 * Prevents shipping a deploy where /:slug intermittently 404s.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fetchJobBySlug } from '../src/lib/job-by-slug-record';
import { isJobAgeEligible } from '../src/lib/job-age-policy.mjs';
import { jobExpiryTime } from '../src/lib/job-age-cache.mjs';
import { JOB_SHARD_COUNT } from '../src/lib/job-shards';
import { MAX_BUILD_AGE_MS } from './lib/job-age-build-snapshot';

type HomepageSnapshot = {
  total: number;
  initialJobs: Array<{ slug?: string; id?: string; title?: string }>;
};

type RuntimeJob = {
  slug?: string;
  date?: string;
  active?: boolean;
  dateVerified?: boolean;
};

async function main() {
  const homepagePath = path.join(process.cwd(), 'content/homepage-jobs.json');
  const runtimePath = path.join(process.cwd(), 'content/jobs-runtime.json');
  assert.ok(fs.existsSync(homepagePath), 'content/homepage-jobs.json missing');
  assert.ok(fs.existsSync(runtimePath), 'content/jobs-runtime.json missing');

  const homepage = JSON.parse(fs.readFileSync(homepagePath, 'utf8')) as HomepageSnapshot;
  const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8')) as RuntimeJob[];
  assert.ok(Array.isArray(runtime), 'jobs-runtime.json must be an array');
  assert.equal(homepage.total, runtime.length, 'homepage total must match jobs-runtime length');

  const shardDir = path.join(process.cwd(), 'content/job-shards');
  const shardFiles = fs.existsSync(shardDir)
    ? fs.readdirSync(shardDir).filter((name) => /^job-shard-\d{2}\.json$/.test(name))
    : [];
  assert.equal(
    shardFiles.length,
    JOB_SHARD_COUNT,
    `Expected ${JOB_SHARD_COUNT} job shards before deploy, found ${shardFiles.length}`,
  );

  const publicData = path.join(process.cwd(), 'public/data/jobs-runtime.json');
  assert.ok(fs.existsSync(publicData), 'public/data/jobs-runtime.json missing — run sync-public-catalog-assets');

  const mustResolve = new Set<string>();
  for (const job of homepage.initialJobs) {
    if (job.slug) mustResolve.add(job.slug.toLowerCase());
  }
  // Sample across the catalog so we do not only check the newest 50.
  for (let i = 0; i < runtime.length; i += Math.max(1, Math.floor(runtime.length / 40))) {
    const slug = runtime[i]?.slug?.toLowerCase().trim();
    if (slug) mustResolve.add(slug);
  }

  const runtimeBySlug = new Map<string, RuntimeJob>();
  for (const job of runtime) {
    const slug = job.slug?.toLowerCase().trim();
    if (slug) runtimeBySlug.set(slug, job);
  }

  const missing: string[] = [];
  const expiredDuringBuild: string[] = [];
  for (const slug of mustResolve) {
    if (await fetchJobBySlug(slug)) continue;
    // A job still listed in the freshly generated runtime can cross its 30-day
    // expiry between data-prep and gate execution. That retirement is by design:
    // job-age-paths serves the path a 410 and the next data-prep drops the row,
    // so excuse it within one build window. Anything else is the intermittent-404
    // wiring bug this gate exists to catch.
    const raw = runtimeBySlug.get(slug);
    if (raw && !isJobAgeEligible(raw)) {
      const expiry = jobExpiryTime(raw);
      if (Number.isFinite(expiry) && Date.now() - expiry <= MAX_BUILD_AGE_MS) {
        expiredDuringBuild.push(slug);
        continue;
      }
    }
    missing.push(slug);
  }
  assert.equal(missing.length, 0, `Unresolved job slugs (would 404 in production): ${missing.join(', ')}`);
  if (expiredDuringBuild.length > 0) {
    console.log(
      `[test-job-slug-resolution] Excused ${expiredDuringBuild.length} slug(s) that expired during this build: ${expiredDuringBuild.join(', ')}`,
    );
  }

  console.log(
    `[test-job-slug-resolution] OK — ${mustResolve.size} slugs resolve; ${runtime.length} jobs; ${JOB_SHARD_COUNT} shards`,
  );
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
