#!/usr/bin/env tsx
/**
 * EY blockchain & digital-asset roles via careers.ey.com search + job detail pages.
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
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';
import { normalizeIngestIsoDate } from './lib/ingest-date-normalize';

const COMPANY = 'EY';
const BASE = 'https://careers.ey.com';
const SEARCH_QUERIES = ['blockchain', 'digital assets'];

function decodeEyPath(href: string): string {
  return href
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

async function collectJobPaths(): Promise<string[]> {
  const paths = new Set<string>();
  for (const q of SEARCH_QUERIES) {
    const url = `${BASE}/search/?q=${encodeURIComponent(q)}`;
    console.log(`EY search: ${q}...`);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; hashtagweb3-ingest/1.0)' },
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      console.warn(`EY search HTTP ${res.status}`);
      continue;
    }
    const html = await res.text();
    const matches = html.matchAll(/href="(\/ey\/job\/[^"]+)"/g);
    for (const m of matches) {
      paths.add(decodeEyPath(m[1]));
    }
  }
  return [...paths];
}

function parseEyJobPage(html: string): {
  title: string;
  description: string;
  location?: string;
  postedRaw?: string;
} {
  const $ = load(html);
  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
  const title = ogTitle || $('h1').first().text().replace(/\s+/g, ' ').trim();
  const jobDesc = $('.jobdescription, [class*="jobdescription"]').first().html() || '';
  const location =
    $('meta[property="og:locality"]').attr('content') ||
    $('[data-careers-location], .jobGeoLocation').first().text().trim() ||
    undefined;
  const postedRaw =
    $('meta[itemprop="datePosted"]').attr('content') ||
    $('meta[property="og:posted_date"]').attr('content') ||
    undefined;
  return { title, description: jobDesc, location: location || undefined, postedRaw };
}

async function main() {
  const root = process.cwd();
  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const previousById = new Map(allJobs.map((j) => [String(j.id), j]));

  const filtered = allJobs.filter((j) => {
    if (j.company !== COMPANY) return true;
    const link = String(j.link || '');
    const id = String(j.id || '');
    return !(link.includes('careers.ey.com') || id.startsWith('ey-'));
  });

  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions };
  const paths = await collectJobPaths();
  console.log(`Found ${paths.length} unique EY job paths`);

  const added: Job[] = [];
  for (const jobPath of paths) {
    const link = `${BASE}${jobPath}`;
    const jobId = jobPath.split('/').filter(Boolean).pop() || jobPath;
    const res = await fetch(link, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; hashtagweb3-ingest/1.0)' },
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      console.warn(`Skip ${jobId}: HTTP ${res.status}`);
      continue;
    }
    const html = await res.text();
    const { title, description, location, postedRaw } = parseEyJobPage(html);
    const { date, verified: dateOk } = normalizeIngestIsoDate(postedRaw);
    const bodyText = description.replace(/<[^>]+>/g, ' ');
    if (!passesWeb3TitleFilter('strict', title, bodyText)) continue;
    if (!title || !isConcreteJobOpening(title, link)) continue;

    const id = `ey-${jobId}`;
    const cleanHtml = description
      ? sanitizeJobDescriptionHtml(description, COMPANY)
      : '';

    const jobRow: Job = {
      id,
      title,
      company: COMPANY,
      link,
      applyUrl: link,
      date,
      ...(dateOk ? { dateVerified: true, dateSource: 'EY Careers' } : {}),
      source: 'EY Careers [ey]',
      location,
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

  console.log(`✓ EY ingest: ${added.length} roles; ${merged.filter((j) => j.company === COMPANY).length} in cache.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});