import type { Metadata } from 'next';
import type { Popup } from '@/types/popup';
import { formatPopupField } from '@/lib/popup-narrative';

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

export function popupPageMetadata(popup: Popup): Metadata {
  const siteUrl = 'https://hashtagweb3.com';
  const title = `${popup.name} Popup`;
  const description = formatPopupField(popup.summary);
  const path = getPopupPath(popup.slug);
  const url = `${siteUrl}${path}`;
  const cover = popup.coverImages?.[0];
  const ogImage = cover
    ? `${siteUrl}${cover}`
    : `${siteUrl}/api/og?type=default&title=${encodeURIComponent(popup.name)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: `${title} | Hashtag Web3`,
      description,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: popup.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Hashtag Web3`,
      description,
      images: [ogImage],
    },
  };
}
