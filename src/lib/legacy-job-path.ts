import { getJobShardFilename, getJobSlugShardIndex } from '@/lib/job-shards';

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

/** Resolve /jobs/:segment → canonical /:slug using one job-shard fetch (edge/FAH-safe). */
export async function resolveLegacyJobRedirectPath(
  segment: string,
  origin: string,
): Promise<string | null> {
  const clean = segment.toLowerCase().trim();
  if (!clean) return null;

  const shardUrl = new URL(`/job-shards/${getJobShardFilename(getJobSlugShardIndex(clean))}`, origin);
  try {
    const res = await fetch(shardUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const shard = (await res.json()) as Record<string, { slug?: string }>;
    const job = shard[clean];
    if (job?.slug) return `/${job.slug}`;
  } catch {
    return null;
  }
  return null;
}
