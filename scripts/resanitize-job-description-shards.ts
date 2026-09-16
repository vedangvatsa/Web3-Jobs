#!/usr/bin/env tsx

/**
 * Re-run company-aware job description sanitization on all shard entries.
 * Safe to run after sanitizer fixes; pairs descriptions with jobs-cache company names.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import { getJobContentKey } from '../src/lib/job-slugs';
import {
  getJobDescriptionShardsPath,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

function loadJobsCache(): Job[] {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  return JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
}

function main(): void {
  const jobs = loadJobsCache();
  const companyByContentKey = new Map<string, string>();
  for (const job of jobs) {
    companyByContentKey.set(getJobContentKey(job), job.company);
  }

  const store = readJobDescriptionStore();
  let modified = 0;
  for (const [key, original] of Object.entries(store.descriptions)) {
    if (typeof original !== 'string') continue;
    const company = companyByContentKey.get(key) || companyByContentKey.get(store.aliases[key] || '');
    const cleaned = sanitizeJobDescriptionHtml(original, company);
    if (cleaned !== original) {
      store.descriptions[key] = cleaned;
      modified += 1;
    }
  }

  writeJobDescriptionStore(store, process.cwd());
  console.log(`Resanitized ${modified} / ${Object.keys(store.descriptions).length} descriptions.`);
}

main();
