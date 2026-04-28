
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Web3 Hiring Report 2026 | Crypto Job Market Trends',
 description: 'Data-driven insights on Web3 hiring trends, in-demand roles, salary benchmarks, and remote work patterns across the blockchain industry.',
 alternates: {
  canonical: '/web3-hiring-report',
 },
 openGraph: {
  title: 'Web3 Hiring Report 2026 | Crypto Job Market Trends',
  description: 'Data-driven insights on Web3 hiring trends, in-demand roles, salary benchmarks, and remote work patterns across the blockchain industry.',
  url: 'https://hashtagweb3.com/web3-hiring-report',
  images: [
   {
    url: '/api/og?type=article&title=Web3%20Hiring%20Report%202026&category=Market%20Data',
    width: 1200,
    height: 630,
    alt: 'Web3 Hiring Report 2026 - Crypto job market trends and data',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 Hiring Report 2026 | Crypto Job Market Trends',
  description: 'Data-driven insights on Web3 hiring trends, in-demand roles, and salary benchmarks.',
  images: ['/api/og?type=article&title=Web3%20Hiring%20Report%202026&category=Market%20Data'],
 },
};

export default function HiringReportLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
