import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Web3 Job Description Builder | AI JD Generator',
 description: 'Free AI-powered job description builder for Web3 and crypto companies. Generate optimized JDs for Solidity, DeFi, smart contracts, Rust, and crypto roles.',
 alternates: {
  canonical: 'https://hashtagweb3.com/jd-builder',
 },
 openGraph: {
  type: 'website',
  title: 'Web3 Job Description Builder | AI JD Generator',
  description: 'Free AI-powered job description builder for Web3 and crypto companies. Generate optimized JDs for Solidity, DeFi, smart contracts, Rust, and crypto roles.',
  url: 'https://hashtagweb3.com/jd-builder',
  images: [{
   url: '/api/og?type=default&title=Web3%20JD%20Builder',
   width: 1200,
   height: 630,
   alt: 'Web3 Job Description Builder Tool',
  }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 Job Description Builder | AI JD Generator',
  description: 'Free AI-powered job description builder for Web3 and crypto companies. Generate optimized JDs for Solidity, DeFi, smart contracts, Rust, and crypto roles.',
  images: ['/api/og?type=default&title=Web3%20JD%20Builder'],
 },
};

const JDBuilderForm = dynamic(
 () => import('@/components/jd-builder-form').then(m => ({ default: m.JDBuilderForm })),
 {
  loading: () => (
   <div className="site-container p-8 space-y-4">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-10 w-full" />
   </div>
  ),
 }
);

const schemaJson = JSON.stringify({
 '@context': 'https://schema.org',
 '@type': 'SoftwareApplication',
 name: 'Web3 Job Description Builder',
 url: 'https://hashtagweb3.com/jd-builder',
 description: 'Free AI-powered job description builder for Web3 companies. Generate structured, inclusive job descriptions for blockchain, DeFi, DAO, and crypto roles.',
 applicationCategory: 'BusinessApplication',
 operatingSystem: 'Web',
 offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
 publisher: { '@type': 'Organization', name: 'Hashtag Web3', url: 'https://hashtagweb3.com' },
});

export default function JobDescriptionBuilderPage() {
 return (
  <div className="flex flex-col min-h-screen bg-background">
   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
      <main className="flex-1">
    <ToolUsageTracker toolName="Job Description Builder" />
    <JDBuilderForm />
   </main>
  </div>
 );
}
