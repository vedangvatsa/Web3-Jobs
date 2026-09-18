
'use server';

import type { Job } from '@/types';
import { loadStaticJson } from './load-static-json';

let jobsCache: Job[] | null = null;

export async function getJobs(): Promise<Job[]> {
  if (jobsCache) return jobsCache;

  try {
    const runtime = await loadStaticJson<Job[]>('jobs-runtime.json');
    jobsCache = Array.isArray(runtime) ? runtime : [];
    return jobsCache;
  } catch (error) {
    console.error('[getJobs] jobs-runtime.json unavailable:', error);
    return [];
  }
}
