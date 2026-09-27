import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import type { Job } from '../../src/types';
import { getJobContentKey, getJobIdentity } from '../../src/lib/job-slugs';
import { getJobDescriptionShardFilename, getJobDescriptionShardIndex, type JobDescriptionShard } from '../../src/lib/job-description-shards';
import { postingText } from './hiring-report-analysis';

export function loadHiringReportInput(root = process.cwd()) {
  const inputSha256: Record<string, string> = {};
  function readInput<T>(relative: string): T {
    const raw = readFileSync(path.join(root, relative), 'utf8');
    inputSha256[relative] = createHash('sha256').update(raw).digest('hex');
    return JSON.parse(raw) as T;
  }
  const allJobs = readInput<Job[]>('content/jobs-runtime.json');
  const uniqueJobs = new Map<string, Job>();
  for (const job of allJobs) {
    if (job.active !== false) uniqueJobs.set(getJobIdentity(job), job);
  }
  const jobs = [...uniqueJobs.values()];
  if (!jobs.length) throw new Error('Hiring report requires a nonempty local jobs snapshot');
  const shards = new Map<string, JobDescriptionShard>();
  const records = jobs.map(job => {
    const filename = getJobDescriptionShardFilename(getJobDescriptionShardIndex(job));
    if (!shards.has(filename)) shards.set(filename, readInput<JobDescriptionShard>(`content/job-description-shards/${filename}`));
    const shard = shards.get(filename)!;
    const keys = [getJobContentKey(job), job.id, job.slug].filter((key): key is string => Boolean(key));
    const html = keys.map(key => shard.descriptions[shard.aliases[key] || key]).find(Boolean) || job.description || '';
    return { job, text: postingText(html) };
  });
  return { records, inputSha256, excludedRows: allJobs.length - jobs.length };
}
