import scopesJson from '../../content/job-age-page-scopes.json';
import datesJson from '../../content/job-age-paths.json';
import { jobExpiryTime, jobListingCacheWindow, jobDeadlineCacheHeaders } from './job-age-cache.mjs';

const scopes = scopesJson as Record<string, number[] | 'catalog'>;
const catalog = [...new Set(Object.values(datesJson).filter((date): date is string => typeof date === 'string').map(date => jobExpiryTime({ date })))].sort((a, b) => a - b);
export const JOB_LISTING_CACHE_PREFIX = '/job-listing-cache';

export function normalizeJobAgePath(pathname: string): string {
  try { return decodeURIComponent(pathname).replace(/\/+$/, '') || '/'; }
  catch { return pathname.replace(/\/+$/, '') || '/'; }
}

export function jobAgePageCache(pathname: string, now = Date.now()) {
  const path = normalizeJobAgePath(pathname).toLowerCase();
  const scope = scopes[path];
  if (!scope) return null;
  const { key, deadline } = jobListingCacheWindow(scope === 'catalog' ? catalog : scope, now);
  return { key, deadline, destination: `${JOB_LISTING_CACHE_PREFIX}/${key}${path === '/' ? '' : path}`, headers: jobDeadlineCacheHeaders(deadline, now) };
}

export function validJobListingCachePath(pathname: string, now = Date.now()): boolean {
  const match = normalizeJobAgePath(pathname).match(/^\/job-listing-cache\/(\d+)(\/.*)?$/);
  return Boolean(match && jobAgePageCache(match[2] || '/', now)?.key === match[1]);
}
