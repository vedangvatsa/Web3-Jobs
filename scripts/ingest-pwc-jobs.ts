#!/usr/bin/env tsx
/**
 * PwC digital-asset and blockchain roles via public Workday CXS (strict web3 title filter).
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { eligibleIngestedJobs } from './lib/job-ingestion-policy';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';
import {
  ingestWorkdayWeb3Board,
  stripPriorIngest,
  type WorkdayWeb3Board,
} from './lib/workday-web3-ingest';

const PWC_BOARDS: WorkdayWeb3Board[] = [
  {
    company: 'PwC',
    host: 'https://pwc.wd3.myworkdayjobs.com',
    tenant: 'pwc',
    site: 'US_Experienced_Careers',
    baseUrl: 'https://pwc.wd3.myworkdayjobs.com/en-US/US_Experienced_Careers',
    searchTexts: ['blockchain', 'digital assets crypto'],
    sourceLabel: 'Workday [pwc-us]',
    idPrefix: 'pwc-us',
    web3TitlesOnly: 'strict',
    matchLink: (link) => link.includes('pwc.wd3.myworkdayjobs.com'),
  },
  {
    company: 'PwC',
    host: 'https://pwc.wd3.myworkdayjobs.com',
    tenant: 'pwc',
    site: 'Global_Experienced_Careers',
    baseUrl: 'https://pwc.wd3.myworkdayjobs.com/en-US/Global_Experienced_Careers',
    searchTexts: ['blockchain', 'digital assets'],
    sourceLabel: 'Workday [pwc-global]',
    idPrefix: 'pwc-global',
    web3TitlesOnly: 'strict',
    matchLink: (link) => link.includes('pwc.wd3.myworkdayjobs.com'),
  },
];

async function main() {
  const root = process.cwd();
  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const previousById = new Map(allJobs.map((j) => [String(j.id), j]));

  let filtered = stripPriorIngest(allJobs, 'PwC', (link) => link.includes('myworkdayjobs.com') || link.includes('pwc.wd3'));
  filtered = filtered.filter((j) => {
    const id = String(j.id || '');
    return !(j.company === 'PwC' && (id.startsWith('pwc-') || String(j.source || '').includes('Workday [pwc')));
  });

  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions };
  const added: Job[] = [];

  for (const board of PWC_BOARDS) {
    console.log(`Ingesting ${board.company} (${board.site})...`);
    const { jobs, descriptions: newDesc } = await ingestWorkdayWeb3Board(board, previousById);
    Object.assign(descriptions, newDesc);
    added.push(...jobs);
    console.log(`✓ ${jobs.length} roles from ${board.site}`);
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

  console.log(`✓ PwC ingest complete: ${added.length} new rows; ${merged.filter((j) => j.company === 'PwC').length} PwC jobs in cache.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});