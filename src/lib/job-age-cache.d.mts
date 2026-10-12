import type { JobAgeInput } from './job-age-policy.mjs';
export const MAX_JOB_CACHE_SECONDS: number;
export function jobExpiryTime(job: JobAgeInput): number;
export function earliestJobExpiry(jobs: JobAgeInput[]): number;
export function visibleJobListingExpiries(jobs: JobAgeInput[], limit: number): number[];
export function jobDeadlineCacheHeaders(deadline: number, now?: number, maximum?: number): Record<string, string>;
export function jobCacheHeaders(jobs: JobAgeInput[], now?: number): Record<string, string>;
export function jobListingCacheWindow(deadlines: number[], now?: number): { key: string; deadline: number };
