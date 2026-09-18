import fs from 'fs';
import path from 'path';
import type { Job } from '@/types';
import { fetchSiteAsset } from './load-static-json';
import {
  createEmptyJobDescriptionShard,
  getJobDescriptionShardFilename,
  getJobDescriptionShardIndex,
  isJobDescriptionShard,
  type JobDescriptionShard,
} from './job-description-shards';

const descriptionsShardCache = new Map<string, JobDescriptionShard>();
const shardLoadPromises = new Map<string, Promise<JobDescriptionShard>>();

function readLocalDescriptionShard(filename: string): JobDescriptionShard | null {
  try {
    if (typeof fs === 'undefined' || !fs.existsSync) return null;
    for (const dir of [
      path.join('public', 'job-description-shards'),
      path.join('content', 'job-description-shards'),
    ]) {
      const filePath = path.join(process.cwd(), dir, filename);
      if (!fs.existsSync(filePath)) continue;
      const parsed: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (isJobDescriptionShard(parsed)) return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

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

  const local = readLocalDescriptionShard(filename);
  if (local) {
    descriptionsShardCache.set(filename, local);
    return local;
  }

  let pending = shardLoadPromises.get(filename);
  if (!pending) {
    pending = fetchSiteAsset(`/job-description-shards/${filename}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const parsed: unknown = await res.json();
        if (!isJobDescriptionShard(parsed)) throw new Error('Invalid shard structure');
        descriptionsShardCache.set(filename, parsed);
        return parsed;
      })
      .catch((err) => {
        console.error(`[job-descriptions] Failed to load shard ${filename}:`, err);
        // Do not cache empty shards — a failed self-fetch must not poison the isolate.
        return createEmptyJobDescriptionShard();
      })
      .finally(() => {
        shardLoadPromises.delete(filename);
      });
    shardLoadPromises.set(filename, pending);
  }

  return pending;
}
