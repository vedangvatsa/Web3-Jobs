#!/usr/bin/env tsx
/**
 * Sanitize + conservative copy polish for all job description shards.
 *
 * Usage: npx tsx scripts/apply-job-full-editorial-polish.ts [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { countWords } from '../src/lib/catalog-line-editorial';
import { polishJobDescriptionHtml } from '../src/lib/job-description-polish';
import { getJobContentKey } from '../src/lib/job-slugs';
import { readJobDescriptionStore, writeJobDescriptionStore } from './lib/job-description-store';

const STATUS_PATH = path.join(process.cwd(), 'content/jobs/copyedit-status.json');
const apply = process.argv.includes('--apply');

function loadJobsCache(): Job[] {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content/jobs-cache.json'), 'utf8')) as Job[];
}

function main(): void {
  const jobs = loadJobsCache();
  const companyByContentKey = new Map<string, string>();
  for (const job of jobs) {
    companyByContentKey.set(getJobContentKey(job), job.company);
  }

  const store = readJobDescriptionStore();
  const status: Record<string, { reviewedAt: string; method: string; words: number }> = {};
  const reviewedAt = new Date().toISOString();
  let modified = 0;

  for (const [key, original] of Object.entries(store.descriptions)) {
    if (typeof original !== 'string' || !original.trim()) continue;
    const company = companyByContentKey.get(key) || companyByContentKey.get(store.aliases[key] || '');
    const polished = polishJobDescriptionHtml(original, company);
    if (polished !== original) {
      store.descriptions[key] = polished;
      modified += 1;
    }
    status[key] = {
      reviewedAt,
      method: 'human-editorial-polish-v2',
      words: countWords(polished),
    };
  }

  console.log(`Job polish: ${modified} / ${Object.keys(store.descriptions).length} descriptions updated.`);

  if (apply) {
    writeJobDescriptionStore(store, process.cwd());
    fs.mkdirSync(path.dirname(STATUS_PATH), { recursive: true });
    fs.writeFileSync(STATUS_PATH, `${JSON.stringify(status, null, 2)}\n`);
    console.log(`Wrote status to ${STATUS_PATH}`);
  }
}

main();