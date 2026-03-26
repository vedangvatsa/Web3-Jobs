
'use server';

import type { Job } from '@/types';
import * as fs from 'fs';
import * as path from 'path';

const CACHE_PATH = path.join(process.cwd(), 'content/jobs-cache.json');

/**
 * Reads jobs from the static cache file (content/jobs-cache.json).
 * The cache is refreshed every 8 hours by GitHub Actions (refresh-jobs-cache.yml).
 * No RSS fetching happens at runtime.
 */
export async function getJobs(): Promise<Job[]> {
  try {
    const data = fs.readFileSync(CACHE_PATH, 'utf-8');
    const jobs: Job[] = JSON.parse(data);

    // Apply 30-day freshness filter
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const freshJobs = jobs.filter(job => new Date(job.date) > thirtyDaysAgo);

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
  const MAX_CONSECUTIVE_PER_COMPANY = 2;

  const companyGroups = new Map<string, Job[]>();
  for (const job of jobs) {
    const key = job.company.toLowerCase();
    if (!companyGroups.has(key)) {
      companyGroups.set(key, []);
    }
    companyGroups.get(key)!.push(job);
  }

  const sortedGroups = Array.from(companyGroups.values()).sort(
    (a, b) => new Date(b[0].date).getTime() - new Date(a[0].date).getTime()
  );

  const result: Job[] = [];
  let hasMore = true;

  while (hasMore) {
    hasMore = false;
    for (const group of sortedGroups) {
      const taken = group.splice(0, MAX_CONSECUTIVE_PER_COMPANY);
      if (taken.length > 0) {
        result.push(...taken);
      }
      if (group.length > 0) {
        hasMore = true;
      }
    }
  }

  return result;
}
