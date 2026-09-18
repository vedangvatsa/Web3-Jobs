import type { Job } from '@/types';
import { buildCompanyLogoMapSync, type CompanyLogoMap } from '@/lib/job-logo-map';
import { getPublicJobUrl } from '@/lib/job-slugs';

let catalogPromise: Promise<Job[]> | null = null;

function getJobTags(job: Job): string[] {
  const tags = (job as Job & { tags?: unknown }).tags;
  return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : [];
}

/** Jobs listing from static JSON (CDN) — avoids /api/jobs on Cloudflare Workers (1102). */
export function loadJobsCatalog(signal?: AbortSignal): Promise<Job[]> {
  if (!catalogPromise) {
    catalogPromise = fetch('/data/jobs-runtime.json', {
      headers: { Accept: 'application/json' },
      cache: 'force-cache',
    }).then(async (res) => {
      if (!res.ok) {
        catalogPromise = null;
        throw new Error(`Jobs catalog HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        catalogPromise = null;
        throw new Error('Jobs catalog malformed');
      }
      return data as Job[];
    }).catch((err) => {
      catalogPromise = null;
      throw err;
    });
  }
  return catalogPromise;
}

export type JobsQueryResult = {
  data: Job[];
  companyLogos: CompanyLogoMap;
  meta: { total: number };
};

export function queryJobsCatalog(
  allJobs: Job[],
  options: { search?: string; limit: number; offset: number }
): JobsQueryResult {
  const search = options.search?.trim() ?? '';
  let filtered = allJobs;

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        getJobTags(j).some((t) => t.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;
  const paginated = filtered.slice(options.offset, options.offset + options.limit);
  const data: Job[] = paginated.map((job) => {
    const { source: _source, ...rest } = job;
    return { ...rest, link: getPublicJobUrl(job) } as Job;
  });

  return {
    data,
    companyLogos: buildCompanyLogoMapSync(paginated),
    meta: { total },
  };
}
