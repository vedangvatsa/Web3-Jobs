
import { FAVICON_FIRST_SLUGS, getCompanyFaviconUrl, resolveCompanyLogo } from '@/lib/company-logo';
import { getCompanyBySlug } from '@/lib/companies';
import { getCompanySlug } from '@/lib/job-slugs';
import type { Job } from '@/types';

export interface CompanyLogoData {
  logo: string | null;
  favicon: string | null;
}

export type CompanyLogoMap = Record<string, CompanyLogoData>;

/** Sync logo resolution for build-time snapshots (no company FS reads). */
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

/** Resolve logo data only for the jobs included in the current response page. */
export async function buildCompanyLogoMap(jobs: Job[]): Promise<CompanyLogoMap> {
  const slugs = Array.from(new Set(jobs.map((job) => getCompanySlug(job.company))));
  const entries = await Promise.all(
    slugs.map(async (slug): Promise<[string, CompanyLogoData]> => {
      if (FAVICON_FIRST_SLUGS.has(slug)) {
        const company = await getCompanyBySlug(slug);
        const favicon = getCompanyFaviconUrl(company?.website);
        if (favicon) return [slug, { logo: favicon, favicon: null }];
      }
      const logo = resolveCompanyLogo(slug);
      if (logo) return [slug, { logo, favicon: null }];

      const company = await getCompanyBySlug(slug);
      return [slug, { logo: null, favicon: getCompanyFaviconUrl(company?.website) }];
    })
  );

  return Object.fromEntries(entries);
}
