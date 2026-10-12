import removedSlugsJson from '../../content/removed-job-paths.json';
import recoveredRedirectsJson from '../../content/recovered-job-redirects.json';
import { stripSocialPathSuffix } from './social-share';
import { jobPathSlug } from './job-age-path';

const removedSlugs = new Set(removedSlugsJson);
const recoveredRedirects: Record<string, string> = recoveredRedirectsJson;

export function recoveredJobDestination(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, '');
  const base = stripSocialPathSuffix(normalized);
  const slug = base.match(/^\/(?:jobs\/)?([a-z0-9_-]+)$/i)?.[1];
  const destination = slug && recoveredRedirects[slug.toLowerCase()];
  return destination ? destination + normalized.slice(base.length) : null;
}

export function isRemovedJobPath(pathname: string): boolean {
  const slug = jobPathSlug(pathname);
  return Boolean(slug && removedSlugs.has(slug.toLowerCase()));
}
