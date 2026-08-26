import 'server-only';

import { getCompanyFaviconUrl, resolveCompanyLogo } from '@/lib/company-logo';
import { getCompanyBySlug } from '@/lib/companies';
import { getCompanySlug } from '@/lib/job-slugs';
import type { Job } from '@/types';

export interface CompanyLogoData {
  logo: string | null;
  favicon: string | null;
}

export type CompanyLogoMap = Record<string, CompanyLogoData>;

/** Resolve logo data only for the jobs included in the current response page. */
export async function buildCompanyLogoMap(jobs: Job[]): Promise<CompanyLogoMap> {
  const slugs = Array.from(new Set(jobs.map((job) => getCompanySlug(job.company))));
  const entries = await Promise.all(
    slugs.map(async (slug): Promise<[string, CompanyLogoData]> => {
      const logo = resolveCompanyLogo(slug);
      if (logo) return [slug, { logo, favicon: null }];

      const company = await getCompanyBySlug(slug);
      return [slug, { logo: null, favicon: getCompanyFaviconUrl(company?.website) }];
    })
  );

  return Object.fromEntries(entries);
}
