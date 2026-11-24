#!/usr/bin/env tsx
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { JOB_DESCRIPTION_LEAK_PATTERNS } from '../src/lib/sanitize-html';
import { polishJobDescriptionHtml } from '../src/lib/job-description-polish';
import { getJobContentKey } from '../src/lib/job-slugs';
import { readJobDescriptionStore } from './lib/job-description-store';

const STATUS_PATH = path.join(process.cwd(), 'content/jobs/copyedit-status.json');

const failures: string[] = [];

if (!fs.existsSync(STATUS_PATH)) {
  throw new Error('Missing content/jobs/copyedit-status.json — run apply-job-full-editorial-polish.ts --apply');
}

const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf-8')) as Record<string, { method: string }>;
const jobs = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content/jobs-cache.json'), 'utf8')) as Job[];
const companyByKey = new Map(jobs.map((j) => [getJobContentKey(j), j.company]));

const store = readJobDescriptionStore();

for (const [key, html] of Object.entries(store.descriptions)) {
  if (typeof html !== 'string' || !html.trim()) continue;

  if (!status[key] || status[key].method !== 'human-editorial-polish-v2') {
    failures.push(`${key}: missing editorial polish status`);
  }

  const company = companyByKey.get(key) || companyByKey.get(store.aliases[key] || '');
  const repolished = polishJobDescriptionHtml(html, company);
  if (repolished !== html) {
    failures.push(`${key}: description not at polish fixed point`);
  }

  for (const { name, re } of JOB_DESCRIPTION_LEAK_PATTERNS) {
    if (re.test(html)) failures.push(`${key}: leak ${name}`);
  }

  assert.doesNotMatch(html, /\bclick here to\b/i, `${key}: click-here phrasing`);
}

if (failures.length) {
  throw new Error(
    `Job editorial polish failed (${failures.length}):\n${failures.slice(0, 40).join('\n')}${
      failures.length > 40 ? '\n...' : ''
    }`,
  );
}

console.log(`Job editorial polish verified for ${Object.keys(store.descriptions).length} shard entries.`);