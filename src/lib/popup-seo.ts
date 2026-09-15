import type { Metadata } from 'next';
import type { Popup } from '@/types/popup';

export function popupPageMetadata(popup: Popup): Metadata {
  const siteUrl = 'https://hashtagweb3.com';
  const title = `${popup.name} Popup`;
  const description = popup.summary;
  const url = `${siteUrl}/${popup.slug}`;
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
