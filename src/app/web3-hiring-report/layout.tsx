
import type { Metadata } from 'next';
import { fmtInt, fmtUsdK, hiringReportStats as s } from '@/lib/hiring-report-stats';

export const dynamic = 'force-static';

export const metadata: Metadata = {
 title: 'Hiring Report 2026',
 description: `${s.snapshotLabel}: ${fmtInt(s.listings)} listings, full JD text parsed. Median pay ${fmtUsdK(s.salary.median)} where listed; ${Math.round(s.keywords.ai.pct)}% of postings mention AI; ${Math.round(s.jdRemote.pct)}% mention remote.`,
 alternates: {
  canonical: 'https://hashtagweb3.com/web3-hiring-report',
 },
 openGraph: {
  type: 'website',
  title: 'Hiring Report 2026',
  description: `${s.snapshotLabel}: ${fmtInt(s.listings)} listings, full JD text parsed. Median pay ${fmtUsdK(s.salary.median)} where listed; ${Math.round(s.keywords.ai.pct)}% of postings mention AI; ${Math.round(s.jdRemote.pct)}% mention remote.`,
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
  title: 'Hiring Report 2026',
  description: `${fmtInt(s.listings)} listings across ${s.companies} companies (${s.snapshotLabel}).`,
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
