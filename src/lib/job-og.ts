import type { Job } from '@/types';
import { getCompanySlug } from './job-slugs';
import { resolveCompanyLogo } from './company-logo';

export const JOB_OG_VERSION = '2';
export const SITE_URL = 'https://hashtagweb3.com';

/** Builds the single canonical OG URL used by pages, crawlers, and publishers. */
export function buildJobOgImageUrl(
  job: Pick<Job, 'title' | 'company' | 'location' | 'department'>,
  siteUrl = SITE_URL,
): string {
  const companySlug = getCompanySlug(job.company);
  let logoSrc: string | null = null;
  try {
    logoSrc = resolveCompanyLogo(companySlug);
  } catch {
    // A missing local logo must not prevent the text card from rendering.
  }

  const department = typeof job.department === 'string' ? job.department : '';
  return `${siteUrl}/api/og?type=job&v=${JOB_OG_VERSION}&title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&location=${encodeURIComponent(job.location || 'Remote')}${department ? `&department=${encodeURIComponent(department)}` : ''}${logoSrc ? `&logo=${encodeURIComponent(logoSrc)}` : ''}`;
}
