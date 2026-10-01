#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { getAshbySalary } from './lib/ashby-salary';
import { assertAtsSourceAllowed, getJobSourceIssue } from '../src/lib/job-source-policy';
import { verifyAshbyEmployer } from './lib/ashby-employer-verification';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

const board = process.argv[2];
const company = process.argv[3];
if (!board || !company) {
  console.error('Usage: ingest-ashby-board.ts <board> <company>');
  process.exit(1);
}

const source = `Ashby: ${company} [${board}]`;
assertAtsSourceAllowed('ashby', board);
const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Array<Record<string, unknown>>;
const previousById = new Map(allJobs.map(job => [String(job.id), job]));

const filtered = allJobs.filter((job) => {
  if (getJobSourceIssue(job)) return false;
  const s = String(job.source || '').toLowerCase();
  return !(s === source.toLowerCase() || s === `ashby: ${company}`.toLowerCase());
});

async function main() {
  await verifyAshbyEmployer(board, company);
  const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}?includeCompensation=true`, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`Ashby HTTP ${res.status}`);
  const data = (await res.json()) as {
    jobs: Array<{
      id: string;
      title: string;
      jobUrl: string;
      publishedAt: string;
      location?: string;
      department?: string;
      team?: string;
      descriptionHtml?: string;
      isListed?: boolean;
      applyUrl?: string;
      compensation?: Parameters<typeof getAshbySalary>[0];
    }>;
  };
  if (!Array.isArray(data.jobs)) throw new Error('Ashby response has no jobs array');

  const store = readJobDescriptionStore();
  const descriptions = { ...store.descriptions };
  const added: Array<Record<string, unknown>> = [];

  for (const job of data.jobs) {
    const title = job.title?.replace(/\s+/g, ' ').trim();
    if (!title || !job.jobUrl || job.isListed === false || !isConcreteJobOpening(title, job.jobUrl)) continue;
    const row: Record<string, unknown> = {
      id: job.id,
      title,
      company,
      link: job.jobUrl,
      date: job.publishedAt || new Date().toISOString(),
      source,
      location: job.location,
      department: job.department || job.team,
      salary: getAshbySalary(job.compensation),
      ...(job.applyUrl && { applyUrl: job.applyUrl }),
      ...(previousById.get(job.id)?.slug && { slug: previousById.get(job.id)!.slug }),
      active: true,
    };
    added.push(row);
    if (job.descriptionHtml?.trim()) {
      descriptions[getJobContentKey(row as never)] = job.descriptionHtml;
    }
  }

  const merged = [...filtered, ...added] as never[];
  const legacyArchive = loadJobLegacyArchive();
  assignJobSlugsAndSyncLegacyArchive(merged, legacyArchive, loadReservedRootSlugsSync(), loadPublishedRootSlugsSync());
  writeJobLegacyArchive(legacyArchive);
  merged.sort(
    (a, b) => new Date(String((b as { date: string }).date)).getTime() - new Date(String((a as { date: string }).date)).getTime(),
  );
  fs.writeFileSync(cachePath, `${JSON.stringify(merged, null, 2)}\n`);
  writeJobDescriptionStore({
    descriptions,
    aliases: { ...store.aliases, ...buildJobDescriptionAliases(merged, descriptions) },
  });
  console.log(`Added ${added.length} ${company} jobs; cache now ${merged.length} jobs`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
