import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFreeCryptoApiBySlug, getFreeCryptoApisSync } from '@/lib/free-crypto-apis';
import { FreeCryptoApiDetailView } from '@/components/free-crypto-apis/free-crypto-api-detail-view';
import { seoSocialTitle, seoTitleSegment } from '@/lib/seo-title';

interface FreeCryptoApiPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const apis = getFreeCryptoApisSync();
  return apis.map((api) => ({ slug: api.slug }));
}

export async function generateMetadata({ params }: FreeCryptoApiPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = getFreeCryptoApiBySlug(slug);
  if (!listing) return {};

  const siteUrl = 'https://hashtagweb3.com';
  const canonicalUrl = `${siteUrl}/freeapis/${listing.slug}`;
  const titleSegment = `${listing.name} Free API Tier & Limits`;
  const socialTitle = seoSocialTitle(titleSegment);
  const description = `${listing.name} free crypto API tier: ${listing.freeTier}. Check supported chains, rate limits, keyless access, and developer documentation.`;

  return {
    title: seoTitleSegment(titleSegment),
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title: socialTitle,
      description,
      url: canonicalUrl,
      images: [
        {
          url: 'https://hashtagweb3.com/og-image-tools.png',
          width: 647,
          height: 296,
          alt: `${listing.name} Free API`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: ['https://hashtagweb3.com/og-image-tools.png'],
    },
  };
}

export default async function FreeCryptoApiPage({ params }: FreeCryptoApiPageProps) {
  const { slug } = await params;
  const listing = getFreeCryptoApiBySlug(slug);
  if (!listing) notFound();

  return <FreeCryptoApiDetailView listing={listing} />;
}
