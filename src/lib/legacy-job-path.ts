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

/**
 * Edge/middleware-safe /jobs/:slug → /:slug redirect.
 * Must not import server catalog code (fs) — middleware is webpack-bundled.
 */
export async function resolveLegacyJobRedirectPath(
  segment: string,
  origin: string,
): Promise<string | null> {
  const clean = segment.toLowerCase().trim();
  if (!clean) return null;

  const shardUrl = new URL(
    `/job-shards/${getJobShardFilename(getJobSlugShardIndex(clean))}`,
    origin,
  );

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(shardUrl, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 },
      });
      if (!res.ok) continue;
      const shard = (await res.json()) as Record<string, { slug?: string }>;
      const job = shard[clean];
      if (job?.slug) return `/${job.slug}`;
    } catch {
      // fall through to retry
    }
    if (attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  return null;
}
