#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
import { extractSalaryLabelFromContent } from '../src/lib/job-salary';
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
  console.error('Usage: ingest-greenhouse-board.ts <board> <company>');
  process.exit(1);
}

const source = `Greenhouse: ${company} [${board}]`;
const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Array<Record<string, unknown>>;

function cleanTitle(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return text
    .replace(/<[^>]*>?/gm, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const filtered = allJobs.filter((job) => {
  const s = String(job.source || '').toLowerCase();
  return !(s === source.toLowerCase() || s === `greenhouse: ${company}`.toLowerCase());
});

async function main() {
  const res = await fetch(
    `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=true`,
  );
  if (!res.ok) throw new Error(`Greenhouse HTTP ${res.status}`);
  const data = (await res.json()) as {
    jobs: Array<{
      title: string;
      absolute_url: string;
      id: number;
      updated_at: string;
      first_published: string;
      content?: string;
      location?: { name?: string };
      departments?: Array<{ name?: string }>;
      metadata?: Array<{ name: string; value: string }>;
    }>;
  };

  const store = readJobDescriptionStore();
  const descriptions = { ...store.descriptions };
  const added: Array<Record<string, unknown>> = [];

  for (const job of data.jobs) {
    const title = cleanTitle(job.title);
    const link = job.absolute_url;
    const dept = job.metadata?.find((m) => m.name === 'Careersite Department (for job postings)')?.value;
    if (dept === 'Do Not Post') continue;
    if (!link || !title || title.length > 180 || title.toLowerCase().includes('bounty')) continue;
    if (!isConcreteJobOpening(title, link)) continue;

    const date = job.first_published || job.updated_at;
    const salary = job.content ? extractSalaryLabelFromContent(job.content) : undefined;
    const row: Record<string, unknown> = {
      id: String(job.id),
      title,
      company,
      link,
      date: date || new Date().toISOString(),
      source,
      location: job.location?.name,
      department: job.departments?.[0]?.name || dept,
      active: true,
      ...(salary ? { salary } : {}),
    };
    added.push(row);
    if (job.content?.trim()) {
      descriptions[getJobContentKey(row as never)] = job.content;
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
  console.log(
    `Added ${added.length} ${company} jobs (${data.jobs.length} on board); cache now ${merged.length} jobs`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
