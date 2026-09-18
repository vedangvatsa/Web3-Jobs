import {
  FAVICON_FIRST_SLUGS,
  getCompanyFaviconUrlBySlug,
  resolveCompanyLogo,
} from '@/lib/company-logo';
import { getCompanySlug } from '@/lib/job-slugs';
import type { Job } from '@/types';

export interface CompanyLogoData {
  logo: string | null;
  favicon: string | null;
}

export type CompanyLogoMap = Record<string, CompanyLogoData>;

function logoEntryForSlug(slug: string): CompanyLogoData {
  if (FAVICON_FIRST_SLUGS.has(slug)) {
    const favicon = getCompanyFaviconUrlBySlug(slug);
    return { logo: favicon, favicon: null };
  }
  const logo = resolveCompanyLogo(slug);
  if (logo) return { logo, favicon: null };
  return { logo: null, favicon: getCompanyFaviconUrlBySlug(slug) };
}

/** Sync logo resolution for client-side and build-time snapshots (index-only, no fs). */
export function buildCompanyLogoMapSync(jobs: Job[]): CompanyLogoMap {
  const slugs = Array.from(new Set(jobs.map((job) => getCompanySlug(job.company))));
  const map: CompanyLogoMap = {};
  for (const slug of slugs) {
    map[slug] = logoEntryForSlug(slug);
  }
  return map;
}
