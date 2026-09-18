export const EVENT_OG_VERSION = '6';
export const SITE_URL = 'https://hashtagweb3.com';

export type EventOgInput = {
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

/** Static events card when no poster/cover exists (no Serverless OG renderer). */
export function buildEventOgImageUrl(_event: EventOgInput, siteUrl = SITE_URL): string {
  return `${siteUrl}/og-image.png`;
}

/** Prefer event poster/coverImage for previews; fall back to static site card. */
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
