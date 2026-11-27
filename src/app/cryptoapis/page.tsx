import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { CommunityFeedBanner } from '@/components/community-feed-banner';
import { LogoStrip } from '@/components/logo-strip';
import { FreeCryptoApisBoard } from '@/components/free-crypto-apis/free-crypto-apis-board';
import {
  freeCryptoApiDetailUrl,
  freeCryptoApiPageDescription,
  getFreeCryptoApiCategories,
  getFreeCryptoApisSync,
} from '@/lib/free-crypto-apis';
import { seoSocialTitle, seoTitleSegment } from '@/lib/seo-title';

export const dynamic = 'force-static';
export const revalidate = 3600;

const titleSegment = 'Crypto APIs';
const socialTitle = seoSocialTitle(titleSegment);

const apiLogos = [
  { name: 'Alchemy', src: '/logo/companies/alchemy.png', maxHeight: 22 },
  { name: 'QuickNode', src: '/logo/companies/quicknode.webp', maxHeight: 22 },
  { name: 'CoinGecko', src: '/logo/companies/coingecko.webp', maxHeight: 22 },
  { name: 'CoinMarketCap', src: '/logo/companies/coinmarketcap.webp', maxHeight: 20 },
  { name: 'Etherscan', src: '/logo/companies/etherscan.webp', maxHeight: 22 },
  { name: 'Circle', src: '/logo/companies/circle.webp', maxHeight: 21 },
];

export function generateMetadata(): Metadata {
  const listings = getFreeCryptoApisSync();
  const desc = freeCryptoApiPageDescription(listings.length);

  return {
    title: seoTitleSegment(titleSegment),
    description: desc,
    alternates: { canonical: 'https://hashtagweb3.com/cryptoapis' },
    openGraph: {
      type: 'website',
      title: socialTitle,
      description: desc,
      url: 'https://hashtagweb3.com/cryptoapis',
      images: [
        {
          url: 'https://hashtagweb3.com/og-image-tools.png',
          width: 647,
          height: 296,
          alt: 'Hashtag Web3 Free Crypto APIs',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: desc,
      images: ['https://hashtagweb3.com/og-image-tools.png'],
    },
  };
}

export default function FreeCryptoApisPage() {
  const listings = getFreeCryptoApisSync();
  const categories = getFreeCryptoApiCategories();
  const total = listings.length;
  const siteUrl = 'https://hashtagweb3.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/cryptoapis#page`,
        url: `${siteUrl}/cryptoapis`,
        name: 'Free Crypto APIs Directory',
        description: freeCryptoApiPageDescription(total),
        isPartOf: { '@type': 'WebSite', url: siteUrl, name: 'Hashtag Web3' },
      },
      {
        '@type': 'ItemList',
        name: 'Free crypto API listings',
        numberOfItems: total,
        itemListElement: listings.slice(0, 50).map((listing, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: freeCryptoApiDetailUrl(listing),
          name: listing.name,
          description: listing.freeTier,
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
      <div className="flex min-h-screen flex-col">
        <main className="flex-1" data-free-apis-page>
          <PageShell>
            <PageHeader title="Crypto APIs" />
            <LogoStrip title="APIs and infrastructure from providers like:" logos={apiLogos} />
            <CommunityFeedBanner variant="community" />
            <FreeCryptoApisBoard initialListings={listings} categories={categories} />
          </PageShell>
        </main>
      </div>
    </>
  );
}
