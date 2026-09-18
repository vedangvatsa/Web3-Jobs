import type { Job } from '@/types';
import { SITE_URL } from './event-og-url';
import { getCompanySlug } from './job-slugs';

export { SITE_URL } from './event-og-url';
export type { EventOgInput } from './event-og-url';
export {
  EVENT_OG_VERSION,
  hasEventPosterCover,
  buildEventOgImageUrl,
  resolveEventOgImageUrl,
  resolveEventPreviewImageUrl,
  eventOgImageMimeType,
} from './event-og-url';

/** Static section cards in /public — hubs without a per-entity PNG. */
export const STATIC_OG = {
  default: `${SITE_URL}/og-image.png`,
  jobs: `${SITE_URL}/og-image-jobs.png`,
  blog: `${SITE_URL}/og-image-blog.png`,
  news: `${SITE_URL}/og-news.png`,
  companies: `${SITE_URL}/og-companies.png`,
  tools: `${SITE_URL}/og-image-tools.png`,
  report: `${SITE_URL}/og-image-report.png`,
} as const;

/** Bump when the precompute card layout changes (cache-bust share URLs). */
export const JOB_OG_VERSION = '4';

function absoluteSiteAsset(pathOrUrl: string, siteUrl = SITE_URL): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith('/')) return `${siteUrl}${pathOrUrl}`;
  return `${siteUrl}/${pathOrUrl}`;
}

/** Per-job PNG from build (`public/og/jobs/{slug}.png`); static fallback if no slug. */
export function buildJobOgImageUrl(
  job: Pick<Job, 'title' | 'company' | 'location' | 'department' | 'slug'>,
  siteUrl = SITE_URL,
): string {
  const slug = (job.slug || '').trim();
  if (slug) {
    return `${siteUrl}/og/jobs/${encodeURIComponent(slug)}.png?v=${JOB_OG_VERSION}`;
  }
  return `${siteUrl}/og-image-jobs.png`;
}

/** Prefer the article hero; fall back to a static blog/news card. */
export function buildArticleOgImageUrl(
  article: { title: string; ogTitle?: string; category?: string; image?: string },
  siteUrl = SITE_URL,
): string {
  const image = (article.image || '').trim();
  if (
    image &&
    !image.includes('picsum.photos') &&
    !image.includes('/api/og')
  ) {
    return absoluteSiteAsset(image, siteUrl);
  }
  if (article.category === 'News') {
    return `${siteUrl}/og-news.png`;
  }
  return `${siteUrl}/og-image-blog.png`;
}

/** Per-company PNG from build (`public/og/companies/{slug}.png`). */
export function buildCompanyOgImageUrl(
  company: { name: string; jobCount?: number },
  siteUrl = SITE_URL,
): string {
  const slug = getCompanySlug(company.name);
  if (slug) {
    return `${siteUrl}/og/companies/${encodeURIComponent(slug)}.png?v=${JOB_OG_VERSION}`;
  }
  return `${siteUrl}/og-companies.png`;
}

export function buildDefaultOgImageUrl(siteUrl = SITE_URL): string {
  return `${siteUrl}/og-image.png`;
}
