import type { Job } from '@/types';
import { loadStaticJson } from './load-static-json';

let jobsCache: Job[] | null = null;
let jobsLoad: Promise<Job[]> | null = null;

export async function getJobs(): Promise<Job[]> {
  if (jobsCache) return jobsCache;
  if (!jobsLoad) {
    jobsLoad = loadStaticJson<Job[]>('jobs-runtime.json')
      .then((runtime) => {
        jobsCache = Array.isArray(runtime) ? runtime : [];
        return jobsCache;
      })
      .catch((error) => {
        console.error('[getJobs] jobs-runtime.json unavailable:', error);
        jobsCache = [];
        return jobsCache;
      });
  }
  return jobsLoad;
}
