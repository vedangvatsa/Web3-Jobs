import removedSlugsJson from '../../content/removed-job-paths.json';
import recoveredRedirectsJson from '../../content/recovered-job-redirects.json';
import { stripSocialPathSuffix } from './social-share';

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
  let decoded = pathname;
  try { decoded = decodeURIComponent(pathname); } catch {}
  const path = stripSocialPathSuffix(decoded).replace(/\/+$/, '');
  const slug = path.match(/^\/(?:jobs\/)?([a-z0-9_-]+)$/i)?.[1]
    || path.match(/^\/preview\/([a-z0-9_-]+)\.html$/i)?.[1];
  return Boolean(slug && removedSlugs.has(slug.toLowerCase()));
}
