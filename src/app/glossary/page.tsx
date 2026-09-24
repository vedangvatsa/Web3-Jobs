import { getAllTerms, getCategoriesWithCounts } from '@/lib/glossary';
import type { Metadata } from 'next';
import { PageShell } from '@/components/page-shell';
import { GlossaryPageClientWrapper } from '@/components/glossary-page-client-wrapper';

export const metadata: Metadata = {
  title: 'Web3 Glossary',
  description: 'Web3 glossary covering blockchain, cryptocurrency, DeFi, and NFT terminology with plain-language explanations.',
  alternates: {
    canonical: 'https://hashtagweb3.com/glossary',
  },
  openGraph: {
    type: 'website',
    title: 'Web3 Glossary | Hashtag Web3',
    description: 'Complete guide to Web3 terminology. Understand blockchain, DeFi, NFTs, and cryptocurrency concepts.',
    url: 'https://hashtagweb3.com/glossary',
    images: [{
      url: 'https://hashtagweb3.com/og/pages/glossary.png',
      width: 1200,
      height: 630,
      alt: 'Web3 Glossary',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Glossary | Hashtag Web3',
    description: 'Explore 200+ Web3 and cryptocurrency terms. Complete guide to blockchain, DeFi, NFTs, and decentralized technology concepts.',
    images: ['https://hashtagweb3.com/og/pages/glossary.png'],
  },
};

export const revalidate = 86400;
export const dynamic = 'force-static';

export default async function GlossaryPage() {
  const allTerms = await getAllTerms();
  const categories = await getCategoriesWithCounts();
  const siteUrl = 'https://hashtagweb3.com';

  const glossaryPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}/glossary#page`,
    url: `${siteUrl}/glossary`,
    name: 'Web3 Glossary | Hashtag Web3',
    description: 'Complete guide to Web3, blockchain, DeFi, NFT, and crypto terminology with plain-language explanations.',
    isPartOf: {
      '@type': 'WebSite',
      url: siteUrl,
      name: 'Hashtag Web3',
    },
    about: {
      '@type': 'DefinedTermSet',
      '@id': `${siteUrl}/glossary#termset`,
      name: 'Web3 Glossary',
      description: 'Comprehensive taxonomy of blockchain, DeFi, and cryptocurrency terms',
      url: `${siteUrl}/glossary`,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Glossary', item: `${siteUrl}/glossary` },
      ],
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(glossaryPageSchema) }}
      />
      <main className="flex-grow">
        <PageShell>
          <GlossaryPageClientWrapper allTerms={allTerms} categories={categories} />
        </PageShell>
      </main>
    </div>
  );
}
