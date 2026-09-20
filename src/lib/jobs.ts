import type { Job } from '@/types';
import { loadStaticJson } from './load-static-json';

let jobsCache: Job[] | null = null;
let jobsLoad: Promise<Job[]> | null = null;

export async function getJobs(): Promise<Job[]> {
  if (jobsCache) return jobsCache;
  if (!jobsLoad) {
    jobsLoad = loadStaticJson<Job[]>('jobs-runtime.json')
      .then((runtime) => {
        if (!Array.isArray(runtime)) throw new Error('Invalid jobs runtime catalog');
        jobsCache = runtime.filter(job => job.active !== false);
        return jobsCache;
      })
      .catch((error) => {
        console.error('[getJobs] jobs-runtime.json unavailable:', error);
        throw error;
      })
      .finally(() => {
        jobsLoad = null;
      });
  }
  return jobsLoad;
}
