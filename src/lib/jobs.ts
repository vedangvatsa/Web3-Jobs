
'use server';

import type { Job } from '@/types';
import jobsRuntimeJson from '../../content/jobs-runtime.json';

let jobsCache: Job[] | null = null;

export async function getJobs(): Promise<Job[]> {
  if (jobsCache) return jobsCache;

  try {
    const runtime = jobsRuntimeJson as Job[];
    jobsCache = Array.isArray(runtime) ? runtime : [];
    return jobsCache;
  } catch (error) {
    console.error('[getJobs] jobs-runtime.json unavailable:', error);
    return [];
  }
}
