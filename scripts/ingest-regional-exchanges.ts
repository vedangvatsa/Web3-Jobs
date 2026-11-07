#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import Parser from 'rss-parser';
import type { Job } from '../src/types';
import { eligibleIngestedJobs } from './lib/job-ingestion-policy';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { cleanJobLocation } from '../src/lib/job-location';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

function cleanTitle(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>?/gm, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchBambooJobs(board: string, company: string): Promise<{ jobs: Job[]; descriptions: Record<string, string> }> {
  const jobs: Job[] = [];
  const descriptions: Record<string, string> = {};

  const listRes = await fetch(`https://${board}.bamboohr.com/careers/list`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HashtagWeb3/1.0)' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!listRes.ok) throw new Error(`HTTP ${listRes.status} for ${board} list`);
  const listData = (await listRes.json()) as {
    result?: Array<{
      id: string;
      jobOpeningName: string;
      departmentLabel?: string;
      atsLocation?: { city?: string | null; state?: string | null; country?: string | null };
      location?: { city?: string | null; state?: string | null; postalCode?: string | null; addressCountry?: string | null; country?: string | null };
      isRemote?: boolean;
      locationType?: string | number;
    }>;
  };

  const openings = (listData.result || []).filter((op) => isConcreteJobOpening(op.jobOpeningName));

  for (const op of openings) {
    try {
      const detailRes = await fetch(`https://${board}.bamboohr.com/careers/${op.id}/detail`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HashtagWeb3/1.0)' },
        signal: AbortSignal.timeout(10_000),
      });
      if (!detailRes.ok) continue;
      const detailData = (await detailRes.json()) as {
        result?: {
          jobOpening?: {
            jobOpeningName?: string;
            jobOpeningShareUrl?: string;
            departmentLabel?: string;
            description?: string;
            datePosted?: string;
            atsLocation?: { city?: string | null; state?: string | null; country?: string | null };
            location?: { city?: string | null; state?: string | null; postalCode?: string | null; addressCountry?: string | null; country?: string | null };
            isRemote?: boolean;
            locationType?: string | number;
          };
        };
      };
      const detail = detailData.result?.jobOpening;
      const title = cleanTitle(detail?.jobOpeningName || op.jobOpeningName);
      const link = detail?.jobOpeningShareUrl || `https://${board}.bamboohr.com/careers/${op.id}`;
      if (!title || !link || !isConcreteJobOpening(title, link)) continue;

      const loc = detail?.location?.city || (detail?.location as any)?.addressCountry
        ? detail.location
        : detail?.atsLocation?.city || detail?.atsLocation?.country
        ? detail.atsLocation
        : op?.location?.city || (op?.location as any)?.addressCountry
        ? op.location
        : op.atsLocation;
      const city = loc?.city;
      const state = loc?.state;
      const country = loc?.country || (loc as any)?.addressCountry;
      let rawLoc = [city, state, country].filter(Boolean).join(', ');
      if (!rawLoc && (detail?.locationType === 1 || (detail as any)?.locationType === '1' || op?.locationType === '1' || (op as any)?.locationType === 1 || detail?.isRemote || op?.isRemote)) {
        rawLoc = 'Remote';
      }
      const location = rawLoc ? cleanJobLocation(rawLoc) : undefined;
      const date = detail?.datePosted || '';

      const job: Job = {
        id: String(op.id),
        title,
        company,
        link,
        date,
        dateVerified: Boolean(date),
        dateSource: 'BambooHR.careers.datePosted',
        source: `BambooHR: ${company} [${board}]`,
        location,
        department: detail?.departmentLabel || op.departmentLabel || 'Operations',
        active: true,
      };

      jobs.push(job);

      if (detail?.description) {
        descriptions[getJobContentKey(job)] = sanitizeJobDescriptionHtml(detail.description, company);
      }
    } catch (err: any) {
      console.warn(`  ⚠️ Failed detail for ${board} #${op.id}:`, err.message);
    }
  }

  return { jobs, descriptions };
}

async function fetchTeamtailorJobs(board: string, company: string, url: string): Promise<{ jobs: Job[]; descriptions: Record<string, string> }> {
  const jobs: Job[] = [];
  const descriptions: Record<string, string> = {};

  const parser = new Parser({
    customFields: {
      item: [
        ['remoteStatus', 'remoteStatus'],
        ['tt:department', 'department'],
        ['tt:locations', 'locations'],
      ],
    },
  });

  const feed = await parser.parseURL(url);
  for (const item of feed.items) {
    const title = cleanTitle(item.title);
    const link = item.link;
    if (!title || !link || !isConcreteJobOpening(title, link)) continue;

    const anyItem = item as any;
    let locStr = '';
    const locObj = anyItem.locations?.['tt:location']?.[0];
    const city = locObj?.['tt:city']?.[0];
    const country = locObj?.['tt:country']?.[0];
    if (city && country) {
      locStr = anyItem.remoteStatus === 'fully' ? `${city}, ${country} (Remote)` : `${city}, ${country}`;
    } else if (country) {
      locStr = anyItem.remoteStatus === 'fully' ? `${country} (Remote)` : country;
    } else if (anyItem.remoteStatus === 'fully') {
      locStr = 'Remote';
    }
    const location = locStr ? cleanJobLocation(locStr) : undefined;
    const date = item.isoDate || '';

    const job: Job = {
      id: item.guid || link,
      title,
      company,
      link,
      date,
      dateVerified: Boolean(date),
      dateSource: 'Teamtailor.jobs.rss',
      source: `Teamtailor: ${company} [${board}]`,
      location,
      department: anyItem.department?.trim() || 'Operations',
      active: true,
    };

    jobs.push(job);

    if (item.content) {
      descriptions[getJobContentKey(job)] = sanitizeJobDescriptionHtml(item.content, company);
    }
  }

  return { jobs, descriptions };
}

