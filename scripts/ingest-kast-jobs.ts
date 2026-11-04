#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { eligibleIngestedJobs } from './lib/job-ingestion-policy';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey, getJobIdentity } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { getJobSourceIssue } from '../src/lib/job-source-policy';
import { normalizeSourcePostingDate } from '../src/lib/job-source-date';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';

interface PinpointPosting {
  id: string;
  title: string;
  url: string;
  description?: string;
  key_responsibilities?: string;
  skills_knowledge_expertise?: string;
  workplace_type_text?: string;
  location?: {
    city?: string;
    name?: string;
    province?: string;
  };
  job?: {
    department?: {
      name?: string;
    };
  };
}

interface PinpointPostingsResponse {
  data: PinpointPosting[];
}

function cleanDescription(rawHtml: string): string {
  const cleaned = rawHtml
    .replace(/^<h1>[\s\S]*?<\/h1>/i, '')
    .replace(/<p><strong>Department:[\s\S]*?<\/p>/i, '')
    .replace(/<p><strong>Employment Type:[\s\S]*?<\/p>/i, '')
    .replace(/<p><strong>Location:[\s\S]*?<\/p>/i, '')
    .replace(/^(?:<br\s*\/?>|<\/br>|\s)+/i, '')
    .trim();
  return sanitizeJobDescriptionHtml(cleaned, 'Kast');
}

function formatLocation(posting: PinpointPosting, ldLocation?: any): string {
  const city = posting.location?.city || ldLocation?.address?.addressLocality || ldLocation?.name || '';
  const country = ldLocation?.address?.addressCountry || '';
  const workplace = (posting.workplace_type_text || '').toLowerCase();

  if (workplace.includes('remote')) {
    if (city && country) return `Remote / ${city}, ${country}`;
    if (city) return `Remote / ${city}`;
    return 'Remote';
  }
  if (city) {
    if (posting.workplace_type_text) return `${city} (${posting.workplace_type_text})`;
    return city;
  }
  return 'Remote';
}

async function main() {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const previousById = new Map(allJobs.map((j) => [String(j.id), j]));

  const filtered = allJobs.filter((job) => {
    if (getJobSourceIssue(job)) return false;
    const s = String(job.source || '').toLowerCase();
    const c = String(job.company || '').toLowerCase();
    return !(c === 'kast' || s.startsWith('pinpoint: kast'));
  });

  console.log('Fetching postings from https://careers.kast.xyz/en/postings.json...');
  const res = await fetch('https://careers.kast.xyz/en/postings.json', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HashtagWeb3/1.0)' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from Kast postings.json`);
  const data = (await res.json()) as PinpointPostingsResponse;
  if (!Array.isArray(data.data)) throw new Error('Kast postings.json has no data array');

  console.log(`Found ${data.data.length} postings from Kast`);

  const store = readJobDescriptionStore();
  const descriptions = { ...store.descriptions };
  const allKastJobs: Job[] = [];

  for (const posting of data.data) {
    const title = posting.title.replace(/\s+/g, ' ').trim();
    if (!title || !posting.url || !isConcreteJobOpening(title, posting.url)) {
      console.log(`Skipping non-concrete job opening: ${title}`);
      continue;
    }

    let datePosted = '';
    let descHtml = '';
    let ldLocation: any = null;

    try {
      const pageRes = await fetch(posting.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HashtagWeb3/1.0)' },
        signal: AbortSignal.timeout(15_000),
      });
      if (pageRes.ok) {
        const text = await pageRes.text();
        const match = text.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
        if (match) {
          const ld = JSON.parse(match[1]);
          datePosted = ld.datePosted || '';
          descHtml = ld.description || '';
          ldLocation = ld.jobLocation || null;
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch page for ${posting.title}:`, err);
    }

    if (!descHtml && (posting.description || posting.key_responsibilities || posting.skills_knowledge_expertise)) {
      const parts: string[] = [];
      if (posting.description) parts.push('<h3>Description</h3>', posting.description);
      if (posting.key_responsibilities) parts.push('<h3>Responsibilities</h3>', posting.key_responsibilities);
      if (posting.skills_knowledge_expertise) parts.push('<h3>Requirements</h3>', posting.skills_knowledge_expertise);
      descHtml = parts.join('\n');
    }

    const date = normalizeSourcePostingDate(datePosted);
    const location = formatLocation(posting, ldLocation);
    const department = posting.job?.department?.name || 'Fintech';

    const row: Job = {
      id: String(posting.id),
      title,
      company: 'Kast',
      link: posting.url,
      date,
      dateVerified: Boolean(date),
      dateSource: 'Pinpoint.JobPosting.datePosted',
      source: 'Pinpoint: Kast [kast]',
      location,
      department,
      active: true,
      ...(previousById.get(String(posting.id))?.slug && {
        slug: previousById.get(String(posting.id))!.slug,
      }),
    };

    allKastJobs.push(row);

    if (descHtml.trim()) {
      const cleanDesc = cleanDescription(descHtml);
      descriptions[getJobContentKey(row)] = cleanDesc;
    }
  }

  // First sync all Kast jobs to legacy archive so all 11 jobs get tracked slugs
  const legacyArchive = loadJobLegacyArchive();
  const reservedSlugs = loadReservedRootSlugsSync();
  const publishedSlugs = loadPublishedRootSlugsSync();

  assignJobSlugsAndSyncLegacyArchive(allKastJobs, legacyArchive, reservedSlugs, publishedSlugs);
  writeJobLegacyArchive(legacyArchive);

  // Filter merged set using thirty-day policy
  const merged = eligibleIngestedJobs([...filtered, ...allKastJobs]);
  assignJobSlugsAndSyncLegacyArchive(merged, legacyArchive, reservedSlugs, publishedSlugs);
  writeJobLegacyArchive(legacyArchive);

  merged.sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime());
  fs.writeFileSync(cachePath, `${JSON.stringify(merged, null, 2)}\n`);

  writeJobDescriptionStore({
    descriptions,
    aliases: { ...store.aliases, ...buildJobDescriptionAliases(merged, descriptions) },
  });

  const activeKast = merged.filter((j) => (j.company || '').toLowerCase() === 'kast');
  console.log(`Ingested ${allKastJobs.length} Kast jobs (${activeKast.length} active within 30 days).`);
  console.log(`Cache now contains ${merged.length} total jobs.`);
  activeKast.forEach((j) => {
    console.log(` - [/${j.slug}] ${j.title} (${j.location}) posted ${j.date}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
