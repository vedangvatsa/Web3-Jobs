import type { Job } from '@/types';
import { getCompanySlug } from './job-slugs';
import { resolveCompanyLogo } from './company-logo';

export const JOB_OG_VERSION = '2';
export const SITE_URL = 'https://hashtagweb3.com';

/** Builds the single canonical OG URL for jobs. */
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

/** Builds the single canonical OG URL for events. */
export function buildEventOgImageUrl(
  event: { name: string; location?: string; startDate?: string },
  siteUrl = SITE_URL,
): string {
  return `${siteUrl}/api/og?type=event&title=${encodeURIComponent(event.name)}&location=${encodeURIComponent(event.location || 'Web3 Event')}${event.startDate ? `&date=${encodeURIComponent(event.startDate)}` : ''}`;
}

/** Builds the single canonical OG URL for articles. */
export function buildArticleOgImageUrl(
  article: { title: string; ogTitle?: string; category?: string },
  siteUrl = SITE_URL,
): string {
  const displayTitle = article.ogTitle || article.title;
  return `${siteUrl}/api/og?type=article&title=${encodeURIComponent(displayTitle)}${article.category ? `&category=${encodeURIComponent(article.category)}` : ''}`;
}

/** Builds the single canonical OG URL for companies. */
export function buildCompanyOgImageUrl(
  company: { name: string; jobCount?: number },
  siteUrl = SITE_URL,
): string {
  return `${siteUrl}/api/og?type=company&title=${encodeURIComponent(company.name)}${company.jobCount !== undefined ? `&count=${company.jobCount}` : ''}`;
}
