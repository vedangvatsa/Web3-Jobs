export const JOB_SHARD_COUNT = 64;
export const JOB_SHARDS_DIRECTORY = "job-shards";

export function getJobSlugShardIndex(slug: string): number {
  let hash = 5381;
  const clean = slug.toLowerCase().trim();
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) + hash) + clean.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % JOB_SHARD_COUNT;
}

export function getJobShardFilename(shardIndex: number): string {
  if (!Number.isInteger(shardIndex) || shardIndex < 0 || shardIndex >= JOB_SHARD_COUNT) {
    throw new Error(`Invalid job shard index: ${shardIndex}`);
  }
  return `job-shard-${shardIndex.toString().padStart(2, "0")}.json`;
}
