import type { Job } from '@/types';
import { loadStaticJson } from './load-static-json';
import { getJobSourceIssue } from './job-source-policy';
import { isJobAgeEligible } from './job-age-policy.mjs';
import { hasRequiredJobDateProvenance } from './job-source-date';

let jobsCache: Job[] | null = null;
let jobsLoad: Promise<Job[]> | null = null;

export async function getJobs(): Promise<Job[]> {
  if (jobsCache) return jobsCache.filter(job => isJobAgeEligible(job));
  if (!jobsLoad) {
    jobsLoad = loadStaticJson<Job[]>('jobs-runtime.json', Array.isArray, { localOnly: true })
      .then((runtime) => {
        if (!Array.isArray(runtime)) {
          throw new Error('Invalid jobs runtime catalog');
        }
        jobsCache = runtime.filter(job => job.active !== false && hasRequiredJobDateProvenance(job) && !getJobSourceIssue(job));
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
  return (await jobsLoad).filter(job => isJobAgeEligible(job));
}
