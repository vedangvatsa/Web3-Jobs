import fs from 'node:fs';
import { isJobAgeEligible, parseJobPostingDate } from '../src/lib/job-age-policy.mjs';
import { getJobIdentity } from '../src/lib/job-slugs';
import type { Job } from '../src/types';

async function main() {
// Only recheck dates that legacy importers could have taken from `updated_at`.
const jobs = JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8')) as Job[];
const previous = fs.existsSync('content/job-date-provenance.json') ? JSON.parse(fs.readFileSync('content/job-date-provenance.json', 'utf8')) : { records: {}, checks: [] };
const groups = new Map<string, Job[]>();
for (const job of jobs) {
  if (!isJobAgeEligible(job) || !/^Greenhouse:/i.test(job.source)) continue;
  const board = job.source.match(/\[([^\]]+)\]$/)?.[1];
  if (!board) continue;
  if (previous.records[getJobIdentity(job)]?.dateSource === 'Greenhouse.first_published') continue;
  const host = 'https://boards-api.greenhouse.io';
  const url = `${host}/v1/boards/${encodeURIComponent(board)}/jobs`;
  const group = groups.get(url) || [];
  group.push(job);
  groups.set(url, group);
}
const records: Record<string, { date: string; dateVerified: boolean; dateSource: string }> = previous.records;
const checks: Array<{ url: string; checkedAt: string; candidates: number; verified: number; error?: string }> = previous.checks;
const entries = [...groups];
for (let i = 0; i < entries.length; i += 5) {
  await Promise.all(entries.slice(i, i + 5).map(async ([url, candidates]) => {
    const check = { url, checkedAt: new Date().toISOString(), candidates: candidates.length, verified: 0, error: undefined as string | undefined };
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as { jobs: Array<{ id: number; first_published?: string }> };
      if (!Array.isArray(data.jobs)) throw new Error('Missing jobs array');
      const byId = new Map(data.jobs.map(job => [String(job.id), job]));
      for (const job of candidates) {
        const date = byId.get(job.id)?.first_published || '';
        const dateVerified = Number.isFinite(parseJobPostingDate(date));
        records[getJobIdentity(job)] = { date, dateVerified, dateSource: 'Greenhouse.first_published' };
        if (dateVerified) check.verified++;
      }
    } catch (error) {
      check.error = String(error);
      for (const job of candidates) records[getJobIdentity(job)] = { date: job.date, dateVerified: false, dateSource: 'unresolved-Greenhouse-first-published' };
    }
    checks.push(check);
    console.log(`${url}: ${check.verified}/${candidates.length} source dates${check.error ? ` (${check.error})` : ''}`);
  }));
}
fs.writeFileSync('content/job-date-provenance.json', `${JSON.stringify({ checkedAt: new Date().toISOString(), records, checks }, null, 2)}\n`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
