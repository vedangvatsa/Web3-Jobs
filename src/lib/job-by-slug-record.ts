import fs from "fs";
import path from "path";
import type { Job } from "@/types";
import { fetchSiteAsset } from "./load-static-json";
import { getJobSlugShardIndex, getJobShardFilename } from "./job-shards";

const shardCache = new Map<number, Record<string, Job>>();
const shardLoadPromises = new Map<number, Promise<Record<string, Job> | null>>();

function readLocalJobShard(filename: string): Record<string, Job> | null {
  try {
    if (typeof fs === "undefined" || !fs.existsSync) return null;
    for (const dir of [
      path.join("public", "job-shards"),
      path.join("content", "job-shards"),
    ]) {
      const filePath = path.join(process.cwd(), dir, filename);
      if (!fs.existsSync(filePath)) continue;
      return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, Job>;
    }
  } catch {
    return null;
  }
  return null;
}

async function loadJobShardFile(shardIndex: number): Promise<Record<string, Job> | null> {
  const filename = getJobShardFilename(shardIndex);
  const local = readLocalJobShard(filename);
  if (local) return local;

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchSiteAsset(`/job-shards/${filename}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const parsed: unknown = await res.json();
      if (!parsed || typeof parsed !== "object") throw new Error("Invalid shard JSON");
      return parsed as Record<string, Job>;
    } catch (err) {
      lastError = err;
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }
  console.error(`[fetchJobBySlug] shard ${filename} unavailable:`, lastError);
  return null;
}

/** Load a single job record by slug from a 64-shard partitioned catalog instead of 6,000+ files or the full catalog. */
export async function fetchJobBySlug(slug: string): Promise<Job | null> {
  const clean = slug.toLowerCase().trim();
  if (!clean) return null;

  const shardIndex = getJobSlugShardIndex(clean);
  const cachedShard = shardCache.get(shardIndex);
  if (cachedShard) {
    return cachedShard[clean] ?? null;
  }

  let pending = shardLoadPromises.get(shardIndex);
  if (!pending) {
    pending = loadJobShardFile(shardIndex);
    shardLoadPromises.set(shardIndex, pending);
  }

  try {
    const shard = await pending;
    if (shard) {
      shardCache.set(shardIndex, shard);
      return shard[clean] ?? null;
    }
    return null;
  } finally {
    shardLoadPromises.delete(shardIndex);
  }
}
