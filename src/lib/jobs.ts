
'use server';

import type { Job } from '@/types';
import * as fs from 'fs';
import * as path from 'path';

const CACHE_PATH = path.join(process.cwd(), 'content/jobs-cache.json');

/**
 * Non-Web3 companies that leak through portfolio job boards (e.g. Coinbase GetRo).
 * Jobs from these companies are filtered out at read time.
 */
const BLOCKED_COMPANIES = new Set([
 'notion', 'ashby', 'merge', 'salt ai', 'workable',
 'button', 'breeze', 'citadel securities', 'zipline',
]);

/**
 * Reads jobs from the static cache file (content/jobs-cache.json).
 * The cache is refreshed every 8 hours by GitHub Actions (refresh-jobs-cache.yml).
 * No RSS fetching happens at runtime.
 */
/**
 * Cleans job titles by removing parenthesized/bracketed suffixes
 * and everything after " - " dashes.
 * e.g. "Business Development Manager (Acquiring)" → "Business Development Manager"
 *   "Engineering Manager - DevX" → "Engineering Manager"
 */
function cleanJobTitle(title: string, company?: string): string {
 let cleaned = title.trim();

 // Strip "CompanyName - " prefix (e.g. "Morph - Token Growth Lead" → "Token Growth Lead")
 if (company) {
  const escaped = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const prefixPattern = new RegExp(`^${escaped}\\s*[-–:]\\s*`, 'i');
  const withoutPrefix = cleaned.replace(prefixPattern, '').trim();
  if (withoutPrefix.length > 0) {
   cleaned = withoutPrefix;
  }
 }

 // If entire title is wrapped in parens, unwrap it: "(Core Dev)" → "Core Dev"
 if (/^\(.*\)$/.test(cleaned)) {
  cleaned = cleaned.slice(1, -1).trim();
 }

 // Strip parenthesized suffixes if meaningful text remains
 const withoutParens = cleaned.replace(/\s*\(.*?\)\s*/g, ' ').trim();
 if (withoutParens.length > 0 && (!company || withoutParens.toLowerCase() !== company.toLowerCase())) {
  cleaned = withoutParens;
 }

 // Remove [anything]
 cleaned = cleaned.replace(/\s*\[.*?\]\s*/g, ' ').trim();

 // Handle " - " splits: keep the meaningful side
 const dashIdx = cleaned.search(/\s+-\s+/);
 if (dashIdx > 0) {
  const before = cleaned.substring(0, dashIdx).trim();
  const after = cleaned.substring(dashIdx).replace(/^\s+-\s+/, '').trim();
  if (before.split(/\s+/).length >= 2 && before.length >= 8) {
   cleaned = before; // before is meaningful, drop suffix
  } else if (after.split(/\s+/).length >= 2 && after.length >= 8) {
   cleaned = after;  // before is a short qualifier like "Mid", keep after
  }
 }

 // Clean up leading slashes, dashes, or pipes (e.g. "/BizDev" -> "BizDev")
 cleaned = cleaned.replace(/^[\/\-\|\\\s]+/, '').trim();

 // Clean up trailing dashes
 cleaned = cleaned.replace(/[-–]$/, '').trim();

 // Collapse whitespace
 cleaned = cleaned.replace(/\s+/g, ' ').trim();

 return cleaned.length > 0 ? cleaned : title.trim();
}

export async function getJobs(): Promise<Job[]> {
 try {
  const data = fs.readFileSync(CACHE_PATH, 'utf-8');
  const jobs: Job[] = JSON.parse(data).map((job: Job) => ({
   ...job,
   title: cleanJobTitle(job.title, job.company),
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

  // Apply 30-day freshness filter
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const freshJobs = web3Jobs.filter(job => new Date(job.date) > thirtyDaysAgo);

  // Distribute so no single company dominates
  return distributeJobsByCompany(freshJobs);
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
