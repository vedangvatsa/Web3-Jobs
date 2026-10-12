import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../../src/types';
import { isJobAgeEligible } from '../../src/lib/job-age-policy.mjs';
import { getJobSourceIssue } from '../../src/lib/job-source-policy';
import { preserveOriginalJobDate, type JobDateHistory } from '../../src/lib/job-source-date';

export function readJobDateHistory(root = process.cwd()): JobDateHistory {
  const file = path.join(root, 'content/job-date-history.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
}

export function writeJobDateHistory(history: JobDateHistory, root = process.cwd()): void {
  const file = path.join(root, 'content/job-date-history.json');
  const json = `${JSON.stringify(history, null, 2)}\n`;
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== json) fs.writeFileSync(file, json);
}

export function eligibleIngestedJobs<T extends Job>(jobs: T[], root = process.cwd(), now = Date.now()): T[] {
  const history = readJobDateHistory(root);
  const normalized = jobs.map(job => preserveOriginalJobDate(job, history));
  writeJobDateHistory(history, root);
  return normalized.filter(job => isJobAgeEligible(job, now) && !getJobSourceIssue(job));
}
