import type { Job } from '../../src/types';
import {
  enrichLocationFromPostingHtml,
  shouldEnrichLocationFromPosting,
} from '../../src/lib/employer-careers-locations';

const UA = 'Mozilla/5.0 (compatible; HashtagWeb3-Jobs/1.0; +https://hashtagweb3.com)';

async function runInBatches<T>(items: T[], size: number, worker: (item: T) => Promise<void>): Promise<void> {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(worker));
  }
}

/**
 * Fetches employer posting pages and expands `location` when the live page
 * lists multiple offices but our cache only has the primary city.
 */
export async function enrichMultiOfficeLocations(jobs: Job[]): Promise<number> {
  const targets = jobs.filter(
    (job) => job.active !== false && job.link && shouldEnrichLocationFromPosting(job.link, job.location),
  );
  if (targets.length === 0) return 0;

  let updated = 0;
  await runInBatches(targets, 4, async (job) => {
    try {
      const res = await fetch(job.link!, {
        headers: { 'User-Agent': UA, Accept: 'text/html' },
        signal: AbortSignal.timeout(25_000),
      });
      if (!res.ok) return;
      const html = await res.text();
      const next = enrichLocationFromPostingHtml(job.link, job.location, html);
      if (next && next !== job.location) {
        job.location = next;
        updated += 1;
      }
    } catch {
      // Best-effort; keep cached primary city.
    }
  });

  return updated;
}
