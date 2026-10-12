import datesJson from '../../content/job-age-paths.json';
import { isJobAgeEligible } from './job-age-policy.mjs';
import { stripSocialPathSuffix } from './social-share';
import { jobDeadlineCacheHeaders, jobExpiryTime } from './job-age-cache.mjs';

const dates: Record<string, string | null> = datesJson;

export function jobPathSlug(pathname: string): string | undefined {
  let decoded = pathname;
  try { decoded = decodeURIComponent(pathname); } catch {}
  const path = stripSocialPathSuffix(decoded.replace(/\/+$/, ''));
  return (path.match(/^\/(?:jobs\/)?([a-z0-9_-]+)$/i)?.[1]
    || path.match(/^\/preview\/(?:jobs\/)?([a-z0-9_-]+)\.html$/i)?.[1]
    || path.match(/^\/og\/jobs\/([a-z0-9_-]+)\.(?:png|jpg|webp)$/i)?.[1])?.toLowerCase();
}

export function isExpiredJobPath(pathname: string, now = Date.now()): boolean {
  const slug = jobPathSlug(pathname);
  return Boolean(slug && Object.hasOwn(dates, slug) && !isJobAgeEligible({ date: dates[slug] }, now));
}

export function isKnownJobPath(pathname: string): boolean {
  const slug = jobPathSlug(pathname);
  return Boolean(slug && Object.hasOwn(dates, slug));
}

export function jobPathCacheHeaders(pathname: string, now = Date.now()): Record<string, string> | null {
  const slug = jobPathSlug(pathname);
  return slug && dates[slug] ? jobDeadlineCacheHeaders(jobExpiryTime({ date: dates[slug] }), now) : null;
}
