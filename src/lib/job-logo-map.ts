import { getCompanySlug } from '@/lib/job-slugs';
import type { Job } from '@/types';

export interface CompanyLogoData {
  logo: string | null;
  favicon: string | null;
}

export type CompanyLogoMap = Record<string, CompanyLogoData>;

/** Best-guess logo path without Node fs (safe for client bundles). */
function guessCompanyLogoPath(slug: string): string | null {
  if (slug === 'circle') return null;
  return `/logo/companies/${slug}.webp`;
}

/** Sync logo resolution for client-side and build-time snapshots. */
export function buildCompanyLogoMapSync(jobs: Job[]): CompanyLogoMap {
  const slugs = Array.from(new Set(jobs.map((job) => getCompanySlug(job.company))));
  const map: CompanyLogoMap = {};
  for (const slug of slugs) {
    map[slug] = { logo: guessCompanyLogoPath(slug), favicon: null };
  }
  return map;
}
