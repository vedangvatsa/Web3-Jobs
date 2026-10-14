import slugTypes from '../../content/slug-types.json';
import { isKnownJobPath } from './job-age-path';
import { normalizeJobAgePath } from './job-age-page-cache';
import { stripSocialPathSuffix } from './social-share';

const knownSlugs = new Set<string>(Object.values(slugTypes).flat().map(slug => slug.toLowerCase()));

// classifySlug defaults to "job", including slugs that have never existed.
export function isMissingRootPagePath(pathname: string): boolean {
  const path = stripSocialPathSuffix(normalizeJobAgePath(pathname));
  if (!/^\/[^/]+$/.test(path)) return false;
  return !knownSlugs.has(path.slice(1).toLowerCase()) && !isKnownJobPath(path);
}
