#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import {
  fetchJobOriginalContent,
  getCachedRawContent,
  isGenericJobTemplateHtml,
} from '../src/lib/job-guides';
import { getJobContentKey, getJobSlug } from '../src/lib/job-slugs';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import {
  JOB_DESCRIPTION_SHARD_COUNT,
  getJobDescriptionShardFilename,
  isJobDescriptionShard,
} from '../src/lib/job-description-shards';
import { seedDescriptionShardCache } from '../src/lib/job-description-shard-loader';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

const ROOT = process.cwd();
const CACHE_PATH = path.join(ROOT, 'content/jobs-cache.json');
const PUBLIC_SHARDS = path.join(ROOT, 'public/job-description-shards');

function preloadShards(): void {
  const dir = path.join(ROOT, 'content/job-description-shards');
  for (let i = 0; i < JOB_DESCRIPTION_SHARD_COUNT; i++) {
    const fn = getJobDescriptionShardFilename(i);
    const fp = path.join(dir, fn);
    if (!fs.existsSync(fp)) continue;
    const parsed: unknown = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (isJobDescriptionShard(parsed)) seedDescriptionShardCache(fn, parsed);
  }
}

function plainLen(html: string): number {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length;
}

function isMissingCachedBody(job: Job): boolean {
  return plainLen(getCachedRawContent(job)) < 100;
}

async function runInBatches<T>(
  items: T[],
  batchSize: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    await Promise.all(items.slice(i, i + batchSize).map(worker));
  }
}

async function main(): Promise<void> {
  preloadShards();
  const allJobs: Job[] = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  const activeJobs = allJobs.filter((job) => job.active !== false);
  const missing = activeJobs.filter(isMissingCachedBody);
  console.log(`Backfilling ${missing.length} jobs missing cached employer text…`);

  const store = readJobDescriptionStore(ROOT);
  let updated = 0;
  let skipped = 0;
  const stillMissing: Job[] = [];

  await runInBatches(missing, 8, async (job) => {
    const html = await fetchJobOriginalContent(job);
    if (isGenericJobTemplateHtml(html) || plainLen(html) < 200) {
      stillMissing.push(job);
      skipped += 1;
      return;
    }
    const contentKey = getJobContentKey(job);
    store.descriptions[contentKey] = sanitizeJobDescriptionHtml(html, job.company);
    updated += 1;
    console.log(`  ✓ ${getJobSlug(job)} (${job.company} / ${job.title})`);
  });

  store.aliases = buildJobDescriptionAliases(allJobs, store.descriptions);
  writeJobDescriptionStore(store, ROOT);

  fs.mkdirSync(PUBLIC_SHARDS, { recursive: true });
  const contentShards = path.join(ROOT, 'content/job-description-shards');
  for (const name of fs.readdirSync(contentShards)) {
    if (!name.endsWith('.json')) continue;
    fs.copyFileSync(path.join(contentShards, name), path.join(PUBLIC_SHARDS, name));
  }

  let deactivated = 0;
  for (const job of stillMissing) {
    const idx = allJobs.findIndex((entry) => getJobContentKey(entry) === getJobContentKey(job));
    if (idx === -1 || allJobs[idx].active === false) continue;
    allJobs[idx] = { ...allJobs[idx], active: false };
    deactivated += 1;
    console.log(`  ⊗ deactivated ${getJobSlug(job)} (${job.company}) — no fetchable employer copy`);
  }

  if (deactivated > 0) {
    fs.writeFileSync(CACHE_PATH, `${JSON.stringify(allJobs, null, 2)}\n`);
  }

  console.log(`\nDone: ${updated} descriptions written; ${skipped} still thin; ${deactivated} listings deactivated.`);
  if (stillMissing.length - deactivated > 0) {
    console.log('Remaining without shard text (still active):');
    for (const job of stillMissing.filter((j) => j.active !== false).slice(0, 15)) {
      console.log(`  - ${getJobSlug(job)} ${job.link}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
