import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Freelance Rates by Industry (2026) | Hourly & Project Benchmarks',
  description:
    'Freelance rates by industry for 2026. Compare hourly and project pricing benchmarks for software, design, marketing, content, and operations roles.',
  alternates: {
    canonical: '/freelance-rates-by-industry',
  },
  openGraph: {
    title: 'Freelance Rates by Industry (2026) | Hourly & Project Benchmarks',
    description:
      'Explore freelance pricing benchmarks by industry with practical hourly and project-rate ranges.',
    url: 'https://hashtagweb3.com/freelance-rates-by-industry',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-tools.png',
        width: 1200,
        height: 630,
        alt: 'Freelance Rates by Industry',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freelance Rates by Industry (2026) | Hourly & Project Benchmarks',
    description:
      'Benchmark freelance hourly and project rates across major industries and roles.',
    images: ['https://hashtagweb3.com/og-image-tools.png'],
  },
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Freelance Rates by Industry (2026)',
  description:
    'Freelance rate benchmarks by industry with hourly and project pricing ranges.',
  url: 'https://hashtagweb3.com/freelance-rates-by-industry',
};

export default function FreelanceRatesByIndustryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      {children}
    </>
  );
}
