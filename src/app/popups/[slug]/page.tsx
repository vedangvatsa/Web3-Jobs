import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PageShell } from '@/components/page-shell';
import { PopupDetailView } from '@/components/popup-detail-view';
import { getPopupBySlug, getPopupSlugs } from '@/lib/popups';
import { popupPageMetadata } from '@/lib/popup-seo';

type PopupPageProps = {
  params: { slug: string };
};

export const dynamicParams = true;
export const revalidate = 3600;

export function generateStaticParams() {
  return getPopupSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PopupPageProps): Metadata {
  const popup = getPopupBySlug(params.slug);
  if (!popup) {
    return { title: 'Popup not found' };
  }
  return popupPageMetadata(popup);
}

export default function PopupDetailPage({ params }: PopupPageProps) {
  const popup = getPopupBySlug(params.slug);
  if (!popup) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <PageShell>
          <PopupDetailView popup={popup} />
        </PageShell>
      </main>
    </div>
  );
}
