import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../../src/types';
import { getJobContentKey } from '../../src/lib/job-slugs';
import {
  createEmptyJobDescriptionShard,
  getJobDescriptionShardFilename,
  getJobDescriptionShardIndexForContentKey,
  isJobContentKey,
  isJobDescriptionShard,
  JOB_DESCRIPTION_SHARD_COUNT,
  JOB_DESCRIPTION_SHARDS_DIRECTORY,
  type JobDescriptionShard,
} from '../../src/lib/job-description-shards';

export interface JobDescriptionStore {
  descriptions: Record<string, string>;
  aliases: Record<string, string>;
}

export function getJobDescriptionShardsPath(root = process.cwd()): string {
  return path.join(root, 'content', JOB_DESCRIPTION_SHARDS_DIRECTORY);
}

export function readJobDescriptionStore(root = process.cwd()): JobDescriptionStore {
  const store: JobDescriptionStore = { descriptions: {}, aliases: {} };
  const shardsPath = getJobDescriptionShardsPath(root);

  for (let shardIndex = 0; shardIndex < JOB_DESCRIPTION_SHARD_COUNT; shardIndex += 1) {
    const shardPath = path.join(shardsPath, getJobDescriptionShardFilename(shardIndex));
    if (!fs.existsSync(shardPath)) continue;

    const parsed: unknown = JSON.parse(fs.readFileSync(shardPath, 'utf8'));
    if (!isJobDescriptionShard(parsed)) {
      throw new Error(`Invalid job description shard: ${shardPath}`);
    }

    Object.assign(store.descriptions, parsed.descriptions);
    Object.assign(store.aliases, parsed.aliases);
  }

  return store;
}

export function buildJobDescriptionAliases(
  jobs: Array<Pick<Job, 'id' | 'title' | 'company' | 'link' | 'slug'>>,
  descriptions: Record<string, string>,
): Record<string, string> {
  const candidates = new Map<string, string>();
  const conflicts = new Set<string>();

  for (const job of jobs) {
    const contentKey = getJobContentKey(job);
    if (!descriptions[contentKey]) continue;

    for (const alias of [job.id, job.slug]) {
      if (!alias || alias === contentKey) continue;
      const existing = candidates.get(alias);
      if (existing && existing !== contentKey) conflicts.add(alias);
      else candidates.set(alias, contentKey);
    }
  }

  for (const alias of conflicts) candidates.delete(alias);
  return Object.fromEntries(candidates);
}

export function writeJobDescriptionStore(store: JobDescriptionStore, root = process.cwd()): void {
  const shards = Array.from({ length: JOB_DESCRIPTION_SHARD_COUNT }, createEmptyJobDescriptionShard);

  for (const [contentKey, content] of Object.entries(store.descriptions)) {
    if (!isJobContentKey(contentKey) || typeof content !== 'string') {
      throw new Error(`Job description store only accepts canonical content keys: ${contentKey}`);
    }
    shards[getJobDescriptionShardIndexForContentKey(contentKey)].descriptions[contentKey] = content;
  }

  for (const [alias, contentKey] of Object.entries(store.aliases)) {
    if (!alias || !store.descriptions[contentKey]) continue;
    shards[getJobDescriptionShardIndexForContentKey(contentKey)].aliases[alias] = contentKey;
  }

  writeShardsAtomically(shards, root);
}

function writeShardsAtomically(shards: JobDescriptionShard[], root: string): void {
  const shardsPath = getJobDescriptionShardsPath(root);
  const temporaryPath = `${shardsPath}.tmp-${process.pid}`;
  const backupPath = `${shardsPath}.backup-${process.pid}`;

  fs.rmSync(temporaryPath, { recursive: true, force: true });
  fs.mkdirSync(temporaryPath, { recursive: true });

  try {
    for (let shardIndex = 0; shardIndex < JOB_DESCRIPTION_SHARD_COUNT; shardIndex += 1) {
      const shardPath = path.join(temporaryPath, getJobDescriptionShardFilename(shardIndex));
      fs.writeFileSync(shardPath, `${JSON.stringify(shards[shardIndex])}\n`);
    }

    validateWrittenShards(temporaryPath, shards);
    if (fs.existsSync(shardsPath)) fs.renameSync(shardsPath, backupPath);

    try {
      fs.renameSync(temporaryPath, shardsPath);
    } catch (error) {
      if (fs.existsSync(backupPath)) fs.renameSync(backupPath, shardsPath);
      throw error;
    }

    fs.rmSync(backupPath, { recursive: true, force: true });
  } catch (error) {
    fs.rmSync(temporaryPath, { recursive: true, force: true });
    throw error;
  }
}

function validateWrittenShards(shardsPath: string, expected: JobDescriptionShard[]): void {
  for (let shardIndex = 0; shardIndex < JOB_DESCRIPTION_SHARD_COUNT; shardIndex += 1) {
    const shardPath = path.join(shardsPath, getJobDescriptionShardFilename(shardIndex));
    const parsed: unknown = JSON.parse(fs.readFileSync(shardPath, 'utf8'));
    if (!isJobDescriptionShard(parsed) || JSON.stringify(parsed) !== JSON.stringify(expected[shardIndex])) {
      throw new Error(`Failed to validate job description shard: ${shardPath}`);
    }
  }
}
