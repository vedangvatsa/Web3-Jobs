
import { FAVICON_FIRST_SLUGS, getCompanyFaviconUrl, resolveCompanyLogo } from '@/lib/company-logo';
import { getCompanyBySlug } from '@/lib/companies';
import { getCompanySlug } from '@/lib/job-slugs';
import type { Job } from '@/types';
import type { CompanyLogoData, CompanyLogoMap } from '@/lib/job-logo-map';

export type { CompanyLogoData, CompanyLogoMap } from '@/lib/job-logo-map';
export { buildCompanyLogoMapSync } from '@/lib/job-logo-map';

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
