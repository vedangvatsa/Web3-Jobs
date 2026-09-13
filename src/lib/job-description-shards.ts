import type { Job } from '@/types';
import { getJobContentKey } from './job-slugs';

export const JOB_DESCRIPTION_SHARD_COUNT = 64;
export const JOB_DESCRIPTION_SHARDS_DIRECTORY = 'job-description-shards';

export interface JobDescriptionShard {
  version: 1;
  descriptions: Record<string, string>;
  aliases: Record<string, string>;
}

export function isJobContentKey(value: string): boolean {
  return /^job-[0-9a-z]+$/.test(value);
}

export function getJobDescriptionShardIndexForContentKey(contentKey: string): number {
  if (!isJobContentKey(contentKey)) {
    throw new Error(`Invalid job content key: ${contentKey}`);
  }

  return Number.parseInt(contentKey.slice(4), 36) % JOB_DESCRIPTION_SHARD_COUNT;
}

export function getJobDescriptionShardIndex(job: Pick<Job, 'id' | 'title' | 'company' | 'link'>): number {
  return getJobDescriptionShardIndexForContentKey(getJobContentKey(job));
}

export function getJobDescriptionShardFilename(shardIndex: number): string {
  if (!Number.isInteger(shardIndex) || shardIndex < 0 || shardIndex >= JOB_DESCRIPTION_SHARD_COUNT) {
    throw new Error(`Invalid job description shard index: ${shardIndex}`);
  }

  return `job-descriptions-${shardIndex.toString().padStart(2, '0')}.json`;
}

export function createEmptyJobDescriptionShard(): JobDescriptionShard {
  return { version: 1, descriptions: {}, aliases: {} };
}

export function isJobDescriptionShard(value: unknown): value is JobDescriptionShard {
  if (!value || typeof value !== 'object') return false;
  const shard = value as Partial<JobDescriptionShard>;

  return shard.version === 1
    && isStringRecord(shard.descriptions)
    && isStringRecord(shard.aliases);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).every((entry) => typeof entry === 'string');
}
