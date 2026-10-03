import fs from 'node:fs';
import type { Job } from '../../src/types';
import { getJobIdentity } from '../../src/lib/job-slugs';
import { getJobSourceIssue } from '../../src/lib/job-source-policy';

export function applicationAuditSubjects(): Array<Job & { applyUrl?: string }> {
  const active = JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8')) as Array<Job & { applyUrl?: string }>;
  const archive = JSON.parse(fs.readFileSync('content/legacy-slugs-archive.json', 'utf8')) as Record<string, Partial<Job> & { retiredReason?: string }>;
  const subjects = new Map(active.map(job => [getJobIdentity(job), job]));
  for (const [slug, record] of Object.entries(archive)) {
    if (!record.link || !/^https?:\/\//.test(record.link) || getJobSourceIssue(record)) continue;
    const job: Job = { ...record, slug, id: record.id || slug, title: record.title || '', company: record.company || '', link: record.link, date: record.date || '', source: record.source || 'Archived listing' };
    const identity = getJobIdentity(job);
    if (!subjects.has(identity)) subjects.set(identity, job);
  }
  return [...subjects.values()];
}
