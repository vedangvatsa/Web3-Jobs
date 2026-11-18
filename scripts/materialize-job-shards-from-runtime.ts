#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import {
  JOB_SHARD_COUNT,
  getJobShardFilename,
  getJobSlugShardIndex,
} from '../src/lib/job-shards';

const ROOT = process.cwd();
const RUNTIME = path.join(ROOT, 'content/jobs-runtime.json');
const JOB_SHARDS_DIR = path.join(ROOT, 'content/job-shards');
const PUBLIC_JOB_SHARDS_DIR = path.join(ROOT, 'public/job-shards');

function shardCount(directory: string): number {
  if (!fs.existsSync(directory)) return 0;
  return fs.readdirSync(directory).filter((name) => /^job-shard-\d{2}\.json$/.test(name)).length;
}

function main(): void {
  if (shardCount(JOB_SHARDS_DIR) >= JOB_SHARD_COUNT) {
    console.log('[materialize-job-shards] content/job-shards present → skip');
    return;
  }
  const listing = JSON.parse(fs.readFileSync(RUNTIME, 'utf8')) as Job[];
  fs.mkdirSync(JOB_SHARDS_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_JOB_SHARDS_DIR, { recursive: true });
  const shards: Record<string, Job>[] = Array.from({ length: JOB_SHARD_COUNT }, () => ({}));
  for (const job of listing) {
    const slug = job.slug?.toLowerCase().trim();
    if (!slug) continue;
    shards[getJobSlugShardIndex(slug)][slug] = job;
  }
  for (let i = 0; i < JOB_SHARD_COUNT; i += 1) {
    const filename = getJobShardFilename(i);
    const json = `${JSON.stringify(shards[i])}\n`;
    fs.writeFileSync(path.join(JOB_SHARDS_DIR, filename), json, 'utf-8');
    fs.writeFileSync(path.join(PUBLIC_JOB_SHARDS_DIR, filename), json, 'utf-8');
  }
  console.log(`[materialize-job-shards] wrote ${JOB_SHARD_COUNT} shards (${listing.length} jobs)`);
}

main();