async function main() {
  const cachePath = path.resolve(process.cwd(), 'content/jobs-cache.json');
  const existingJobs: Job[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const companiesToIngest = ['Bitso', 'Ripio', 'Fasset'];
  const companiesLower = new Set(companiesToIngest.map((c) => c.toLowerCase()));

  // Retain legacy slugs for existing jobs of these companies
  const previousById = new Map<string, Job>();
  for (const j of existingJobs) {
    if (companiesLower.has((j.company || '').toLowerCase())) {
      previousById.set(j.id, j);
    }
  }

  // Filter out existing jobs for these companies
  const filtered = existingJobs.filter((j) => !companiesLower.has((j.company || '').toLowerCase()));

  const store = readJobDescriptionStore();
  const descriptions = { ...store.descriptions };

  const newJobs: Job[] = [];

  // 1. Bitso (BambooHR)
  console.log('Fetching Bitso jobs from BambooHR...');
  try {
    const bitso = await fetchBambooJobs('bitso', 'Bitso');
    console.log(`Received ${bitso.jobs.length} Bitso jobs.`);
    for (const j of bitso.jobs) {
      if (previousById.has(j.id)) j.slug = previousById.get(j.id)!.slug;
      newJobs.push(j);
    }
    Object.assign(descriptions, bitso.descriptions);
  } catch (err: any) {
    console.warn(`Failed to fetch Bitso: ${err.message}`);
  }

  // 2. Ripio (Teamtailor)
  console.log('Fetching Ripio jobs from Teamtailor...');
  try {
    const ripio = await fetchTeamtailorJobs('ripio', 'Ripio', 'https://ripio.teamtailor.com/jobs.rss');
    console.log(`Received ${ripio.jobs.length} Ripio jobs.`);
    for (const j of ripio.jobs) {
      if (previousById.has(j.id)) j.slug = previousById.get(j.id)!.slug;
      newJobs.push(j);
    }
    Object.assign(descriptions, ripio.descriptions);
  } catch (err: any) {
    console.warn(`Failed to fetch Ripio: ${err.message}`);
  }

  // 3. Fasset (BambooHR)
  console.log('Fetching Fasset jobs from BambooHR...');
  try {
    const fasset = await fetchBambooJobs('fasset', 'Fasset');
    console.log(`Received ${fasset.jobs.length} Fasset jobs.`);
    for (const j of fasset.jobs) {
      if (previousById.has(j.id)) j.slug = previousById.get(j.id)!.slug;
      newJobs.push(j);
    }
    Object.assign(descriptions, fasset.descriptions);
  } catch (err: any) {
    console.warn(`Failed to fetch Fasset: ${err.message}`);
  }

  // Assign slugs to all new jobs
  const legacyArchive = loadJobLegacyArchive();
  const reservedSlugs = loadReservedRootSlugsSync();
  const publishedSlugs = loadPublishedRootSlugsSync();

  assignJobSlugsAndSyncLegacyArchive(newJobs, legacyArchive, reservedSlugs, publishedSlugs);
  writeJobLegacyArchive(legacyArchive);

  // Filter merged set using thirty-day policy
  const merged = eligibleIngestedJobs([...filtered, ...newJobs]);
  assignJobSlugsAndSyncLegacyArchive(merged, legacyArchive, reservedSlugs, publishedSlugs);
  writeJobLegacyArchive(legacyArchive);

  merged.sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime());
  fs.writeFileSync(cachePath, `${JSON.stringify(merged, null, 2)}\n`);

  writeJobDescriptionStore({
    descriptions,
    aliases: { ...store.aliases, ...buildJobDescriptionAliases(merged, descriptions) },
  });

  const activeRegional = merged.filter((j) => companiesLower.has((j.company || '').toLowerCase()));
  console.log(`\n✅ Ingested ${newJobs.length} regional exchange jobs (${activeRegional.length} active within 30 days).`);
  console.log(`Cache now contains ${merged.length} total jobs.`);
  activeRegional.forEach((j) => {
    console.log(` - [/${j.slug}] ${j.company}: ${j.title} (${j.location}) posted ${j.date}`);
  });
}

main().catch((err) => {
  console.error('Fatal error in regional exchange ingest:', err);
  process.exit(1);
});
