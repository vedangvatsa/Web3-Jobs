#!/usr/bin/env tsx
/**
 * Deloitte and Accenture Web3-adjacent roles via Workday CXS (strict title filter).
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { eligibleIngestedJobs } from './lib/job-ingestion-policy';
import { assignJobSlugsAndSyncLegacyArchive } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';
import { ingestWorkdayWeb3Board, type WorkdayWeb3Board } from './lib/workday-web3-ingest';

/** Deloitte US is SuccessFactors — use scripts/ingest-deloitte-jobs.ts */
const BOARDS: WorkdayWeb3Board[] = [
  {
    company: 'Accenture',
    host: 'https://accenture.wd103.myworkdayjobs.com',
    tenant: 'accenture',
    site: 'AccentureCareers',
    baseUrl: 'https://accenture.wd103.myworkdayjobs.com/en-US/AccentureCareers',
    searchTexts: ['blockchain', 'digital assets'],
    sourceLabel: 'Workday [accenture]',
    idPrefix: 'accenture',
    web3TitlesOnly: 'strict',
    maxListPostings: 80,
    matchLink: (link) => link.includes('accenture.wd103.myworkdayjobs.com'),
  },
];

async function main() {
  const root = process.cwd();
  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const previousById = new Map(allJobs.map((j) => [String(j.id), j]));

  let filtered = allJobs.filter((j) => {
    const id = String(j.id || '');
    const src = String(j.source || '');
    if (j.company === 'Deloitte' && (id.startsWith('deloitte-') || src.includes('Workday [deloitte]'))) return false;
    if (j.company === 'Accenture' && (id.startsWith('accenture-') || src.includes('Workday [accenture]'))) return false;
    return true;
  });

  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions };
  const added: Job[] = [];

  for (const board of BOARDS) {
    console.log(`Ingesting ${board.company}...`);
    try {
      const { jobs, descriptions: newDesc } = await ingestWorkdayWeb3Board(board, previousById);
      Object.assign(descriptions, newDesc);
      added.push(...jobs);
      console.log(`✓ ${jobs.length} roles for ${board.company}`);
    } catch (err) {
      console.warn(`✗ ${board.company} Workday ingest failed:`, err);
    }
  }

  const merged = eligibleIngestedJobs([...filtered, ...added]);
  const legacyArchive = loadJobLegacyArchive(root);
  assignJobSlugsAndSyncLegacyArchive(
    merged,
    legacyArchive,
    loadReservedRootSlugsSync(),
    loadPublishedRootSlugsSync(),
  );
  writeJobLegacyArchive(legacyArchive, root);

  merged.sort(
    (a, b) => new Date(String(b.date || 0)).getTime() - new Date(String(a.date || 0)).getTime(),
  );

  fs.writeFileSync(cachePath, `${JSON.stringify(merged, null, 2)}\n`);
  writeJobDescriptionStore(
    {
      descriptions,
      aliases: { ...store.aliases, ...buildJobDescriptionAliases(merged, descriptions) },
    },
    root,
  );

  const dt = merged.filter((j) => j.company === 'Deloitte').length;
  const ac = merged.filter((j) => j.company === 'Accenture').length;
  console.log(`✓ Deloitte/Accenture ingest: added ${added.length}; cache has ${dt} Deloitte, ${ac} Accenture.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});