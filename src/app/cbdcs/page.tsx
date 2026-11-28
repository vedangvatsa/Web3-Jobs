import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { CommunityFeedBanner } from '@/components/community-feed-banner';
import { CbdcsBoard } from '@/components/cbdcs/cbdcs-board';
import { LogoStrip } from '@/components/logo-strip';
import {
  getCbdcsSync,
  getCbdcStatuses,
  getCbdcTypes,
  getCbdcTechOptions,
} from '@/lib/cbdcs';
import { seoSocialTitle, seoTitleSegment } from '@/lib/seo-title';

export const dynamic = 'force-static';
export const revalidate = 3600;

const cbdcsTitleSegment = 'CBDC Tracker 2026: Global Central Bank Digital Currencies';
const cbdcsSocialTitle = seoSocialTitle(cbdcsTitleSegment);
const cbdcsDesc =
  'Track 180+ Central Bank Digital Currency (CBDC) projects worldwide across 100+ nations. Monitor live status, retail vs wholesale pilots, DLT technology, and central bank developments.';

export const metadata: Metadata = {
  title: seoTitleSegment(cbdcsTitleSegment),
  description: cbdcsDesc,
  alternates: {
    canonical: 'https://hashtagweb3.com/cbdcs',
  },
  openGraph: {
    type: 'website',
    title: cbdcsSocialTitle,
    description: cbdcsDesc,
    url: 'https://hashtagweb3.com/cbdcs',
    images: [
      {
        url: 'https://hashtagweb3.com/og/pages/grants.png',
        width: 1200,
        height: 630,
        alt: 'Hashtag Web3 CBDC Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: cbdcsSocialTitle,
    description: cbdcsDesc,
    images: ['https://hashtagweb3.com/og/pages/grants.png'],
  },
};

const centralBankLogos = [
  { name: 'Ethereum', src: '/logo/companies/ethereum.svg', maxHeight: 20 },
  { name: 'Solana', src: '/logo/companies/solana-real.svg', maxHeight: 16 },
  { name: 'Base', src: '/logo/companies/base.svg', maxHeight: 20 },
  { name: 'Arbitrum', src: '/logo/companies/arbitrum.svg', maxHeight: 20 },
  { name: 'Chainlink', src: '/logo/companies/chainlink.svg', maxHeight: 22 },
  { name: 'Google Cloud', src: '/logo/companies/google.webp', maxHeight: 20 },
];

export default function CbdcsPage() {
  const cbdcs = getCbdcsSync();
  const statusOptions = getCbdcStatuses();
  const typeOptions = getCbdcTypes();
  const techOptions = getCbdcTechOptions();
  const total = cbdcs.length;
  const siteUrl = 'https://hashtagweb3.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/cbdcs#page`,
        url: `${siteUrl}/cbdcs`,
        name: 'Global CBDC Tracker 2026',
        description: cbdcsDesc,
        isPartOf: { '@type': 'WebSite', url: siteUrl, name: 'Hashtag Web3' },
      },
      {
        '@type': 'ItemList',
        name: 'Central Bank Digital Currencies',
        numberOfItems: total,
        itemListElement: cbdcs.slice(0, 30).map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${c.digitalCurrency} (${c.country})`,
          url: `${siteUrl}/cbdcs/${c.slug}`,
          description: c.goals || `${c.status} CBDC project by ${c.centralBank}`,
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
        <main className="flex-1" data-cbdcs-page>
          <PageShell>
            <PageHeader title="Global CBDC Tracker" />
            <LogoStrip title="Ecosystems & institutions shaping digital currency:" logos={centralBankLogos} />
            <CommunityFeedBanner variant="community" />
            <CbdcsBoard
              initialCbdcs={cbdcs}
              statusOptions={statusOptions}
              typeOptions={typeOptions}
              techOptions={techOptions}
            />
          </PageShell>
        </main>
      </div>
    </>
  );
}
