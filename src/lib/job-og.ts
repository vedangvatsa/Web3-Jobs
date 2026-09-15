import type { Job } from '@/types';
import { getCompanySlug } from './job-slugs';
import { resolveCompanyLogo } from './company-logo';
import { formatEventLocation } from './events';

export const JOB_OG_VERSION = '2';
export const EVENT_OG_VERSION = '2';
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

type EventOgInput = {
  name: string;
  location?: string;
  city?: string;
  country?: string;
  startDate?: string;
  coverImage?: string | null;
};

export function hasEventPosterCover(cover?: string | null): boolean {
  const value = (cover || '').trim();
  return Boolean(value && !value.includes('/api/og'));
}

/** Dynamic Hashtag event card (fallback when no poster image exists). */
export function buildEventOgImageUrl(event: EventOgInput, siteUrl = SITE_URL): string {
  const location = formatEventLocation({
    location: event.location || '',
    city: event.city,
    country: event.country,
  });
  const datePart = event.startDate?.slice(0, 10) || '';
  return `${siteUrl}/api/og?type=event&v=${EVENT_OG_VERSION}&title=${encodeURIComponent(event.name)}&location=${encodeURIComponent(location)}${datePart ? `&date=${encodeURIComponent(datePart)}` : ''}`;
}

/** Prefer poster/coverImage for link previews; fall back to dynamic /api/og event card. */
export function resolveEventOgImageUrl(event: EventOgInput, siteUrl = SITE_URL): string {
  const cover = (event.coverImage || '').trim();
  if (hasEventPosterCover(cover)) {
    if (/^https?:\/\//i.test(cover)) return cover;
    if (cover.startsWith('/')) return `${siteUrl}${cover}`;
  }
  return buildEventOgImageUrl(event, siteUrl);
}

/** Same as resolveEventOgImageUrl, as site-relative path when hosted on Hashtag Web3. */
export function resolveEventPreviewImageUrl(event: EventOgInput, siteUrl = SITE_URL): string {
  const absolute = resolveEventOgImageUrl(event, siteUrl);
  if (absolute.startsWith(`${siteUrl}/`)) return absolute.slice(siteUrl.length);
  if (absolute === siteUrl) return '/';
  return absolute;
}

export function eventOgImageMimeType(imageUrl: string): 'image/png' | 'image/jpeg' | 'image/webp' {
  const path = imageUrl.split('?')[0].toLowerCase();
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  return 'image/png';
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
