import type { Job } from '@/types';
import { findLiveJobForArchived, type ArchivedSlugRecord } from './job-guides';
import { isJobAgeEligible } from './job-age-policy.mjs';
import { getJobSourceIssue } from './job-source-policy';
import { hasRequiredJobDateProvenance } from './job-source-date';

export function hasLiveJobRootOwner(slug: string, archived: ArchivedSlugRecord, jobs: Job[]): boolean {
  const norm = slug.toLowerCase().trim();
  const liveJobs = jobs.filter(job => isJobAgeEligible(job) && hasRequiredJobDateProvenance(job) && !getJobSourceIssue(job));
  if (liveJobs.some(job => job.slug?.toLowerCase().trim() === norm || job.id.toLowerCase().trim() === norm)) return true;
  return Boolean(findLiveJobForArchived(archived, liveJobs)?.slug);
}
