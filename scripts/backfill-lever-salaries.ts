/** Backfills explicit salary ranges from the official Lever board API. */

import fs from 'fs';
import path from 'path';

type CachedJob = {
  id: string;
  source: string;
  salary?: string;
};

type LeverPosting = {
  id: string;
  salaryRange?: { min?: number; max?: number; currency?: string; interval?: string };
};

function formatSalary(range: LeverPosting['salaryRange']): string {
  if (!range?.min || !range.max) return '';
  const interval = range.interval?.replace(/-/g, ' ').replace('salary', '').trim();
  const currency = range.currency || 'USD';
  return `${currency} ${range.min.toLocaleString()} - ${currency} ${range.max.toLocaleString()}${interval ? ` ${interval}` : ''}`;
}

async function main() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const jobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as CachedJob[];
  const jobsById = new Map(jobs.map((job) => [job.id, job]));
  const boards = [...new Set(
    jobs
      .filter((job) => job.source.startsWith('Lever:'))
      .map((job) => job.source.match(/\[([^\]]+)\]$/)?.[1])
      .filter((board): board is string => Boolean(board)),
  )];
  let updated = 0;
  const failures: string[] = [];

  for (const board of boards) {
    try {
      const response = await fetch(`https://api.lever.co/v0/postings/${board}?mode=json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const postings = await response.json() as LeverPosting[];

      for (const posting of postings) {
        const salary = formatSalary(posting.salaryRange);
        const job = jobsById.get(posting.id);
        if (job && salary && job.salary !== salary) {
          job.salary = salary;
          updated++;
        }
      }
    } catch (error) {
      failures.push(`${board}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  fs.writeFileSync(cachePath, `${JSON.stringify(jobs, null, 2)}\n`);
  console.log(JSON.stringify({ boards: boards.length, updated, failures }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
