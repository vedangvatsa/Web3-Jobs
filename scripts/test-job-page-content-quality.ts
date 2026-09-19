#!/usr/bin/env tsx

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { buildSynthesizedJobContent, hasSubstantialJobContent } from '../src/lib/job-guides';
import { getJobs } from '../src/lib/jobs';
import {
  JOB_DESCRIPTION_LEAK_PATTERNS,
  sanitizeJobDescriptionHtml,
} from '../src/lib/sanitize-html';
import { getJobContentKey } from '../src/lib/job-slugs';
import { readJobDescriptionStore } from './lib/job-description-store';
import {
  getJobDescriptionShardFilename,
  getJobDescriptionShardIndex,
  isJobDescriptionShard,
} from '../src/lib/job-description-shards';
import { seedDescriptionShardCache } from '../src/lib/job-description-shard-loader';

function preloadDescriptionShardForJob(job: Job): void {
  const filename = getJobDescriptionShardFilename(getJobDescriptionShardIndex(job));
  const shardPath = path.join(process.cwd(), 'content/job-description-shards', filename);
  if (!fs.existsSync(shardPath)) return;
  const parsed: unknown = JSON.parse(fs.readFileSync(shardPath, 'utf8'));
  if (!isJobDescriptionShard(parsed)) return;
  seedDescriptionShardCache(filename, parsed);
}

function assertNoLeaks(label: string, html: string): void {
  for (const { name, re } of JOB_DESCRIPTION_LEAK_PATTERNS) {
    assert.doesNotMatch(html, re, `${label}: leak "${name}"`);
  }
}

async function main(): Promise<void> {
  const jobs = await getJobs();
  const dev5 = jobs.find((j) => j.slug === 'dev5');
  assert.ok(dev5, 'dev5 fixture job missing from cache');
  preloadDescriptionShardForJob(dev5);

  const dev5Html = buildSynthesizedJobContent(dev5);
  assertNoLeaks('dev5', dev5Html);
  assert.match(dev5Html, /DV Group of financial services/i, 'dev5: company intro should include DV Group');
  assert.doesNotMatch(dev5Html, /<p[^>]*>\s*:\s*<\/p>/i, 'dev5: stray colon paragraph');
  assert.doesNotMatch(dev5Html, /headquartered in Chicago, the\s*<\/p>/i, 'dev5: truncated company intro');

  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const cachedJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const companyByContentKey = new Map<string, string>();
  for (const job of cachedJobs) {
    companyByContentKey.set(getJobContentKey(job), job.company);
  }

  const store = readJobDescriptionStore();
  const storedFailures: string[] = [];
  for (const [key, original] of Object.entries(store.descriptions)) {
    if (typeof original !== 'string') continue;
    const company = companyByContentKey.get(key) || companyByContentKey.get(store.aliases[key] || '');
    const cleaned = sanitizeJobDescriptionHtml(original, company);
    for (const { name, re } of JOB_DESCRIPTION_LEAK_PATTERNS) {
      if (re.test(cleaned)) {
        storedFailures.push(`${key} (${company || 'unknown'}): ${name}`);
      }
    }
  }
  if (storedFailures.length > 0) {
    const sample = storedFailures.slice(0, 12).join('\n  - ');
    throw new Error(
      `${storedFailures.length} stored description(s) failed sanitizer leak checks. Sample:\n  - ${sample}`,
    );
  }

  const goldenSlugs = ['dev5', 'tr10', 'manager593', 'compliance154', 'eng159', 'mkt30'];
  for (const slug of goldenSlugs) {
    const job = jobs.find((j) => j.slug === slug);
    if (!job) continue;
    preloadDescriptionShardForJob(job);
    assert.ok(hasSubstantialJobContent(job), `${slug}: expected indexable cached body`);
    const html = buildSynthesizedJobContent(job);
    assertNoLeaks(slug, html);
    assert.ok(html.length >= 600, `${slug}: expected at least 600 chars of HTML`);
    assert.doesNotMatch(html, /<p[^>]*>\s*#{2,4}\s+/, `${slug}: raw markdown header in HTML`);
    assert.doesNotMatch(html, /<p[^>]*>\s*[-*•·▪–—\u2010-\u2015]\s+/, `${slug}: raw bullet paragraph`);
  }

  console.log(
    `Job page content quality OK (golden slugs + ${Object.keys(store.descriptions).length} stored descriptions).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
