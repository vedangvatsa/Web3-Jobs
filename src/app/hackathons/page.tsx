import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { CommunityFeedBanner } from '@/components/community-feed-banner';
import { HackathonsBoard } from '@/components/hackathons/hackathons-board';
import { LogoStrip } from '@/components/logo-strip';
import { getHackathonEcosystems, getHackathonFormats, getHackathonsSync } from '@/lib/hackathons';
import { seoSocialTitle, seoTitleSegment } from '@/lib/seo-title';

export const dynamic = 'force-static';
export const revalidate = 3600;

const hackathonsTitleSegment = 'Web3 Hackathons & Competitions 2026';
const hackathonsSocialTitle = seoSocialTitle(hackathonsTitleSegment);
const hackathonsDesc =
  'Discover top Web3, blockchain, and crypto hackathons. Compete for over $2,000,000+ in global prize pools, developer grants, and VC accelerator pathways.';

export const metadata: Metadata = {
  title: seoTitleSegment(hackathonsTitleSegment),
  description: hackathonsDesc,
  alternates: {
    canonical: 'https://hashtagweb3.com/hackathons',
  },
  openGraph: {
    type: 'website',
    title: hackathonsSocialTitle,
    description: hackathonsDesc,
    url: 'https://hashtagweb3.com/hackathons',
    images: [
      {
        url: 'https://hashtagweb3.com/og/pages/grants.png',
        width: 1200,
        height: 630,
        alt: 'Hashtag Web3 Hackathons & Competitions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: hackathonsSocialTitle,
    description: hackathonsDesc,
    images: ['https://hashtagweb3.com/og/pages/grants.png'],
  },
};

const hackathonLogos = [
  { name: 'Solana', src: '/logo/companies/solana-real.svg', maxHeight: 18 },
  { name: 'Consensys', src: '/logo/companies/consensys.webp', maxHeight: 20 },
  { name: 'Polygon', src: '/logo/companies/polygon.webp', maxHeight: 20 },
  { name: 'Alchemy', src: '/logo/companies/alchemy.png', maxHeight: 20 },
  { name: 'Google Cloud', src: '/logo/companies/google.webp', maxHeight: 20 },
  { name: 'AWS', src: '/logo/companies/aws.webp', maxHeight: 22 },
];

export default function HackathonsPage() {
  const hackathons = getHackathonsSync();
  const ecosystemOptions = getHackathonEcosystems();
  const formatOptions = getHackathonFormats();
  const total = hackathons.length;
  const siteUrl = 'https://hashtagweb3.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/hackathons#page`,
        url: `${siteUrl}/hackathons`,
        name: 'Web3 Hackathons & Competitions 2026',
        description: hackathonsDesc,
        isPartOf: { '@type': 'WebSite', url: siteUrl, name: 'Hashtag Web3' },
      },
      {
        '@type': 'ItemList',
        name: 'Web3 Hackathons',
        numberOfItems: total,
        itemListElement: hackathons.slice(0, 20).map((h, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: h.title,
          url: h.url,
          description: h.description,
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
        <main className="flex-1" data-hackathons-page>
          <PageShell>
            <PageHeader title="Web3 Hackathons & Competitions" />
            <LogoStrip title="Hackathons & tracks backed by leading ecosystems:" logos={hackathonLogos} />
            <CommunityFeedBanner variant="community" />
            <HackathonsBoard
              initialHackathons={hackathons}
              ecosystemOptions={ecosystemOptions}
              formatOptions={formatOptions}
            />
          </PageShell>
        </main>
      </div>
    </>
  );
}
