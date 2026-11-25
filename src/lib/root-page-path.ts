import slugTypes from '../../content/slug-types.json';
import legacyGrantSlugsJson from '../../content/grants/legacy-slugs.json';
import { isKnownJobPath } from './job-age-path';
import { normalizeJobAgePath } from './job-age-page-cache';
import { stripSocialPathSuffix } from './social-share';

const knownSlugs = new Set<string>(Object.values(slugTypes).flat().map(slug => slug.toLowerCase()));
const legacyGrantSlugs = new Set(
  Object.keys(legacyGrantSlugsJson as Record<string, string>).map((slug) => slug.toLowerCase()),
);

// classifySlug defaults to "job", including slugs that have never existed.
export function isMissingRootPagePath(pathname: string): boolean {
  const path = stripSocialPathSuffix(normalizeJobAgePath(pathname));
  if (!/^\/[^/]+$/.test(path)) return false;
  const slug = path.slice(1).toLowerCase();
  return !knownSlugs.has(slug) && !legacyGrantSlugs.has(slug) && !isKnownJobPath(path);
}
