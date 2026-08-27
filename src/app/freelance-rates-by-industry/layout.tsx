import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Freelance Rates 2026',
 description:
  'Freelance rates by industry for 2026. Compare hourly and project pricing benchmarks for software, design, marketing, content, and operations roles.',
 keywords: [
  'freelance rates by industry',
  'freelance hourly rates',
  'freelance project rates',
  'freelancer pricing calculator',
  'freelance benchmark rates',
  'web3 freelance rates',
  'software freelance rates',
  'design freelance rates',
  'marketing freelance rates',
 ],
 robots: {
  index: true,
  follow: true,
  googleBot: {
   index: true,
   follow: true,
   'max-snippet': -1,
   'max-image-preview': 'large',
   'max-video-preview': -1,
  },
 },
 alternates: {
  canonical: 'https://hashtagweb3.com/freelance-rates-by-industry',
 },
 openGraph: {
  type: 'website',
  title: 'Freelance Rates 2026 | Hashtag Web3',
  description:
   'Explore freelance pricing benchmarks by industry with practical hourly and project-rate ranges.',
  url: 'https://hashtagweb3.com/freelance-rates-by-industry',
  images: [
   {
    url: 'https://hashtagweb3.com/api/og?type=default&title=Freelance%20Rates%20by%20Industry',
    width: 1200,
    height: 630,
    alt: 'Freelance Rates by Industry',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Freelance Rates 2026 | Hashtag Web3',
  description:
   'Benchmark freelance hourly and project rates across major industries and roles.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Freelance%20Rates%20by%20Industry'],
 },
};

export default function FreelanceRatesByIndustryLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
