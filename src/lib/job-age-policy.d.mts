export const MAX_JOB_AGE_DAYS: 30;
export type JobAgeInput = { date?: unknown; dateVerified?: boolean; active?: boolean };
export type JobAgeExclusionReason = 'inactive' | 'unverified-date' | 'missing-date' | 'invalid-date' | 'future-date' | 'expired';
export function parseJobPostingDate(value: unknown): number;
export function jobAgeExclusionReason(job: JobAgeInput | null | undefined, now?: number): JobAgeExclusionReason | null;
export function isJobAgeEligible(job: JobAgeInput | null | undefined, now?: number): boolean;
