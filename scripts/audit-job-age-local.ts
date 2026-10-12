import fs from 'node:fs';
import { jobAgeExclusionReason } from '../src/lib/job-age-policy.mjs';
import type { Job } from '../src/types';

const jobs = JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8')) as Job[];
const now = Date.now();
const reasons: Record<string, number> = {};
const sources: Record<string, { total: number; eligible: number; unverified: number }> = {};
const dates: Record<string, number> = {};
for (const job of jobs) {
  const reason = jobAgeExclusionReason(job, now) || 'eligible';
  reasons[reason] = (reasons[reason] || 0) + 1;
  const provider = job.source.split(':')[0];
  const row = sources[provider] ??= { total: 0, eligible: 0, unverified: 0 };
  row.total++;
  if (reason === 'eligible') row.eligible++;
  if (job.dateVerified === false) row.unverified++;
  if (reason === 'eligible') dates[job.date] = (dates[job.date] || 0) + 1;
}
console.log(JSON.stringify({ checkedAt: new Date(now).toISOString(), total: jobs.length, reasons, sources, repeatedEligibleDates: Object.entries(dates).filter(([, n]) => n > 3).sort((a, b) => b[1] - a[1]), harmony: jobs.filter(j => j.company === 'Harmony').map(({ id, slug, date }) => ({ id, slug, date })) }, null, 2));
console.log('Provenance candidates:', JSON.stringify(jobs.filter(j => /Amazon.jobs|Google Careers|Apple Careers|YZi Labs|MokaHR/.test(j.source)), null, 2));
console.log('Invalid date examples:', jobs.filter(j => jobAgeExclusionReason(j, now) === 'invalid-date').slice(0, 5).map(j => ({ source: j.source, date: j.date })));
