import { fetchJobBySlug } from '@/lib/job-by-slug-record';

/** Paths under /jobs that are feeds, not job slugs. */
export const LEGACY_JOB_PATH_RESERVED = new Set([
  'feed.xml',
  'feed.json',
  'jora.xml',
  'adzuna.xml',
  'feed-aggregator-us.xml',
]);

export function parseLegacyJobPathSegment(pathname: string): string | null {
  const match = pathname.replace(/\/+$/, '').match(/^\/jobs\/([^/]+)$/);
  if (!match) return null;
  const segment = match[1].toLowerCase();
  if (LEGACY_JOB_PATH_RESERVED.has(segment)) return null;
  return segment;
}

/** Resolve /jobs/:segment → canonical /:slug using shard + runtime catalog. */
export async function resolveLegacyJobRedirectPath(
  segment: string,
  _origin: string,
): Promise<string | null> {
  const clean = segment.toLowerCase().trim();
  if (!clean) return null;

  const job = await fetchJobBySlug(clean);
  if (job?.slug) return `/${job.slug}`;
  return null;
}
