import type { Job } from '@/types';
import { loadStaticJson } from './load-static-json';

let jobsCache: Job[] | null = null;
let jobsLoad: Promise<Job[]> | null = null;

export async function getJobs(): Promise<Job[]> {
  if (jobsCache) return jobsCache;
  if (!jobsLoad) {
    jobsLoad = loadStaticJson<Job[]>('jobs-runtime.json', Array.isArray)
      .then((runtime) => {
        if (!Array.isArray(runtime) || runtime.length === 0) {
          throw new Error('Invalid or empty jobs runtime catalog');
        }
        jobsCache = runtime.filter(job => job.active !== false);
        if (jobsCache.length === 0) {
          throw new Error('Jobs runtime catalog has no active jobs');
        }
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
