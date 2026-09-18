import { getPublicJobUrl } from '@/lib/job-slugs';
import { buildCompanyLogoMapSync } from '@/lib/job-listing';
import type { CompanyLogoMap } from '@/lib/job-listing';
import type { Job } from '@/types';

export function getJobTags(job: Job): string[] {
  const tags = (job as Job & { tags?: unknown }).tags;
  return Array.isArray(tags)
    ? tags.filter((tag): tag is string => typeof tag === 'string')
    : [];
}

export function filterJobsList(
  allJobs: Job[],
  options: { search?: string; tag?: string; company?: string },
): Job[] {
  let filtered = allJobs;
  const search = options.search?.toLowerCase().trim();
  const tag = options.tag?.toLowerCase().trim();
  const company = options.company?.toLowerCase().trim();

  if (search) {
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(search) ||
        j.company.toLowerCase().includes(search) ||
        getJobTags(j).some((t) => t.toLowerCase().includes(search)),
    );
  }

  if (tag) {
    filtered = filtered.filter((j) =>
      getJobTags(j).some((tagItem) => tagItem.toLowerCase() === tag || tagItem.toLowerCase().includes(tag)),
    );
  }

  if (company) {
    filtered = filtered.filter((j) => j.company.toLowerCase().includes(company));
  }

  return filtered;
}

/** Strip ATS `source` from public listing payloads; cast keeps Job shape for callers. */
export function toPublicJobRows(jobs: Job[]): Job[] {
  return jobs.map((job) => {
    const { source: _source, ...rest } = job;
    return { ...rest, link: getPublicJobUrl(job) } as Job;
  });
}

export function paginatePublicJobs(
  allJobs: Job[],
  options: { search?: string; tag?: string; company?: string; limit: number; offset: number },
): { data: Job[]; companyLogos: CompanyLogoMap; meta: { total: number; limit: number; offset: number; count: number } } {
  const filtered = filterJobsList(allJobs, options);
  const total = filtered.length;
  const slice = filtered.slice(options.offset, options.offset + options.limit);
  const data = toPublicJobRows(slice);

  return {
    data,
    companyLogos: buildCompanyLogoMapSync(slice),
    meta: {
      total,
      limit: options.limit,
      offset: options.offset,
      count: data.length,
    },
  };
}
