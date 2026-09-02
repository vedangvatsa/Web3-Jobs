
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Hiring Report 2026',
 description: 'Data-driven insights based on 3,400+ active Web3 job listings. Explore hiring velocity, in-demand roles, salary benchmarks, and remote work patterns.',
 alternates: {
  canonical: 'https://hashtagweb3.com/web3-hiring-report',
 },
 openGraph: {
  type: 'website',
  title: 'Hiring Report 2026 | Hashtag Web3',
  description: 'Data-driven insights based on 3,400+ active Web3 job listings. Explore hiring velocity, in-demand roles, salary benchmarks, and remote work patterns.',
  url: 'https://hashtagweb3.com/web3-hiring-report',
  images: [
   {
    url: 'https://hashtagweb3.com/og-image-report.png',
    width: 1200,
    height: 630,
    alt: 'Web3 Hiring Report 2026 - Crypto job market trends and data',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Hiring Report 2026 | Hashtag Web3',
  description: 'Data-driven insights based on 3,400+ active Web3 job listings. Explore hiring velocity, in-demand roles, and salary benchmarks.',
  images: ['https://hashtagweb3.com/og-image-report.png'],
 },
};

export default function HiringReportLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
