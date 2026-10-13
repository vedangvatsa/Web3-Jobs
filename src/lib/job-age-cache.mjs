import { MAX_JOB_AGE_DAYS, parseJobPostingDate } from './job-age-policy.mjs';

export const MAX_JOB_CACHE_SECONDS = 3600;
export const JOB_LISTING_CACHE_HEADER = 'x-hw3-job-cache-window';

export function jobExpiryTime(job) {
  return parseJobPostingDate(job.date) + MAX_JOB_AGE_DAYS * 86400000 + 1;
}

export function earliestJobExpiry(jobs) {
  return jobs.reduce((earliest, job) => Math.min(earliest, jobExpiryTime(job)), Infinity);
}

/** Include jobs that will enter a limited list after earlier rows expire. */
export function visibleJobListingExpiries(jobs, limit) {
  if (limit <= 0) return [];
  const deadlines = jobs.map(jobExpiryTime);
  const visible = deadlines.filter((deadline, index) => {
    let ahead = 0;
    for (let prior = 0; prior < index; prior++) {
      if (deadlines[prior] >= deadline && ++ahead >= limit) return false;
    }
    return true;
  });
  return [...new Set(visible)].sort((a, b) => a - b);
}

/** HTTP dates have second precision; expire a full second before the policy boundary. */
export function jobDeadlineCacheHeaders(deadline, now = Date.now(), maximum = MAX_JOB_CACHE_SECONDS) {
  const ttl = Math.max(0, Math.min(maximum, Math.floor((deadline - now) / 1000) - 1));
  if (!Number.isFinite(ttl) || ttl === 0) return { 'Cache-Control': 'no-store' };
  const date = new Date(now).toUTCString();
  return {
    'Cache-Control': `public, max-age=0, s-maxage=${ttl}, must-revalidate`,
    Date: date,
    Expires: new Date(Date.parse(date) + ttl * 1000).toUTCString(),
  };
}

export function jobCacheHeaders(jobs, now = Date.now()) {
  return jobDeadlineCacheHeaders(earliestJobExpiry(jobs), now);
}

/** The cache key changes at each expiry, before Next can reuse an older ISR render. */
export function jobListingCacheWindow(deadlines, now = Date.now()) {
  let low = 0, high = deadlines.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (deadlines[middle] <= now) low = middle + 1;
    else high = middle;
  }
  return { key: String(low), deadline: deadlines[low] ?? Infinity };
}
