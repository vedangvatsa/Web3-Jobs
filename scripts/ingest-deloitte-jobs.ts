#!/usr/bin/env tsx
/**
 * Deloitte US digital-asset roles on apply.deloitte.com (SuccessFactors).
 * Curated job IDs — refreshed by search on the public careers site in CI.
 */
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import type { Job } from '../src/types';
import { eligibleIngestedJobs } from './lib/job-ingestion-policy';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import { passesWeb3TitleFilter } from '../src/lib/web3-job-classifier';
import { normalizeIngestIsoDate } from './lib/ingest-date-normalize';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

const COMPANY = 'Deloitte';
const BASE = 'https://apply.deloitte.com';

/** Public JobDetail paths (en_US/careers/JobDetail/...). */
const JOB_PATHS = [
  '/en_US/careers/JobDetail/Manager-Digital-Assets-Enterprise-Strategy-Risk-and-Operating-Model-Design-Enterprise-Operations-Risk/350535',
  '/en_US/careers/JobDetail/Senior-Consultant-Digital-Assets-AML-KYC-BSA-Knowledge/354468',
  '/en_US/careers/JobDetail/Digital-Assets-Technical-Architect/353565',
  '/en_US/careers/JobDetail/Transfer-Agency-and-Tokenization-Investment-Management-Senior-Consultant/371658',
  '/en_US/careers/JobDetail/Transfer-Agency-and-Tokenization-Investment-Management-Manager/371671',
];

async function fetchJob(path: string): Promise<{
  title: string;
  html: string;
  postedRaw?: string;
} | null> {
  const link = `${BASE}${path}`;
  const res = await fetch(link, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; hashtagweb3-ingest/1.0)' },
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) return null;
  const page = await res.text();
  const $ = load(page);
  const title =
    $('h1').first().text().replace(/\s+/g, ' ').trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    '';
  const html =
    $('.job-posting, .jobdescription, [data-automation-id="jobPostingDescription"]').first().html() ||
    $('main').html() ||
    '';
  const postedRaw = $('meta[itemprop="datePosted"]').attr('content') || undefined;
  return { title, html, postedRaw };
}

async function main() {
  const root = process.cwd();
  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const previousById = new Map(allJobs.map((j) => [String(j.id), j]));

  const filtered = allJobs.filter((j) => {
    if (j.company !== COMPANY) return true;
    const link = String(j.link || '');
    return !link.includes('apply.deloitte.com');
  });

  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions };
  const added: Job[] = [];

  for (const jobPath of JOB_PATHS) {
    const detail = await fetchJob(jobPath);
    if (!detail?.title) {
      console.warn(`Skip ${jobPath}: no title`);
      continue;
    }
    const link = `${BASE}${jobPath}`;
    const bodyText = detail.html.replace(/<[^>]+>/g, ' ');
    if (!passesWeb3TitleFilter('strict', detail.title, bodyText)) continue;
    if (!isConcreteJobOpening(detail.title, link)) continue;

    const slugPart = jobPath.split('/').pop() || jobPath;
    const id = `deloitte-${slugPart}`;
    const { date, verified: dateOk } = normalizeIngestIsoDate(detail.postedRaw);
    const cleanHtml = detail.html ? sanitizeJobDescriptionHtml(detail.html, COMPANY) : '';

    const jobRow: Job = {
      id,
      title: detail.title,
      company: COMPANY,
      link,
      applyUrl: link,
      date,
      ...(dateOk ? { dateVerified: true, dateSource: 'Deloitte Careers' } : {}),
      source: 'Deloitte Careers [deloitte]',
      active: true,
      ...(previousById.get(id)?.slug && { slug: previousById.get(id)!.slug }),
    };

    added.push(jobRow);
    if (cleanHtml) descriptions[getJobContentKey(jobRow)] = cleanHtml;
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

  console.log(`✓ Deloitte ingest: ${added.length} roles; ${merged.filter((j) => j.company === COMPANY).length} in cache.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});