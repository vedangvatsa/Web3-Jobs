
'use server';

import type { Job } from '@/types';
import * as fs from 'fs';
import * as path from 'path';
import { cleanPublishText } from '@/lib/noslop';
import { getJobIdentity } from './job-slugs';
import { getOneWordRole } from './job-slugs';

const CACHE_PATH = path.join(process.cwd(), 'content/jobs-cache.json');

/**
 * Non-Web3 companies that leak through portfolio job boards (e.g. Coinbase GetRo).
 * Jobs from these companies are filtered out at read time.
 */
const BLOCKED_COMPANIES = new Set([
  'notion', 'ashby', 'merge', 'salt ai', 'workable',
  'button', 'breeze', 'citadel securities', 'zipline',
  'greenhouse', 'lever', 'greenhouse io',
]);

/**
 * Reads jobs from the static cache file (content/jobs-cache.json).
 * The cache is refreshed every 8 hours by GitHub Actions (refresh-jobs-cache.yml).
 * No RSS fetching happens at runtime.
 */
/** Keep the employer's title intact; team and location qualifiers distinguish roles. */
function cleanJobTitle(title: string, company?: string): string {
 let cleaned = title.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

 // Strip"CompanyName -" prefix (e.g."Morph - Token Growth Lead" →"Token Growth Lead")
 if (company) {
  const escaped = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const prefixPattern = new RegExp(`^${escaped}\\s*[-\\u2013:]\\s*`, 'i');
  const withoutPrefix = cleaned.replace(prefixPattern, '').trim();
  if (withoutPrefix.length > 0) {
   cleaned = withoutPrefix;
  }
 }

 cleaned = cleaned.replace(/\s+/g, ' ').trim();

 return cleanPublishText(cleaned.length > 0 ? cleaned : title.trim());
}

function sourceQuality(job: Job): number {
 const source = job.source.toLowerCase();
 if (/^(greenhouse|lever|ashby|workable|recruitee|workday|smartrecruiters|breezy|bamboohr|comeet|teamtailor|rippling|firstparty):/.test(source)) return 3;
 if (!source.startsWith('http')) return 2;
 return 1;
}

function deduplicateJobs(jobs: Job[]): Job[] {
 const byIdentity = new Map<string, Job>();

 for (const job of jobs) {
  const identity = getJobIdentity(job);
  const existing = byIdentity.get(identity);
  if (!existing || sourceQuality(job) > sourceQuality(existing)) {
   byIdentity.set(identity, job);
  }
 }

 return [...byIdentity.values()];
}

let jobsCache: Job[] | null = null;

export async function getJobs(): Promise<Job[]> {
  if (jobsCache) return jobsCache;

 try {
  const data = fs.readFileSync(CACHE_PATH, 'utf-8');
  const jobs: Job[] = JSON.parse(data).map((job: Job) => ({
   ...job,
   title: cleanJobTitle(job.title, job.company),
   company: cleanPublishText(job.company),
  }));

  // Filter out non-Web3 companies
  const web3Jobs = jobs.filter(job => {
   if (BLOCKED_COMPANIES.has(job.company.toLowerCase())) return false;
   const titleLower = job.title.toLowerCase();
   
   // Filter out common ATS placeholder/test job titles
   if (
    titleLower.includes('default template') || 
    titleLower.includes('new job template') ||
    titleLower.includes('test job') ||
    titleLower.includes('(sample)') ||
    titleLower === 'test' ||
    titleLower === 'testextrenal' ||
    titleLower === '[template] default template'
   ) {
    return false;
   }
   
   return true;
  });

  // The refresh job already retains only active direct-ATS postings and recent
  // aggregator discoveries. Applying another age cutoff here hid still-open
  // roles that had been published more than 30 days ago.
  const uniqueJobs = deduplicateJobs(web3Jobs);

  // Distribute so no single company dominates
  const distributed = distributeJobsByCompany(uniqueJobs);

   // Stable slugs that never change for existing jobs: reuse persisted
   // sequential slugs from the file, and only assign new numbers as max+1.
   const slugById = new Map<string, string>();
   const maxPerRole = new Map<string, number>();
   const claimed = new Set<string>();
   for (const job of distributed) {
    const rawSlug = (job as unknown as { slug?: string }).slug?.toLowerCase().trim();
    if (rawSlug && /^[a-z]+\d+$/.test(rawSlug) && !claimed.has(rawSlug)) {
     slugById.set(job.id, rawSlug);
     claimed.add(rawSlug);
     const role = rawSlug.replace(/\d+$/, '');
     const num = parseInt(rawSlug.slice(role.length), 10);
     if (!isNaN(num)) maxPerRole.set(role, Math.max(maxPerRole.get(role) || 0, num));
    }
   }
   // Assign incrementally only to jobs lacking a stable sequential slug
   // Deterministic order for new assignments: oldest first.
   const needsSlug = distributed.filter(j => !slugById.has(j.id))
     .sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
     });
   for (const job of needsSlug) {
    const role = getOneWordRole(job.title);
    let next = (maxPerRole.get(role) || 0) + 1;
    let candidate = `${role}${next}`;
    while (claimed.has(candidate)) { next += 1; candidate = `${role}${next}`; }
    slugById.set(job.id, candidate);
    claimed.add(candidate);
    maxPerRole.set(role, next);
   }
   jobsCache = distributed.map(job => ({
    ...job,
    slug: slugById.get(job.id)!,
   }));
   return jobsCache;
 } catch (error) {
  console.error('[getJobs] Could not read jobs cache:', error);
  return [];
 }
}

/**
 * Interleaves jobs so that no single company has more than
 * MAX_CONSECUTIVE_PER_COMPANY consecutive listings.
 */
function distributeJobsByCompany(jobs: Job[]): Job[] {
 const MAX_CONSECUTIVE = 2;

 // Group by company
 const groups = new Map<string, Job[]>();
 for (const job of jobs) {
  const key = job.company.toLowerCase();
  const arr = groups.get(key);
  if (arr) arr.push(job);
  else groups.set(key, [job]);
 }

 // Sort groups by most recent job date
 const sorted = Array.from(groups.values()).sort(
  (a, b) => new Date(b[0].date).getTime() - new Date(a[0].date).getTime()
 );

 // Round-robin using index pointers (no array mutation)
 const result: Job[] = [];
 const pointers = new Array(sorted.length).fill(0);
 let hasMore = true;

 while (hasMore) {
  hasMore = false;
  for (let i = 0; i < sorted.length; i++) {
   const group = sorted[i];
   const start = pointers[i];
   const end = Math.min(start + MAX_CONSECUTIVE, group.length);
   for (let j = start; j < end; j++) result.push(group[j]);
   pointers[i] = end;
   if (end < group.length) hasMore = true;
  }
 }

 return result;
}
