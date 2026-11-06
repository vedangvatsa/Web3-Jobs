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

const board = process.argv[2];
const company = process.argv[3];
let identifier = process.argv[4];

if (!board || !company) {
  console.error('Usage: ingest-keka-board.ts <board> <company> [identifier]');
  process.exit(1);
}

assertAtsSourceAllowed('keka', board);

interface KekaLocation {
  id?: number;
  name?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  countryName?: string;
}

interface KekaSalaryRange {
  minimum?: number;
  maximum?: number;
  currency?: string;
  salaryPeriod?: number;
}

interface KekaJob {
  id: number;
  title: string;
  description: string;
  departmentIdentifier?: string;
  departmentName?: string;
  excerpt?: string;
  jobLocations?: KekaLocation[];
  jobType?: number;
  experience?: string;
  jobNumber?: string;
  salaryRange?: KekaSalaryRange;
  salaryRangeFormat?: string;
  publishedOn: string;
}

function cleanKekaDescriptionHtml(rawHtml: string, companyName: string): string {
  let html = rawHtml
    .replace(/\s*style="[^"]*"/gi, '')
    .replace(/<span\s*>(.*?)<\/span>/gi, '$1')
    .replace(/<(div|p)>\s*<strong>\s*([^<]+?)\s*<\/strong>\s*<\/\1>/gi, '<h3>$2</h3>')
    .replace(/<(div|p)>\s*(?:<br\s*\/?>)?\s*<\/\1>/gi, '')
    .trim();

  if (companyName.toLowerCase() === 'bitoasis' && !/BitOasis is/i.test(html.slice(0, 300))) {
    const intro = '<p><strong>About BitOasis:</strong> BitOasis is the leading cryptocurrency trading platform in the Middle East and North Africa (MENA), providing secure trading, liquidity, and OTC execution across the GCC region.</p>';
    html = `${intro}\n\n${html}`;
  } else if ((companyName.toLowerCase() === 'liminal' || companyName.toLowerCase() === 'liminal custody') && !/Liminal (is|provides|delivers)/i.test(html.slice(0, 300))) {
    const intro = '<p><strong>About Liminal Custody:</strong> Liminal Custody is an enterprise-grade digital asset custody and wallet infrastructure platform providing automated treasury operations, multi-signature transaction policy controls, and institutional security for financial institutions across APAC and MENA.</p>';
    html = `${intro}\n\n${html}`;
  }

  return sanitizeJobDescriptionHtml(html, companyName);
}

function resolveJobLocation(job: KekaJob): { location: string; isRemote?: boolean } {
  const loc = job.jobLocations?.[0];
  const country = loc?.countryName?.toLowerCase() || '';
  const city = loc?.city?.trim() || '';
  const name = loc?.name?.toLowerCase() || '';

  if (name.includes('work from home') || city.toLowerCase().includes('work from home')) {
    if (country.includes('india') || loc?.countryCode === 'IN') {
      return { location: 'Remote, India', isRemote: true };
    }
    if (country.includes('indonesia') || loc?.countryCode === 'ID') {
      return { location: 'Remote, Indonesia', isRemote: true };
    }
    return { location: 'Remote', isRemote: true };
  }

  if (country.includes('emirates') || country.includes('uae') || loc?.countryCode === 'AE' || city.toLowerCase() === 'dubai') {
    return { location: 'Dubai, United Arab Emirates' };
  }
  if (country.includes('jordan') || loc?.countryCode === 'JO' || city.toLowerCase() === 'amman' || job.salaryRange?.currency === 'JOD') {
    return { location: 'Amman, Jordan' };
  }
  if (country.includes('bahrain') || loc?.countryCode === 'BA' || loc?.countryCode === 'BH' || city.toLowerCase() === 'manama' || job.salaryRange?.currency === 'BHD') {
    return { location: 'Manama, Bahrain' };
  }
  if (country.includes('india') || loc?.countryCode === 'IN' || city.toLowerCase().includes('bangalore') || city.toLowerCase().includes('bengaluru')) {
    return { location: 'Bengaluru, India' };
  }
  if (country.includes('taiwan') || loc?.countryCode === 'TW' || city.toLowerCase().includes('taipei')) {
    return { location: 'Taipei, Taiwan' };
  }
  if (country.includes('indonesia') || loc?.countryCode === 'ID' || city.toLowerCase().includes('jakarta')) {
    return { location: 'Jakarta, Indonesia' };
  }
  if (city && loc?.countryName) {
    return { location: `${city}, ${loc.countryName}` };
  }
  if (loc?.name?.trim()) {
    return { location: loc.name.trim() };
  }
  return { location: 'Remote' };
}

function formatSalary(job: KekaJob): string | undefined {
  if (!job.salaryRangeFormat) return undefined;
  const cleanRange = job.salaryRangeFormat.replace(/\.00/g, '').replace(/\s+/g, ' ').trim();
  if (/AED|BHD|JOD|SAR|QAR/i.test(cleanRange)) {
    return `${cleanRange}/month`;
  }
  return cleanRange;
}

