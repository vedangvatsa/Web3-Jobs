#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
import { loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
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
const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Array<Record<string, unknown>>;

const filtered = allJobs.filter((job) => {
  const s = String(job.source || '').toLowerCase();
  return !(s === source.toLowerCase() || s === `ashby: ${company}`.toLowerCase());
});

async function main() {
  const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}`);
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
    }>;
  };

  const store = readJobDescriptionStore();
  const descriptions = { ...store.descriptions };
  const added: Array<Record<string, unknown>> = [];

  for (const job of data.jobs) {
    const title = job.title?.replace(/\s+/g, ' ').trim();
    if (!title || !job.jobUrl) continue;
    const row: Record<string, unknown> = {
      id: job.id,
      title,
      company,
      link: job.jobUrl,
      date: job.publishedAt || new Date().toISOString(),
      source,
      location: job.location,
      department: job.department || job.team,
      active: true,
    };
    added.push(row);
    if (job.descriptionHtml?.trim()) {
      descriptions[getJobContentKey(row as never)] = job.descriptionHtml;
    }
  }

  const merged = [...filtered, ...added] as never[];
  const legacyArchive = loadJobLegacyArchive();
  assignJobSlugsAndSyncLegacyArchive(merged, legacyArchive, loadReservedRootSlugsSync());
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
