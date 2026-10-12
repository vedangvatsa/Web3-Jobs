import { parseJobPostingDate } from './job-age-policy.mjs';
import { getJobIdentity } from './job-slugs';
import type { Job, JobPostingDateEvidence } from '../types';

export type JobDateHistory = Record<string, { date: string; dateVerified: boolean; dateSource?: string; dateEvidence?: JobPostingDateEvidence }>;
export const BREEZY_ORIGINAL_DATE_SOURCE = 'Breezy.JobPosting.datePosted';
const NON_POSTING_DATE_SOURCE = /updated|fetched|ingest|discovery|discovered/i;

export function requiresPrimaryJobDate(job: Pick<Job, 'id' | 'title' | 'company' | 'link'> & Partial<Pick<Job, 'source'>>): boolean {
  return getJobIdentity(job).startsWith('breezy:') || /^breezy(?::|$)/i.test(job.source || '');
}

export function hasRequiredJobDateProvenance(job: Job): boolean {
  if (!requiresPrimaryJobDate(job)) return true;
  const evidence = job.dateEvidence;
  const identity = getJobIdentity(job);
  return identity.startsWith('breezy:') && job.dateVerified === true && job.dateSource === BREEZY_ORIGINAL_DATE_SOURCE
    && evidence?.provider === 'breezy' && /^[a-f0-9]{64}$/.test(evidence.bodySha256)
    && Number.isFinite(parseJobPostingDate(evidence.checkedAt))
    && Number.isFinite(parseJobPostingDate(evidence.datePosted))
    && parseJobPostingDate(evidence.datePosted) === parseJobPostingDate(job.date)
    && getJobIdentity({ ...job, link: evidence.url }) === identity;
}

export function normalizeSourcePostingDate(value: unknown): string {
  if (typeof value !== 'string') return '';
  const utc = value.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) UTC$/);
  const date = utc ? `${utc[1]}T${utc[2]}Z` : value;
  return Number.isFinite(parseJobPostingDate(date)) ? date : '';
}

/** Keep the earliest known posting date when an ATS republishes the same identity. */
export function preserveOriginalJobDate<T extends Job>(job: T, history: JobDateHistory): T {
  job = { ...job, date: normalizeSourcePostingDate(job.date), ...(NON_POSTING_DATE_SOURCE.test(job.dateSource || '') && { dateVerified: false }) };
  // A Breezy API date or an unsuccessful primary-page read cannot recover through old inferred history.
  if (!hasRequiredJobDateProvenance(job)) return { ...job, dateVerified: false };
  const key = getJobIdentity(job);
  const previous = history[key];
  const incomingTime = parseJobPostingDate(job.date);
  const previousTime = parseJobPostingDate(previous?.date);
  const incomingVerified = job.dateVerified !== false && Number.isFinite(incomingTime);
  if (previous?.dateVerified && hasRequiredJobDateProvenance({ ...job, ...previous, dateSource: previous.dateSource, dateEvidence: previous.dateEvidence }) && !NON_POSTING_DATE_SOURCE.test(previous.dateSource || '') && Number.isFinite(previousTime) && (!incomingVerified || previousTime <= incomingTime)) {
    return { ...job, ...previous };
  }
  if (incomingVerified) history[key] = { date: job.date, dateVerified: true, ...(job.dateSource && { dateSource: job.dateSource }), ...(job.dateEvidence && { dateEvidence: job.dateEvidence }) };
  return job;
}
