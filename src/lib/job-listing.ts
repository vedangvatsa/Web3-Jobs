
import { FAVICON_FIRST_SLUGS, getCompanyFaviconUrl, getCompanyFaviconUrlBySlug, resolveCompanyLogo } from '@/lib/company-logo';
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
      const company = await getCompanyBySlug(slug);
      if (FAVICON_FIRST_SLUGS.has(slug)) {
        const favicon = getCompanyFaviconUrl(company?.website);
        if (favicon) return [slug, { logo: favicon, favicon: null }];
      }
      const logo = resolveCompanyLogo(slug);
      const favicon =
        getCompanyFaviconUrl(company?.website) ?? getCompanyFaviconUrlBySlug(slug);
      if (logo) return [slug, { logo, favicon }];

      return [slug, { logo: null, favicon }];
    })
  );

  return Object.fromEntries(entries);
}
