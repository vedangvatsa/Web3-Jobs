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

function isEmptyShard(shard: JobDescriptionShard): boolean {
  return Object.keys(shard.descriptions).length === 0 && Object.keys(shard.aliases).length === 0;
}

export function getCachedDescriptionShard(filename: string): JobDescriptionShard | undefined {
  const cached = descriptionsShardCache.get(filename);
  if (cached && isEmptyShard(cached)) return undefined;
  return cached;
}

/** Test/scripts only: hydrate cache from Node without bundling shards into the Worker. */
export function seedDescriptionShardCache(filename: string, shard: JobDescriptionShard): void {
  descriptionsShardCache.set(filename, shard);
}

/** Test only: reset the in-memory shard cache between cases. */
export function clearDescriptionShardCache(): void {
  descriptionsShardCache.clear();
}

export async function ensureDescriptionShardLoaded(job: Job): Promise<JobDescriptionShard> {
  const filename = getJobDescriptionShardFilename(getJobDescriptionShardIndex(job));
  const cached = descriptionsShardCache.get(filename);
  if (cached && !isEmptyShard(cached)) return cached;

  const local = readLocalDescriptionShard(filename);
  if (local) {
    descriptionsShardCache.set(filename, local);
    return local;
  }

  const loadShard = async (): Promise<JobDescriptionShard> => {
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetchSiteAsset(`/job-description-shards/${filename}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const parsed: unknown = await res.json();
        if (!isJobDescriptionShard(parsed)) throw new Error('Invalid shard structure');
        if (isEmptyShard(parsed)) throw new Error('Empty shard payload');
        descriptionsShardCache.set(filename, parsed);
        return parsed;
      } catch (err) {
        lastError = err;
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    }
    console.error(`[job-descriptions] Failed to load shard ${filename}:`, lastError);
    return createEmptyJobDescriptionShard();
  };

  let pending = shardLoadPromises.get(filename);
  if (!pending) {
    pending = loadShard().finally(() => {
      shardLoadPromises.delete(filename);
    });
    shardLoadPromises.set(filename, pending);
  }

  return pending;
}
