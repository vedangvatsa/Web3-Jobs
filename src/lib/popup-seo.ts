import type { Metadata } from 'next';
import { seoSocialTitle, seoTitleSegment } from '@/lib/seo-title';
import type { Popup } from '@/types/popup';
import { formatPopupField } from '@/lib/popup-narrative';
import { getPopupBySlug } from '@/lib/popups';

/** Old popup slugs → current slug. */
const POPUP_SLUG_ALIASES: Record<string, string> = {
  logos: 'logos-society',
};

export function resolvePopupSlug(segment: string): string {
  return POPUP_SLUG_ALIASES[segment] ?? segment;
}

/** Canonical public path for a popup detail page. */
export function getPopupPath(slug: string): string {
  const canonical = resolvePopupSlug(slug);
  return `/${canonical}`;
}

/** Resolve a root path segment to a popup record (aliases included). */
export function resolvePopupForPathSegment(segment: string): Popup | undefined {
  const canonical = resolvePopupSlug(segment);
  return getPopupBySlug(canonical);
}

export function popupPageMetadata(popup: Popup): Metadata {
  const siteUrl = 'https://hashtagweb3.com';
  const titleSegment = `${popup.name} popup`;
  const socialTitle = seoSocialTitle(titleSegment);
  const description = formatPopupField(popup.summary);
  const path = getPopupPath(popup.slug);
  const url = `${siteUrl}${path}`;
  const cover = popup.coverImages?.[0];
  const ogImage = cover
    ? `${siteUrl}${cover}`
    : `${siteUrl}/og-image.png`;

  return {
    title: seoTitleSegment(titleSegment),
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: socialTitle,
      description,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: popup.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [ogImage],
    },
  };
}
