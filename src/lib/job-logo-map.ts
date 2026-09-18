import { FAVICON_FIRST_SLUGS, resolveCompanyLogo } from '@/lib/company-logo';
import { getCompanySlug } from '@/lib/job-slugs';
import type { Job } from '@/types';

export interface CompanyLogoData {
  logo: string | null;
  favicon: string | null;
}

export type CompanyLogoMap = Record<string, CompanyLogoData>;

/** Sync logo resolution for client-side and build-time snapshots (index-only, no fs). */
export function buildCompanyLogoMapSync(jobs: Job[]): CompanyLogoMap {
  const slugs = Array.from(new Set(jobs.map((job) => getCompanySlug(job.company))));
  const map: CompanyLogoMap = {};
  for (const slug of slugs) {
    const logo = resolveCompanyLogo(slug);
    if (logo) {
      map[slug] = { logo, favicon: null };
      continue;
    }
    if (FAVICON_FIRST_SLUGS.has(slug)) {
      map[slug] = { logo: null, favicon: null };
      continue;
    }
    map[slug] = { logo: null, favicon: null };
  }
  return map;
}
