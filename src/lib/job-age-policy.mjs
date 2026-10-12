export const MAX_JOB_AGE_DAYS = 30;
const MAX_JOB_AGE_MS = MAX_JOB_AGE_DAYS * 24 * 60 * 60 * 1000;

/** Parse source dates without local-time ambiguity or calendar rollover. */
export function parseJobPostingDate(value) {
  if (typeof value !== 'string') return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2}))?$/.exec(value);
  if (!match) return NaN;
  const [, year, month, day, hour, minute, second, , zone] = match;
  const y = Number(year), m = Number(month), d = Number(day);
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (m < 1 || m > 12 || d < 1 || d > days[m - 1]) return NaN;
  if (hour !== undefined && (Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59)) return NaN;
  if (zone && zone !== 'Z' && (Number(zone.slice(1, 3)) > 23 || Number(zone.slice(4)) > 59)) return NaN;
  return Date.parse(hour === undefined ? `${value}T00:00:00.000Z` : value);
}

/** `date` is the original source posting date, never a fetch or update time. */
export function jobAgeExclusionReason(job, now = Date.now()) {
  if (!job || typeof job !== 'object') return 'missing-date';
  if (job.active === false) return 'inactive';
  if (job.dateVerified === false) return 'unverified-date';
  if (job.date == null || job.date === '') return 'missing-date';
  const postedAt = parseJobPostingDate(job.date);
  if (!Number.isFinite(postedAt) || !Number.isFinite(now)) return 'invalid-date';
  if (postedAt > now) return 'future-date';
  if (now - postedAt > MAX_JOB_AGE_MS) return 'expired';
  return null;
}

export function isJobAgeEligible(job, now = Date.now()) {
  return jobAgeExclusionReason(job, now) === null;
}
