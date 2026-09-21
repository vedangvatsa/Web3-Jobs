#!/usr/bin/env tsx
/**
 * Fail the build if any homepage (or recent catalog) job slug cannot resolve.
 * Prevents shipping a deploy where /:slug intermittently 404s.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fetchJobBySlug } from '../src/lib/job-by-slug-record';
import { JOB_SHARD_COUNT } from '../src/lib/job-shards';

type HomepageSnapshot = {
  total: number;
  initialJobs: Array<{ slug?: string; id?: string; title?: string }>;
};

async function main() {
  const homepagePath = path.join(process.cwd(), 'content/homepage-jobs.json');
  const runtimePath = path.join(process.cwd(), 'content/jobs-runtime.json');
  assert.ok(fs.existsSync(homepagePath), 'content/homepage-jobs.json missing');
  assert.ok(fs.existsSync(runtimePath), 'content/jobs-runtime.json missing');

  const homepage = JSON.parse(fs.readFileSync(homepagePath, 'utf8')) as HomepageSnapshot;
  const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8')) as Array<{ slug?: string }>;
  assert.ok(Array.isArray(runtime) && runtime.length > 0, 'jobs-runtime.json empty');
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

  const missing: string[] = [];
  for (const slug of mustResolve) {
    const job = await fetchJobBySlug(slug);
    if (!job) missing.push(slug);
  }
  assert.equal(missing.length, 0, `Unresolved job slugs (would 404 in production): ${missing.join(', ')}`);

  console.log(
    `[test-job-slug-resolution] OK — ${mustResolve.size} slugs resolve; ${runtime.length} jobs; ${JOB_SHARD_COUNT} shards`,
  );
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
