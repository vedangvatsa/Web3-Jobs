#!/usr/bin/env tsx
/**
 * Ingest Goldman Sachs (Higher / LateralHiring) and JPMorgan Chase (CX_1001)
 * crypto / digital-asset roles via Oracle Candidate Experience REST APIs.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { eligibleIngestedJobs } from './lib/job-ingestion-policy';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

type OracleBoard = {
  company: string;
  host: string;
  siteNumber: string;
  keywords: string[];
  skills: string[];
  sourceLabel: string;
  idPrefix: string;
  jobLink: (reqId: string) => string;
  applyLink: (reqId: string) => string;
  linkHostMatch: string;
};

const ORACLE_BOARDS: OracleBoard[] = [
  {
    company: 'Goldman Sachs',
    host: 'hdpc.fa.us2.oraclecloud.com',
    siteNumber: 'LateralHiring',
    keywords: ['digital asset', 'blockchain'],
    skills: ['Institutional', 'Banking', 'Digital Assets', 'Blockchain', 'Web3'],
    sourceLabel: 'Oracle CE [goldman-lateral]',
    idPrefix: 'gs-oracle',
    jobLink: (id) => `https://higher.gs.com/roles/${id}`,
    applyLink: (id) =>
      `https://hdpc.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/LateralHiring/job/${id}`,
    linkHostMatch: 'higher.gs.com',
  },
  {
    company: 'JPMorgan Chase',
    host: 'jpmc.fa.oraclecloud.com',
    siteNumber: 'CX_1001',
    keywords: ['blockchain', 'crypto'],
    skills: ['Institutional', 'Banking', 'Blockchain', 'Digital Assets', 'Web3'],
    sourceLabel: 'Oracle CE [jpm-cx1001]',
    idPrefix: 'jpm-oracle',
    jobLink: (id) =>
      `https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/job/${id}`,
    applyLink: (id) =>
      `https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/job/${id}`,
    linkHostMatch: 'jpmc.fa.oraclecloud.com',
  },
];

type ReqListItem = {
  Id: string;
  Title?: string;
  PostedDate?: string;
  PrimaryLocation?: string;
  ShortDescriptionStr?: string;
};

type ReqDetail = {
  Id: string;
  Title?: string;
  ExternalPostedStartDate?: string;
  PostedDate?: string;
  PrimaryLocation?: string;
  ExternalDescriptionStr?: string;
  WorkplaceType?: string;
  JobSchedule?: string;
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; hashtagweb3-ingest/1.0)' },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      console.warn(`HTTP ${res.status} for ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`Fetch failed: ${url}`, err);
    return null;
  }
}

function listUrl(board: OracleBoard, keyword: string, offset: number): string {
  const finder = `findReqs;siteNumber=${board.siteNumber},keyword="${keyword}",limit=200,offset=${offset},sortBy=POSTING_DATES_DESC`;
  return `https://${board.host}/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=requisitionList&finder=${encodeURIComponent(finder)}`;
}

function detailUrl(board: OracleBoard, id: string): string {
  const finder = `ById;Id="${id}",siteNumber=${board.siteNumber}`;
  return `https://${board.host}/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails?onlyData=true&expand=all&finder=${encodeURIComponent(finder)}`;
}

async function collectRequisitions(board: OracleBoard): Promise<Map<string, ReqListItem>> {
  const byId = new Map<string, ReqListItem>();
  for (const keyword of board.keywords) {
    console.log(`Searching ${board.company} for "${keyword}"...`);
    let offset = 0;
    let total = Infinity;
    while (offset < total) {
      const data = await fetchJson<{ items: Array<{ TotalJobsCount?: number; requisitionList?: ReqListItem[] }> }>(
        listUrl(board, keyword, offset)
      );
      const block = data?.items?.[0];
      if (!block?.requisitionList?.length) break;
      total = block.TotalJobsCount ?? block.requisitionList.length;
      for (const row of block.requisitionList) {
        if (row?.Id) byId.set(String(row.Id), row);
      }
      offset += block.requisitionList.length;
      if (block.requisitionList.length < 200) break;
    }
  }
  return byId;
}

function pickPostingDate(detail: ReqDetail, listRow?: ReqListItem): { date: string; verified: boolean } {
  const raw = detail.ExternalPostedStartDate || detail.PostedDate || listRow?.PostedDate || '';
  if (!raw) return { date: '', verified: false };
  return { date: raw, verified: true };
}

async function ingestBoard(
  board: OracleBoard,
  previousById: Map<string, Job>,
  descriptions: Record<string, string>
): Promise<Job[]> {
  const listings = await collectRequisitions(board);
  console.log(`Found ${listings.size} unique requisitions for ${board.company}`);
  const added: Job[] = [];

  for (const [reqId, listRow] of listings) {
    const detailData = await fetchJson<{ items: ReqDetail[] }>(detailUrl(board, reqId));
    const detail = detailData?.items?.[0];
    if (!detail) {
      console.warn(`Missing detail for ${board.company} req ${reqId}`);
      continue;
    }

    const title = (detail.Title || listRow.Title || '').replace(/\s+/g, ' ').trim();
    const link = board.applyLink(reqId);
    if (!title || !isConcreteJobOpening(title, link)) continue;

    const location = (detail.PrimaryLocation || listRow.PrimaryLocation || 'Multiple Locations').trim();
    const { date, verified } = pickPostingDate(detail, listRow);
    const id = `${board.idPrefix}-${reqId}`;
    const rawHtml = detail.ExternalDescriptionStr || listRow.ShortDescriptionStr || '';
    const html = rawHtml ? sanitizeJobDescriptionHtml(rawHtml, board.company) : '';

    const jobType =
      detail.WorkplaceType || detail.JobSchedule
        ? [detail.WorkplaceType, detail.JobSchedule].filter(Boolean).join(' · ')
        : 'Full-time';

    const jobRow: Job = {
      id,
      title,
      company: board.company,
      link,
      applyUrl: board.applyLink(reqId),
      date,
      dateVerified: verified,
      ...(verified && { dateSource: 'Oracle Recruiting' }),
      source: board.sourceLabel,
      location,
      type: jobType,
      department: board.company,
      skills: board.skills,
      active: true,
      ...(previousById.get(id)?.slug && { slug: previousById.get(id)!.slug }),
    };

    added.push(jobRow);
    if (html) descriptions[getJobContentKey(jobRow)] = html;
  }

  return added;
}

async function main() {
  const root = process.cwd();
  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const previousById = new Map(allJobs.map((j) => [String(j.id), j]));

  const filtered = allJobs.filter((j) => {
    const link = String(j.link || '');
    const id = String(j.id || '');
    const company = String(j.company || '').toLowerCase();
    const source = String(j.source || '');
    const dropGoldman =
      company === 'goldman sachs' &&
      (link.includes('higher.gs.com') || link.includes('hdpc.fa.us2.oraclecloud.com') || id.startsWith('gs-oracle'));
    const dropJpm =
      company === 'jpmorgan chase' &&
      (link.includes('jpmc.fa.oraclecloud.com') || id.startsWith('jpm-oracle'));
    const dropOracleSource =
      (company === 'goldman sachs' || company === 'jpmorgan chase') && source.includes('Oracle CE [');
    return !(dropGoldman || dropJpm || dropOracleSource);
  });

  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions };
  const added: Job[] = [];

  for (const board of ORACLE_BOARDS) {
    const rows = await ingestBoard(board, previousById, descriptions);
    added.push(...rows);
    console.log(`✓ Ingested ${rows.length} jobs for ${board.company}`);
  }

  const merged = eligibleIngestedJobs([...filtered, ...added]);
  const legacyArchive = loadJobLegacyArchive(root);
  assignJobSlugsAndSyncLegacyArchive(
    merged,
    legacyArchive,
    loadReservedRootSlugsSync(),
    loadPublishedRootSlugsSync()
  );
  writeJobLegacyArchive(legacyArchive, root);

  merged.sort(
    (a, b) => new Date(String(b.date || 0)).getTime() - new Date(String(a.date || 0)).getTime()
  );

  fs.writeFileSync(cachePath, `${JSON.stringify(merged, null, 2)}\n`);
  writeJobDescriptionStore(
    {
      descriptions,
      aliases: { ...store.aliases, ...buildJobDescriptionAliases(merged, descriptions) },
    },
    root
  );

  const gs = merged.filter((j) => j.company === 'Goldman Sachs').length;
  const jpm = merged.filter((j) => j.company === 'JPMorgan Chase').length;
  console.log(
    `✓ Added ${added.length} institutional Oracle jobs (${gs} Goldman Sachs, ${jpm} JPMorgan Chase in cache after age filter); cache total ${merged.length}.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});