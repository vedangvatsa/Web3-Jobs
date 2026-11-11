#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { eligibleIngestedJobs } from './lib/job-ingestion-policy';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { assertAtsSourceAllowed, getJobSourceIssue } from '../src/lib/job-source-policy';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

const board = process.argv[2] || 'dfns';
const company = process.argv[3] || 'DFNS';
const website = process.argv[4] || 'https://dfns.co';

if (!board || !company) {
  console.error('Usage: ingest-deel-board.ts <board> <company> [website]');
  process.exit(1);
}

const source = `Deel: ${company} [${board}]`;
assertAtsSourceAllowed('deel', board);

const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Array<Record<string, unknown>>;
const previousById = new Map(allJobs.map((job) => [String(job.id), job]));

const filtered = allJobs.filter((job) => {
  if (getJobSourceIssue(job)) return false;
  const s = String(job.source || '').toLowerCase();
  return !(s === source.toLowerCase() || s === `deel: ${company}`.toLowerCase());
});

interface DeelLocation {
  id?: string;
  location?: {
    name?: string;
    country?: {
      code?: string;
      name?: string;
    };
  };
}

interface DeelPosting {
  id: string;
  title: string;
  richtextDescription?: string;
  createdAt: string;
  updatedAt: string;
  job?: {
    workArrangementEnum?: 'REMOTE' | 'HYBRID' | 'IN_PERSON';
    jobLocations?: DeelLocation[];
    currentCompensation?: {
      currencyIsoCode?: string;
      minAmount?: number;
      maxAmount?: number;
    };
    jobTeams?: Array<{ team?: { name?: string } }>;
    jobDepartments?: Array<{ department?: { name?: string } }>;
  };
}

function formatSalary(comp?: DeelPosting['job']['currentCompensation']): string | undefined {
  if (!comp || !comp.minAmount || !comp.maxAmount || !comp.currencyIsoCode) return undefined;
  const formatK = (amt: number) => (amt >= 1000 ? `${Math.round(amt / 1000)}k` : `${amt}`);
  const symbol = comp.currencyIsoCode === 'USD' ? '$' : comp.currencyIsoCode === 'EUR' ? '€' : `${comp.currencyIsoCode} `;
  return `${symbol}${formatK(comp.minAmount)} – ${symbol}${formatK(comp.maxAmount)}/yr`;
}

function cleanDescriptionHtml(html: string): string {
  return html
    .replace(/<p><\/p>/gi, '')
    .replace(/<p>\s*<\/p>/gi, '')
    .trim();
}

async function main() {
  console.log(`[ingest-deel-board] Fetching jobs.deel.com/${board}...`);
  const res = await fetch(`https://jobs.deel.com/${encodeURIComponent(board)}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HashtagWeb3JobIngest/1.0)' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Deel HTTP ${res.status}`);
  const html = await res.text();

  // Reconstruct Next.js RSC payload
  const lines = html.match(/self\.__next_f\.push\(\[1,"(.*?)"\]\)/gs) || [];
  let allText = '';
  for (const line of lines) {
    const m = line.match(/self\.__next_f\.push\(\[1,"(.*)"\]\)/s);
    if (m) {
      try {
        allText += JSON.parse(`"${m[1]}"`);
      } catch {
        allText += m[1];
      }
    }
  }

  // Extract description chunks (hexKey:T...)
  const chunkRegex = /([0-9a-f]+):T[0-9a-f]+,(<h2>.*?)(?=(?:[0-9a-f]+:T[0-9a-f]+,|[0-9a-f]+:\[|\n[0-9a-f]+:|$))/gs;
  let match: RegExpExecArray | null;
  const descriptionsByHex: Record<string, string> = {};
  while ((match = chunkRegex.exec(allText)) !== null) {
    descriptionsByHex[match[1]] = match[2];
  }

  // Extract jobPostings array
  const postMatch = allText.match(/"jobPostings":\s*(\[.*?\])\s*,\s*"orgSlug"/s);
  if (!postMatch) throw new Error('Could not find jobPostings array in Deel page');
  const jobPostings = JSON.parse(postMatch[1]) as DeelPosting[];

  console.log(`[ingest-deel-board] Found ${jobPostings.length} job postings on Deel board '${board}'`);

  const store = readJobDescriptionStore();
  const descriptions = { ...store.descriptions };
  const added: Array<Record<string, unknown>> = [];

  for (const p of jobPostings) {
    const title = p.title?.replace(/\s+/g, ' ').trim();
    const applyUrl = `https://jobs.deel.com/${board}/job-details/${p.id}/overview`;
    if (!title || !isConcreteJobOpening(title, applyUrl)) continue;

    const isRemote = p.job?.workArrangementEnum === 'REMOTE';
    const locNames = (p.job?.jobLocations || []).map((l) => l.location?.name).filter(Boolean);
    const location = isRemote ? 'Remote' : locNames.join(', ') || 'Remote';
    const workplaceType = isRemote
      ? 'Remote'
      : p.job?.workArrangementEnum === 'HYBRID'
        ? 'Hybrid'
        : 'On-site';

    const team = p.job?.jobTeams?.[0]?.team?.name || p.job?.jobDepartments?.[0]?.department?.name || 'Engineering';
    const salary = formatSalary(p.job?.currentCompensation);

    // Keep source date as original published / updated date
    const date = p.updatedAt || p.createdAt || new Date().toISOString();

    const row: Record<string, unknown> = {
      id: `deel-${board}-${p.id}`,
      title,
      company,
      link: applyUrl,
      date,
      dateVerified: true,
      dateSource: `${company} Careers on Deel`,
      source,
      location,
      department: team,
      isRemote,
      workplaceType,
      active: true,
      ...(salary && { salary }),
      ...(p.job?.currentCompensation?.minAmount && {
        minSalary: p.job.currentCompensation.minAmount,
        maxSalary: p.job.currentCompensation.maxAmount,
        currency: p.job.currentCompensation.currencyIsoCode || 'USD',
      }),
      ...(previousById.get(`deel-${board}-${p.id}`)?.slug && {
        slug: previousById.get(`deel-${board}-${p.id}`)!.slug,
      }),
    };

    added.push(row);

    const ref = p.richtextDescription ? p.richtextDescription.replace('$', '') : '';
    const rawHtml = descriptionsByHex[ref];
    if (rawHtml) {
      descriptions[getJobContentKey(row as never)] = sanitizeJobDescriptionHtml(cleanDescriptionHtml(rawHtml));
    }
  }

  const merged = eligibleIngestedJobs([...filtered, ...added] as never[]);
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

  console.log(`[ingest-deel-board] Added ${added.length} ${company} jobs; total catalog now ${merged.length} jobs.`);
}

main().catch((err) => {
  console.error('[ingest-deel-board] Error:', err);
  process.exit(1);
});
