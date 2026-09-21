import type { Job } from '@/types';
import { fetchJobBySlug } from '@/lib/job-by-slug-record';
import { getJobs } from '@/lib/jobs';
import { getJobPublicPath } from '@/lib/job-slugs';
import legacyArchiveJson from '../../content/legacy-slugs-archive.json';

type LegacyRecord = { newSlug?: string; id?: string; company?: string; title?: string };

const legacyArchive = legacyArchiveJson as Record<string, LegacyRecord>;

/** Resolve a /jobs/:segment URL to a live job without loading job-guides (cheerio). */
export async function resolveJobForLegacyRedirect(segment: string): Promise<Job | null> {
  const clean = segment.toLowerCase().trim();
  if (!clean) return null;

  const bySlug = await fetchJobBySlug(clean);
  if (bySlug?.slug) return bySlug;

  const jobs = await getJobs();
  const byId = jobs.find((job) => job.id?.toLowerCase() === clean);
  if (byId?.slug) return byId;

  const archived = legacyArchive[clean];
  if (archived?.newSlug) {
    const target = await fetchJobBySlug(archived.newSlug.toLowerCase());
    if (target?.slug) return target;
  }

  return null;
}

export function legacyJobRedirectTarget(job: Job): string {
  return getJobPublicPath(job);
}
