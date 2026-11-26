import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { FreeCryptoApisBoard } from '@/components/free-crypto-apis/free-crypto-apis-board';
import {
  FREE_CRYPTO_APIS_SOURCE,
  freeCryptoApiDetailUrl,
  freeCryptoApiPageDescription,
  getFreeCryptoApiCategories,
  getFreeCryptoApisSync,
  getFreeCryptoApisVerifiedOn,
} from '@/lib/free-crypto-apis';
import { seoSocialTitle, seoTitleSegment } from '@/lib/seo-title';

export const dynamic = 'force-static';
export const revalidate = 3600;

const titleSegment = 'Free Crypto APIs';
const socialTitle = seoSocialTitle(titleSegment);

export function generateMetadata(): Metadata {
  const listings = getFreeCryptoApisSync();
  const desc = freeCryptoApiPageDescription(listings.length);

  return {
    title: seoTitleSegment(titleSegment),
    description: desc,
    alternates: { canonical: 'https://hashtagweb3.com/freeapis' },
    openGraph: {
      type: 'website',
      title: socialTitle,
      description: desc,
      url: 'https://hashtagweb3.com/freeapis',
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
  const verifiedOn = getFreeCryptoApisVerifiedOn();
  const total = listings.length;
  const siteUrl = 'https://hashtagweb3.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/freeapis#page`,
        url: `${siteUrl}/freeapis`,
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
            <PageHeader
              title="Free Crypto APIs"
              description="Free tiers of crypto data, RPC, and execution APIs for builders. Limits sourced from freecryptoAPIs and verified against official docs."
            />
            <p className="-mt-2 mb-6 text-center text-sm text-muted-foreground">
              Directory data from{' '}
              <a
                href={`${FREE_CRYPTO_APIS_SOURCE}/directory`}
                className="underline underline-offset-2 hover:text-foreground"
                rel="noopener noreferrer"
                target="_blank"
              >
                freecryptoAPIs
              </a>
              {verifiedOn ? ` (catalog verified ${verifiedOn})` : null}. Cards open the full listing on freecryptoAPIs.
            </p>
            <FreeCryptoApisBoard initialListings={listings} categories={categories} />
          </PageShell>
        </main>
      </div>
    </>
  );
}