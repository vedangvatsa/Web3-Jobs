#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { eligibleIngestedJobs } from './lib/job-ingestion-policy';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey, getJobIdentity } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import { isConcreteJobOpening, cleanCompanyName } from '../src/lib/job-filters';
import { getJobSourceIssue } from '../src/lib/job-source-policy';
import { normalizeSourcePostingDate } from '../src/lib/job-source-date';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import { cleanJobLocation } from '../src/lib/job-location';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

interface GetroJob {
  id: number;
  slug: string;
  title: string;
  url: string;
  created_at: number;
  work_mode?: string | null;
  locations?: string[];
  searchable_locations?: string[];
  compensation_public?: boolean;
  compensation_amount_min_cents?: number;
  compensation_amount_max_cents?: number;
  organization: {
    id: number;
    name: string;
    slug: string;
    domain?: string;
    industry_tags?: string[];
  };
}

interface CurrentJobPayload {
  id: number;
  title: string;
  url: string;
  postedAt?: string;
  description?: string;
  locations?: Array<{ name?: string; description?: string }>;
  jobFunctions?: Array<{ name?: string }>;
  organization?: {
    name?: string;
    domain?: string;
  };
}

const GETRO_API_URL = 'https://api.getro.com/api/v2/collections/858/search/jobs';
const HEADERS = {
  'content-type': 'application/json',
  origin: 'https://jobs.solana.com',
  referer: 'https://jobs.solana.com/',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  accept: 'application/json',
};

async function fetchExternalDescription(url: string, company: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return '';
    const html = await res.text();

    // Check for application/ld+json
    const ldMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    if (ldMatch) {
      try {
        const ld = JSON.parse(ldMatch[1]);
        if (ld.description && typeof ld.description === 'string' && ld.description.length >= 500) {
          return sanitizeJobDescriptionHtml(ld.description, company);
        }
      } catch {
        // Fall through
      }
    }

    // Check for <main>
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
      const sanitized = sanitizeJobDescriptionHtml(mainMatch[1], company);
      if (sanitized.length >= 800) return sanitized;
    }

    // Check for <article>
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      const sanitized = sanitizeJobDescriptionHtml(articleMatch[1], company);
      if (sanitized.length >= 800) return sanitized;
    }
  } catch (err) {
    console.warn(`[ingest-solana] Failed to fetch external description from ${url}:`, err);
  }
  return '';
}

function formatLocation(
  c?: CurrentJobPayload,
  j?: GetroJob,
): string {
  const locName = c?.locations?.[0]?.description || c?.locations?.[0]?.name || j?.locations?.[0] || j?.searchable_locations?.[0] || '';
  const isRemote = (j?.work_mode === 'remote') || locName.toLowerCase().includes('remote');

  if (!locName || locName.toLowerCase() === 'remote') {
    return 'Remote';
  }

  const cleaned = cleanJobLocation(locName);
  if (isRemote && !cleaned.toLowerCase().includes('remote')) {
    return `Remote / ${cleaned}`;
  }
  return cleaned;
}

function formatSalary(j: GetroJob): string | undefined {
  if (!j.compensation_public || !j.compensation_amount_min_cents) return undefined;
  const min = Math.round(j.compensation_amount_min_cents / 100 / 1000);
  const max = Math.round((j.compensation_amount_max_cents || j.compensation_amount_min_cents) / 100 / 1000);
  if (min <= 0) return undefined;
  if (min === max) return `$${min}k/yr`;
  return `$${min}k – $${max}k/yr`;
}

