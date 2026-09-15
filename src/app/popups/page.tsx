import type { Metadata } from 'next';
import type { CollectionPage, WithContext } from 'schema-dts';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { PopupsBoard } from '@/components/popups-board';
import { getAllPopups } from '@/lib/popups';

export const metadata: Metadata = {
  title: 'Popups',
  description:
    'Directory of popup cities, permanent nodes, SEZs, and builder villages for Web3 and frontier tech. Filter by type and region.',
  alternates: {
    canonical: 'https://hashtagweb3.com/popups',
  },
  openGraph: {
    type: 'website',
    title: 'Popups | Hashtag Web3',
    description:
      'Directory of popup cities, permanent nodes, SEZs, and builder villages for Web3 and frontier tech.',
    url: 'https://hashtagweb3.com/popups',
    images: [
      {
        url: 'https://hashtagweb3.com/api/og?type=default&title=Popups',
        width: 1200,
        height: 630,
        alt: 'Popups directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Popups | Hashtag Web3',
    description:
      'Directory of popup cities, permanent nodes, SEZs, and builder villages for Web3 and frontier tech.',
    images: ['https://hashtagweb3.com/api/og?type=default&title=Popups'],
  },
};

export default function PopupsPage() {
  const popups = getAllPopups();

  const pageSchema: WithContext<CollectionPage> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Popups',
    url: 'https://hashtagweb3.com/popups',
    description:
      'Directory of popup cities, permanent nodes, SEZs, and builder villages for Web3 and frontier tech.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1">
          <PageShell>
            <PageHeader title="Popups" />
            <p className="mb-6 -mt-4 text-center text-sm text-muted-foreground">
              Temporary villages, permanent nodes, and startup cities for builders.
            </p>
            <PopupsBoard popups={popups} />
          </PageShell>
        </main>
      </div>
    </>
  );
}
