#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { eligibleIngestedJobs } from './lib/job-ingestion-policy';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { normalizeSourcePostingDate } from '../src/lib/job-source-date';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

interface ComeetPosting {
  uid: string;
  name: string;
  department?: string;
  employment_type?: string;
  experience_level?: string;
  workplace_type?: string;
  time_updated?: string;
  url_active_page?: string;
  url_comeet_hosted_page?: string;
  location?: {
    name?: string;
    city?: string;
    country?: string;
    state?: string;
    is_remote?: boolean;
  };
  details?: Array<{
    name?: string;
    value?: string;
    order?: number;
  }>;
}

const COUNTRY_NAMES: Record<string, string> = {
  IL: 'Israel',
  GB: 'United Kingdom',
  US: 'United States',
  SG: 'Singapore',
};

function formatLocation(posting: ComeetPosting): string {
  const isRemote = posting.workplace_type === 'Remote' || posting.location?.is_remote;
  const isHybrid = posting.workplace_type === 'Hybrid';
  const city = (posting.location?.city || '').trim();
  const locationName = (posting.location?.name || '').trim();
  const countryCode = (posting.location?.country || '').trim().toUpperCase();
  const country = COUNTRY_NAMES[countryCode] || countryCode;

  const placeParts: string[] = [];
  if (city) {
    placeParts.push(city);
  } else if (locationName && locationName.toLowerCase() !== country.toLowerCase() && locationName.toUpperCase() !== countryCode && locationName.toUpperCase() !== 'UK') {
    placeParts.push(locationName);
  }
  if (country && !placeParts.some((p) => p.toLowerCase() === country.toLowerCase() || (countryCode && p.toUpperCase() === countryCode))) {
    placeParts.push(country);
  }

  const place = placeParts.join(', ');
  if (isRemote) {
    return place ? `Remote / ${place}` : 'Remote';
  }
  if (isHybrid && place) {
    return `Hybrid / ${place}`;
  }
  return place || 'Remote';
}

function cleanTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim();
}

async function main() {
  const cachePath = path.resolve(process.cwd(), 'content/jobs-cache.json');
  const existingJobs: Job[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  const previousById = new Map<string, Job>();
  for (const j of existingJobs) {
    if (j.company?.toLowerCase() === 'hypernative') {
      previousById.set(j.id, j);
    }
  }

  // Remove existing Hypernative jobs from the cache before ingesting
  const filtered = existingJobs.filter((j) => j.company?.toLowerCase() !== 'hypernative');

  const store = readJobDescriptionStore();
  const descriptions = { ...store.descriptions };

  const url = 'https://www.comeet.co/careers-api/2.0/company/8A.00E/positions?token=A8E49E234C634C62A385EFE49E22A38A8E151C&details=true';
  console.log(`Fetching Hypernative postings from Comeet API...`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HashtagWeb3/1.0)' },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Comeet jobs: HTTP ${res.status}`);
  }

  const postings = (await res.json()) as ComeetPosting[];
  console.log(`Received ${postings.length} postings from Comeet.`);

  const allHypernativeJobs: Job[] = [];

  for (const posting of postings) {
    const rawTitle = posting.name || '';
    const title = cleanTitle(rawTitle);
    const link = posting.url_active_page || posting.url_comeet_hosted_page;
    if (!title || !link || !isConcreteJobOpening(title)) {
      console.log(`Skipping opening: ${rawTitle}`);
      continue;
    }

    const date = normalizeSourcePostingDate(posting.time_updated);
    const location = formatLocation(posting);
    const department = posting.department || 'Engineering';

    const row: Job = {
      id: String(posting.uid),
      title,
      company: 'Hypernative',
      link,
      date,
      dateVerified: Boolean(date),
      dateSource: 'Comeet.positions.datePosted',
      source: 'Comeet: Hypernative [8A.00E]',
      location,
      department,
      active: true,
      ...(previousById.get(String(posting.uid))?.slug && {
        slug: previousById.get(String(posting.uid))!.slug,
      }),
    };

    allHypernativeJobs.push(row);

    const descHtml = [...(posting.details || [])]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .flatMap((section) => [section.name ? `<h3>${section.name}</h3>` : '', section.value || ''])
      .filter(Boolean)
      .join('\n');

    if (descHtml.trim()) {
      descriptions[getJobContentKey(row)] = sanitizeJobDescriptionHtml(descHtml, 'Hypernative');
    }
  }

  // Assign slugs to all Hypernative jobs
  const legacyArchive = loadJobLegacyArchive();
  const reservedSlugs = loadReservedRootSlugsSync();
  const publishedSlugs = loadPublishedRootSlugsSync();

  assignJobSlugsAndSyncLegacyArchive(allHypernativeJobs, legacyArchive, reservedSlugs, publishedSlugs);
  writeJobLegacyArchive(legacyArchive);

  // Filter merged set using thirty-day policy
  const merged = eligibleIngestedJobs([...filtered, ...allHypernativeJobs]);
  assignJobSlugsAndSyncLegacyArchive(merged, legacyArchive, reservedSlugs, publishedSlugs);
  writeJobLegacyArchive(legacyArchive);

  merged.sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime());
  fs.writeFileSync(cachePath, `${JSON.stringify(merged, null, 2)}\n`);

  writeJobDescriptionStore({
    descriptions,
    aliases: { ...store.aliases, ...buildJobDescriptionAliases(merged, descriptions) },
  });

  const activeHypernative = merged.filter((j) => (j.company || '').toLowerCase() === 'hypernative');
  console.log(`Ingested ${allHypernativeJobs.length} Hypernative jobs (${activeHypernative.length} active within 30 days).`);
  console.log(`Cache now contains ${merged.length} total jobs.`);
  activeHypernative.forEach((j) => {
    console.log(` - [/${j.slug}] ${j.title} (${j.location}) updated ${j.date}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