async function main() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const previousById = new Map(allJobs.map((j) => [String(j.id), j]));

  // Index existing cache links and company+title pairs to avoid duplication
  const existingLinks = new Set(allJobs.map((j) => (j.link || '').toLowerCase().trim()));
  const existingKeys = new Set(
    allJobs.map((j) => `${cleanCompanyName(j.company)}:::${j.title}`.toLowerCase().trim()),
  );

  console.log('[ingest-solana] Fetching listings from Getro Solana collections API...');
  const allGetroJobs: GetroJob[] = [];
  for (let page = 0; page < 25; page++) {
    const res = await fetch(GETRO_API_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ hitsPerPage: 20, page, filters: { page }, query: '' }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      console.warn(`[ingest-solana] HTTP ${res.status} on page ${page}`);
      break;
    }
    const json = await res.json();
    const jobs = (json.results?.jobs || []) as GetroJob[];
    if (!jobs.length) break;
    allGetroJobs.push(...jobs);
  }

  console.log(`[ingest-solana] Retrieved ${allGetroJobs.length} total jobs from jobs.solana.com.`);

  const now = Date.now();
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
  const recentJobs = allGetroJobs.filter((j) => now - j.created_at * 1000 <= maxAgeMs);
  console.log(`[ingest-solana] Found ${recentJobs.length} jobs created within 30 days.`);

  const store = readJobDescriptionStore();
  const descriptions = { ...store.descriptions };
  const newlyIngestedJobs: Job[] = [];

  for (const j of recentJobs) {
    const company = cleanCompanyName(j.organization?.name);
    const title = j.title.replace(/\s+/g, ' ').trim();
    const directCandidateUrl = j.url?.trim() || '';

    // Check if already in cache
    const key = `${company}:::${title}`.toLowerCase().trim();
    if (existingKeys.has(key) || existingLinks.has(directCandidateUrl.toLowerCase())) {
      continue;
    }

    if (!isConcreteJobOpening(title, directCandidateUrl)) {
      console.log(`[ingest-solana] Skipping non-concrete job: ${company} - ${title}`);
      continue;
    }

    // Fetch individual job page from jobs.solana.com
    const pageUrl = `https://jobs.solana.com/companies/${j.organization.slug}/jobs/${j.slug}`;
    let currentJob: CurrentJobPayload | undefined;

    try {
      const pageRes = await fetch(pageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
        signal: AbortSignal.timeout(15_000),
      });
      if (pageRes.ok) {
        const html = await pageRes.text();
        const m = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
        if (m) {
          const data = JSON.parse(m[1]);
          currentJob = data.props?.pageProps?.initialState?.jobs?.currentJob;
        }
      }
    } catch (err) {
      console.warn(`[ingest-solana] Failed to fetch job detail for ${company} - ${title}:`, err);
    }

    // Destination ATS link: prefer direct ATS URL from currentJob or j.url
    let destinationUrl = currentJob?.url || j.url || pageUrl;
    if (destinationUrl.startsWith('https://jobs.solana.com/') && j.url && !j.url.startsWith('https://jobs.solana.com/')) {
      destinationUrl = j.url;
    }

    // Check if destination link is already in cache
    if (existingLinks.has(destinationUrl.toLowerCase().trim())) {
      continue;
    }

    // Build description
    let cleanDesc = '';
    if (currentJob?.description && currentJob.description.length >= 800) {
      cleanDesc = sanitizeJobDescriptionHtml(currentJob.description, company);
    }

    // If description is thin or missing, try external ATS page
    if ((!cleanDesc || cleanDesc.length < 800) && destinationUrl && !destinationUrl.startsWith('https://jobs.solana.com/')) {
      const external = await fetchExternalDescription(destinationUrl, company);
      if (external.length >= 800) {
        cleanDesc = external;
      }
    }

    // Strict quality gate: no thin descriptions
    if (!cleanDesc || cleanDesc.length < 800) {
      console.log(`[ingest-solana] Skipping thin description (${cleanDesc.length} chars) for ${company} - ${title}`);
      continue;
    }

    const rawDate = currentJob?.postedAt || new Date(j.created_at * 1000).toISOString();
    const date = normalizeSourcePostingDate(rawDate);
    const location = formatLocation(currentJob, j);
    const salary = formatSalary(j);
    const department = currentJob?.jobFunctions?.[0]?.name || j.organization?.industry_tags?.[0] || 'Engineering';

    const row: Job = {
      id: String(j.id),
      title,
      company,
      link: destinationUrl,
      date,
      dateVerified: Boolean(date),
      dateSource: 'Solana.JobPosting.postedAt',
      source: `Solana Ecosystem: ${company} [getro-solana]`,
      location,
      department,
      ...(salary && { salary }),
      active: true,
      ...(previousById.get(String(j.id))?.slug && {
        slug: previousById.get(String(j.id))!.slug,
      }),
    };

    if (getJobSourceIssue(row)) {
      console.log(`[ingest-solana] Skipping job with source policy issue: ${company} - ${title}`);
      continue;
    }

    newlyIngestedJobs.push(row);
    existingLinks.add(destinationUrl.toLowerCase().trim());
    existingKeys.add(key);

    descriptions[getJobContentKey(row)] = cleanDesc;
  }

  console.log(`[ingest-solana] Ingested ${newlyIngestedJobs.length} new qualified jobs.`);

  // Load slug archives
  const legacyArchive = loadJobLegacyArchive();
  const reservedSlugs = loadReservedRootSlugsSync();
  const publishedSlugs = loadPublishedRootSlugsSync();

  // Assign slugs to new jobs
  assignJobSlugsAndSyncLegacyArchive(newlyIngestedJobs, legacyArchive, reservedSlugs, publishedSlugs);
  writeJobLegacyArchive(legacyArchive);

  // Filter merged set using thirty-day policy
  const filtered = allJobs.filter((job) => !getJobSourceIssue(job));
  const merged = eligibleIngestedJobs([...filtered, ...newlyIngestedJobs]);
  assignJobSlugsAndSyncLegacyArchive(merged, legacyArchive, reservedSlugs, publishedSlugs);
  writeJobLegacyArchive(legacyArchive);

  merged.sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime());
  fs.writeFileSync(cachePath, `${JSON.stringify(merged, null, 2)}\n`);

  writeJobDescriptionStore({
    descriptions,
    aliases: { ...store.aliases, ...buildJobDescriptionAliases(merged, descriptions) },
  });

  console.log(`[ingest-solana] Cache now contains ${merged.length} total active jobs.`);
  console.log(`[ingest-solana] Sample of newly added roles:`);
  newlyIngestedJobs.slice(0, 15).forEach((j) => {
    console.log(` - [/${j.slug}] ${j.company} — ${j.title} (${j.location}) [${j.date}]`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
