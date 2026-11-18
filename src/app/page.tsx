import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getFreshJobCountLabel } from '@/lib/seo-freshness';

export const dynamic = 'force-static';
export const revalidate = 3600;

const jobsUrl = 'https://hashtagweb3.com/jobs';
const pageTitle = `Remote Web3 Jobs (${getFreshJobCountLabel()})`;

export const metadata: Metadata = {
  title: pageTitle,
  alternates: { canonical: jobsUrl },
  robots: { follow: true, index: true },
};

export default function HomePage() {
  redirect('/jobs');
}