import type { Metadata } from 'next';
import { getDashboardMetricsSync } from '@/lib/dashboard';
import { seoSocialTitle, seoTitleSegment } from '@/lib/seo-title';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export const dynamic = 'force-static';
export const revalidate = 3600;

const titleSegment = 'Web3 Intelligence & On-Chain Visual Dashboard';
const socialTitle = seoSocialTitle(titleSegment);
const desc =
  'The single source of knowledge for Web3 data visualisations: live stablecoin velocity, Visa Agentic Payments, Lending, Signal vs Noise, RWA tokenized Treasuries, DEX trading volumes, and protocol fees.';

export const metadata: Metadata = {
  title: seoTitleSegment(titleSegment),
  description: desc,
  alternates: {
    canonical: 'https://hashtagweb3.com/dashboard',
  },
  openGraph: {
    type: 'website',
    title: socialTitle,
    description: desc,
    url: 'https://hashtagweb3.com/dashboard',
    images: [
      {
        url: 'https://hashtagweb3.com/og/pages/grants.png',
        width: 1200,
        height: 630,
        alt: 'Hashtag Web3 Multi-Source On-Chain Analytics Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: socialTitle,
    description: desc,
    images: ['https://hashtagweb3.com/og/pages/grants.png'],
  },
};

export default function DashboardPage() {
  const data = getDashboardMetricsSync();
  const siteUrl = 'https://hashtagweb3.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}/dashboard#page`,
    url: `${siteUrl}/dashboard`,
    name: 'Web3 Intelligence & On-Chain Visual Dashboard',
    description: desc,
    isPartOf: { '@type': 'WebSite', url: siteUrl, name: 'Hashtag Web3' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <DashboardClient data={data} />
    </>
  );
}