async function resolveOrgIdentifier(boardSlug: string): Promise<string> {
  const careersUrl = `https://${boardSlug}.keka.com/careers/`;
  const res = await fetch(careersUrl, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) {
    throw new Error(`Keka careers page HTTP ${res.status} for ${careersUrl}`);
  }
  const html = await res.text();
  const match =
    html.match(/\/ats\/documents\/([a-f0-9-]+)\/careerportal/i) ||
    html.match(/identifier:\s*['"]([a-f0-9-]+)['"]/i);
  if (!match) {
    throw new Error(`Unable to resolve Keka org identifier from ${careersUrl}`);
  }
  return match[1];
}

async function main() {
  const root = process.cwd();
  if (!identifier) {
    console.log(`Resolving Keka organization identifier for board "${board}"...`);
    identifier = await resolveOrgIdentifier(board);
    console.log(`Resolved identifier: ${identifier}`);
  }

  const activeJobsUrl = `https://${board}.keka.com/careers/api/embedjobs/default/active/${identifier}`;
  console.log(`Fetching active Keka jobs from ${activeJobsUrl}...`);
  const res = await fetch(activeJobsUrl, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) {
    throw new Error(`Failed to fetch Keka jobs: HTTP ${res.status}`);
  }

  const kekaJobs = (await res.json()) as KekaJob[];
  console.log(`Fetched ${kekaJobs.length} active jobs from Keka portal.`);

  const source = `Keka: ${company} [${board}]`;
  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const previousByLink = new Map(allJobs.map((j) => [j.link, j]));
  const previousById = new Map(allJobs.map((j) => [String(j.id), j]));

  // Remove previous jobs from this source/company
  const filtered = allJobs.filter((j) => {
    if (getJobSourceIssue(j)) return false;
    const s = String(j.source || '').toLowerCase();
    const link = String(j.link || '').toLowerCase();
    const isThisSource = s === source.toLowerCase() || s === `keka: ${company}`.toLowerCase();
    const isBitOasisLegacy = company.toLowerCase() === 'bitoasis' && (s.includes('bitoasis') || link.includes('dcx.keka.com'));
    const isLiminalLegacy = (company.toLowerCase() === 'liminal' || company.toLowerCase() === 'liminal custody') && (s.includes('liminal') || link.includes('liminal.keka.com'));
    return !isThisSource && !isBitOasisLegacy && !isLiminalLegacy;
  });

  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions };
  const added: Job[] = [];

  for (const kj of kekaJobs) {
    // If multi-tenant board like dcx, filter by company
    if (board === 'dcx' && company.toLowerCase() === 'bitoasis') {
      const isBO = String(kj.jobNumber || '').includes('BO') || String(kj.departmentName || '').includes('BO');
      if (!isBO) continue;
    }

    const title = kj.title.replace(/\s+/g, ' ').trim();
    const link = `https://${board}.keka.com/careers/jobdetails/${kj.id}`;

    if (!isConcreteJobOpening(title, link)) {
      console.warn(`Disqualified non-concrete job: ${kj.id} ${title}`);
      continue;
    }

    const locResult = resolveJobLocation(kj);
    const existing = previousByLink.get(link) || previousById.get(`keka-${board}-${kj.id}`) || previousById.get(`${company.toLowerCase()}-keka-${kj.id}`);
    const id = existing ? existing.id : `keka-${board}-${kj.id}`;
    const cleanHtml = cleanKekaDescriptionHtml(kj.description, company);
    const department = kj.departmentName?.replace(/^(?:BO|DCX)\s*-\s*/i, '').trim() || 'Engineering';
    const salary = formatSalary(kj);
    const date = new Date(kj.publishedOn).toISOString();

    const jobRow: Job = {
      id,
      title,
      company,
      link,
      location: locResult.location,
      ...(locResult.isRemote && { isRemote: true }),
      department,
      type: 'Full-time',
      date,
      dateVerified: true,
      dateSource: 'Keka.JobPosting.publishedOn',
      source,
      applyUrl: link,
      active: true,
      ...(salary && { salary }),
      ...(existing?.slug && { slug: existing.slug }),
    };

    added.push(jobRow);
    if (cleanHtml.trim()) {
      descriptions[getJobContentKey(jobRow)] = cleanHtml;
    }
  }

  const merged = eligibleIngestedJobs([...filtered, ...added] as Job[]);
  const legacyArchive = loadJobLegacyArchive();
  assignJobSlugsAndSyncLegacyArchive(
    merged,
    legacyArchive,
    loadReservedRootSlugsSync(),
    loadPublishedRootSlugsSync(),
  );
  writeJobLegacyArchive(legacyArchive);

  merged.sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime());
  fs.writeFileSync(cachePath, `${JSON.stringify(merged, null, 2)}\n`);

  writeJobDescriptionStore({
    descriptions,
    aliases: { ...store.aliases, ...buildJobDescriptionAliases(merged, descriptions) },
  });

  console.log(`✓ Added ${added.length} ${company} jobs from Keka [${board}]; cache now ${merged.length} jobs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
