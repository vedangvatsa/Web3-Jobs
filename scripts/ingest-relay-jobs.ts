#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { eligibleIngestedJobs } from './lib/job-ingestion-policy';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
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

interface KulaOffice {
  id: number;
  name: string;
  location?: string | null;
  location_key?: string | null;
  country?: string | null;
  country_code?: string | null;
  state?: string | null;
  city?: string | null;
  remote?: boolean;
  workplace?: string | null;
}

interface KulaJob {
  id: number;
  account_id: number;
  title: string;
  listed: boolean;
  kind?: string;
  is_confidential?: boolean;
  launch_at?: string;
  ats_job?: {
    job_description?: string;
    workplace?: string;
    employment_type?: string;
    work_type_name?: string;
    ats_department?: {
      id: number;
      name: string;
      depth?: number;
    };
    offices?: KulaOffice[];
  };
}

function extractTaggedString(rsc: string, ref: string): string | null {
  const regex = new RegExp(`(?:^|\\n|[\\]\\}>])${ref}:T([0-9a-f]+),`, 'i');
  const match = rsc.match(regex);
  if (!match) return null;
  const hexLen = parseInt(match[1], 16);
  const contentStart = match.index! + match[0].length;
  return rsc.substring(contentStart, contentStart + hexLen);
}

function formatLocation(offices: KulaOffice[] = [], workplace = 'remote'): string {
  const isRemote = workplace.toLowerCase().includes('remote') || offices.some((o) => o.remote || (o.workplace || '').toLowerCase().includes('remote'));

  const officeNames = offices
    .map((o) => (o.country || o.name || o.location || '').trim())
    .filter(Boolean);

  // If there are multiple countries or regions
  const uniqueNames = [...new Set(officeNames)];

  if (isRemote) {
    if (uniqueNames.length === 1 && uniqueNames[0] !== 'United States') {
      const name = uniqueNames[0];
      if (/remote/i.test(name)) return name;
      return `Remote (${name})`;
    }
    if (uniqueNames.length > 1) {
      // E.g. US, UK, Germany, France
      const cleaned = uniqueNames.map((n) => n.replace(/^Remote\s*-\s*/i, '').trim());
      return `Remote (${cleaned.join(', ')})`;
    }
    return 'Remote';
  }

  return uniqueNames.join(', ') || 'Remote';
}

function cleanDescription(rawHtml: string): string {
  const cleaned = rawHtml
    .replace(/^<h3><\/h3>/i, '')
    .replace(/^(?:<br\s*\/?>|<\/br>|\s)+/i, '')
    .trim();
  return sanitizeJobDescriptionHtml(cleaned, 'Relay');
}

export async function ingestRelayJobs(): Promise<void> {
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  const allJobs = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as Job[];
  const previousById = new Map(allJobs.map((j) => [String(j.id), j]));

  const filtered = allJobs.filter((job) => {
    if (getJobSourceIssue(job)) return false;
    const s = String(job.source || '').toLowerCase();
    const c = String(job.company || '').toLowerCase();
    return !(c === 'relay' || s.startsWith('kula: relay'));
  });

  console.log('Fetching Relay careers from https://careers.kula.ai/relay...');
  const res = await fetch('https://careers.kula.ai/relay', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HashtagWeb3/1.0)' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from careers.kula.ai/relay`);
  const html = await res.text();

  // Extract RSC chunks
  const scriptRegex = /<script>self\.__next_f\.push\((.*?)\)<\/script>/gs;
  let fullRsc = '';
  let m: RegExpExecArray | null;
  while ((m = scriptRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      if (Array.isArray(parsed) && parsed[1]) fullRsc += parsed[1];
    } catch {}
  }

  const jobsIdx = fullRsc.indexOf('"jobs":');
  if (jobsIdx === -1) throw new Error('Could not find "jobs": array in Kula RSC stream');

  const chunk = fullRsc.substring(jobsIdx);
  let depth = 0;
  let start = chunk.indexOf('[');
  let end = -1;
  for (let i = start; i < chunk.length; i++) {
    if (chunk[i] === '[') depth++;
    else if (chunk[i] === ']') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  const kulaJobs = JSON.parse(chunk.substring(start, end + 1)) as KulaJob[];
  console.log(`Found ${kulaJobs.length} postings from Kula Relay careers`);

  const store = readJobDescriptionStore();
  const descriptions = { ...store.descriptions };
  const allRelayJobs: Job[] = [];

  for (const job of kulaJobs) {
    const title = (job.title || '').replace(/\s+/g, ' ').trim();
    const link = `https://careers.kula.ai/relay/${job.id}`;

    if (!title || !job.listed || !isConcreteJobOpening(title, link)) {
      console.log(`Skipping non-concrete or unlisted job opening: ${title}`);
      continue;
    }

    const date = normalizeSourcePostingDate(job.launch_at);
    const location = formatLocation(job.ats_job?.offices, job.ats_job?.workplace);
    const department = job.ats_job?.ats_department?.name || 'Engineering';

    const row: Job = {
      id: String(job.id),
      title,
      company: 'Relay',
      link,
      date,
      dateVerified: Boolean(date),
      dateSource: 'Kula.Job.launch_at',
      source: 'Kula: Relay [relay]',
      location,
      department,
      active: true,
      ...(previousById.get(String(job.id))?.slug && {
        slug: previousById.get(String(job.id))!.slug,
      }),
    };

    allRelayJobs.push(row);

    const descRef = job.ats_job?.job_description?.replace(/^\$/, '');
    if (descRef) {
      const rawDesc = extractTaggedString(fullRsc, descRef);
      if (rawDesc && rawDesc.trim()) {
        descriptions[getJobContentKey(row)] = cleanDescription(rawDesc);
      }
    }
  }

  // First sync all Relay jobs to legacy archive so all jobs get tracked slugs
  const legacyArchive = loadJobLegacyArchive();
  const reservedSlugs = loadReservedRootSlugsSync();
  const publishedSlugs = loadPublishedRootSlugsSync();

  assignJobSlugsAndSyncLegacyArchive(allRelayJobs, legacyArchive, reservedSlugs, publishedSlugs);
  writeJobLegacyArchive(legacyArchive);

  // Filter merged set using thirty-day policy
  const merged = eligibleIngestedJobs([...filtered, ...allRelayJobs]);
  assignJobSlugsAndSyncLegacyArchive(merged, legacyArchive, reservedSlugs, publishedSlugs);
  writeJobLegacyArchive(legacyArchive);

  merged.sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime());
  fs.writeFileSync(cachePath, `${JSON.stringify(merged, null, 2)}\n`);

  writeJobDescriptionStore({
    descriptions,
    aliases: { ...store.aliases, ...buildJobDescriptionAliases(merged, descriptions) },
  });

  const activeRelay = merged.filter((j) => (j.company || '').toLowerCase() === 'relay');
  console.log(`Ingested ${allRelayJobs.length} Relay jobs (${activeRelay.length} active within 30 days).`);
  console.log(`Cache now contains ${merged.length} total jobs.`);
  activeRelay.forEach((j) => {
    console.log(` - [/${j.slug}] ${j.title} (${j.location}) posted ${j.date}`);
  });
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  ingestRelayJobs().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
