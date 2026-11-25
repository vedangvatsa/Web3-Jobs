import type { Job } from '@/types';

/** Employer-owned application URL (ATS apply page), falling back to listing link. */
export function getJobApplyUrl(job: Pick<Job, 'link'> & { applyUrl?: string }): string {
  const apply = job.applyUrl?.trim();
  if (apply) return apply;
  return job.link;
}