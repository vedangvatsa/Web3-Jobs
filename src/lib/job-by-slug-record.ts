import type { Job } from "@/types";
import { getJobSlug } from "./job-slugs";
import { getJobs } from "./jobs";

let runtimeSlugIndex: Map<string, Job> | null = null;
let runtimeSlugIndexLoad: Promise<Map<string, Job>> | null = null;
let runtimeIdIndex: Map<string, Job> | null = null;

async function getRuntimeIndexes(): Promise<{
  bySlug: Map<string, Job>;
  byId: Map<string, Job>;
}> {
  if (runtimeSlugIndex && runtimeIdIndex) {
    return { bySlug: runtimeSlugIndex, byId: runtimeIdIndex };
  }
  if (!runtimeSlugIndexLoad) {
    runtimeSlugIndexLoad = getJobs()
      .then((jobs) => {
        const bySlug = new Map<string, Job>();
        const byId = new Map<string, Job>();
        for (const job of jobs) {
          const slug = getJobSlug(job).toLowerCase().trim();
          if (slug) bySlug.set(slug, job);
          const id = job.id?.toLowerCase().trim();
          if (id) byId.set(id, job);
        }
        runtimeSlugIndex = bySlug;
        runtimeIdIndex = byId;
        return bySlug;
      })
      .finally(() => {
        runtimeSlugIndexLoad = null;
      });
  }
  await runtimeSlugIndexLoad;
  return {
    bySlug: runtimeSlugIndex!,
    byId: runtimeIdIndex!,
  };
}

/**
 * Resolve a job by short slug from the committed jobs-runtime catalog.
 * Does not depend on gitignored job-shards or CDN shard fetches — those were
 * the source of intermittent /:slug 404s on Firebase standalone.
 */
export async function fetchJobBySlug(slug: string): Promise<Job | null> {
  const clean = slug.toLowerCase().trim();
  if (!clean) return null;
  const { bySlug } = await getRuntimeIndexes();
  return bySlug.get(clean) ?? null;
}

/** Resolve a job by employer posting id (feeds advertise /jobs/{id}). */
export async function fetchJobById(id: string): Promise<Job | null> {
  const clean = id.toLowerCase().trim();
  if (!clean) return null;
  const { byId } = await getRuntimeIndexes();
  return byId.get(clean) ?? null;
}
