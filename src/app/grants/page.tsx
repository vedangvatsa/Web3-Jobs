import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { CommunityFeedBanner } from '@/components/community-feed-banner';
import { GrantsBoard } from '@/components/grants/grants-board';
import { LogoStrip } from '@/components/logo-strip';
import { getGrantsPageDiscoverDescription } from '@/lib/grant-count';
import { getGrantsSync } from '@/lib/grants';

export const dynamic = 'force-static';
export const revalidate = 3600;

const grantsTitle = 'Grants & Credits (2026 Directory)';
const grantsDesc = getGrantsPageDiscoverDescription();

export const metadata: Metadata = {
  title: grantsTitle,
  description: grantsDesc,
  alternates: {
    canonical: 'https://hashtagweb3.com/grants',
  },
  openGraph: {
    type: 'website',
    title: grantsTitle,
    description: grantsDesc,
    url: 'https://hashtagweb3.com/grants',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-jobs.png',
        width: 1200,
        height: 630,
        alt: 'Hashtag Web3 Grants & Credits',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: grantsTitle,
    description: grantsDesc,
    images: ['https://hashtagweb3.com/og-image-jobs.png'],
  },
};

const grantLogos = [
  { name: 'Google Cloud', src: '/logo/companies/google.webp', maxHeight: 20 },
  { name: 'AWS', src: '/logo/companies/aws.webp', maxHeight: 24 },
  { name: 'Anthropic', src: '/logo/companies/anthropic.svg', maxHeight: 15 },
  { name: 'Microsoft', src: '/logo/companies/microsoft.webp', maxHeight: 19 },
  { name: 'GitHub', src: '/logo/companies/github-lockup.svg', maxHeight: 20 },
  { name: 'Solana', src: '/logo/companies/solana-real.svg', maxHeight: 16 },
];

export default function GrantsPage() {
  const grants = getGrantsSync();
  const total = grants.length;
  const siteUrl = 'https://hashtagweb3.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/grants#page`,
        url: `${siteUrl}/grants`,
        name: 'Grants & Credits Directory',
        description: `Browse ${total} verified Web3 grants, open-source funding rounds, and startup credits.`,
        isPartOf: { '@type': 'WebSite', url: siteUrl, name: 'Hashtag Web3' },
      },
      {
        '@type': 'ItemList',
        name: 'Active Grants & Startup Credits',
        numberOfItems: total,
        itemListElement: grants.slice(0, 50).map((grant, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: grant.url,
          name: `${grant.name} by ${grant.provider}`,
          description: grant.description,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1" data-grants-page>
          <PageShell>
            <PageHeader title="Grants & Credits" />
            <LogoStrip title="Grants & credits from organizations like:" logos={grantLogos} />
            <CommunityFeedBanner variant="community" />
            <GrantsBoard initialGrants={grants} />
          </PageShell>
        </main>
      </div>
    </>
  );
}
