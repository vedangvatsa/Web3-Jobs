import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getPopupBySlug, getPopupSlugs } from '@/lib/popups';
import { getPopupPath, popupPageMetadata, resolvePopupSlug } from '@/lib/popup-seo';

type PopupPageProps = {
  params: { slug: string };
};

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return getPopupSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PopupPageProps): Metadata {
  const slug = resolvePopupSlug(params.slug);
  const popup = getPopupBySlug(slug);
  if (!popup) {
    return { title: 'Popup not found' };
  }
  return popupPageMetadata(popup);
}

export default function PopupSlugPage({ params }: PopupPageProps) {
  const slug = resolvePopupSlug(params.slug);
  const popup = getPopupBySlug(slug);
  if (!popup) {
    notFound();
  }

  permanentRedirect(getPopupPath(popup.slug));
}
