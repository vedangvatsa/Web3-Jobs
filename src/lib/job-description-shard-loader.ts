import type { Job } from '@/types';
import {
  getJobDescriptionShardFilename,
  getJobDescriptionShardIndex,
  isJobDescriptionShard,
  type JobDescriptionShard,
} from './job-description-shards';

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://hashtagweb3.com';

const descriptionsShardCache = new Map<string, JobDescriptionShard>();
const shardLoadPromises = new Map<string, Promise<JobDescriptionShard>>();

export function getCachedDescriptionShard(filename: string): JobDescriptionShard | undefined {
  return descriptionsShardCache.get(filename);
}

/** Test/scripts only: hydrate cache from Node without bundling shards into the Worker. */
export function seedDescriptionShardCache(filename: string, shard: JobDescriptionShard): void {
  descriptionsShardCache.set(filename, shard);
}

export async function ensureDescriptionShardLoaded(job: Job): Promise<JobDescriptionShard> {
  const filename = getJobDescriptionShardFilename(getJobDescriptionShardIndex(job));
  const cached = descriptionsShardCache.get(filename);
  if (cached) return cached;

  let pending = shardLoadPromises.get(filename);
  if (!pending) {
    pending = fetch(`${SITE_ORIGIN}/job-description-shards/${filename}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const parsed: unknown = await res.json();
        if (!isJobDescriptionShard(parsed)) throw new Error('Invalid shard structure');
        descriptionsShardCache.set(filename, parsed);
        return parsed;
      })
      .catch((err) => {
        console.error(`[job-descriptions] Failed to fetch shard ${filename}:`, err);
        const empty: JobDescriptionShard = { version: 1, descriptions: {}, aliases: {} };
        descriptionsShardCache.set(filename, empty);
        return empty;
      })
      .finally(() => {
        shardLoadPromises.delete(filename);
      });
    shardLoadPromises.set(filename, pending);
  }

  return pending;
}
