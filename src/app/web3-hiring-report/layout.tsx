
import type { Metadata } from 'next';
import { fmtInt, hiringReportStats as s } from '@/lib/hiring-report-stats';
import { STATIC_OG } from '@/lib/job-og';

export const dynamic = 'force-static';

export const metadata: Metadata = {
 title: `Hiring Report ${s.year}`,
 description: `${s.snapshotLabel}: an analysis of ${fmtInt(s.listings)} job listings from ${s.companies} employers, with job functions, description keywords, remote wording, and a documented salary sample.`,
 alternates: {
  canonical: 'https://hashtagweb3.com/web3-hiring-report',
 },
 openGraph: {
  type: 'website',
   title: `Hiring Report ${s.year}`,
   description: `${fmtInt(s.listings)} listings from ${s.companies} employers. Job functions, description keywords, salary ranges, and remote-work wording as of ${s.snapshotLabel}.`,
  url: 'https://hashtagweb3.com/web3-hiring-report',
  images: [
   {
     url: STATIC_OG.report,
    width: 1200,
    height: 630,
     alt: `Web3 Hiring Report ${s.year}`,
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
   title: `Hiring Report ${s.year}`,
  description: `${fmtInt(s.listings)} listings across ${s.companies} companies (${s.snapshotLabel}).`,
   images: [STATIC_OG.report],
 },
};

export default function HiringReportLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
