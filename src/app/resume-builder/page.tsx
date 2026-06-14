import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Web3 Resume Builder | Create ATS-Optimized Crypto Resumes',
 description: 'Free AI-powered resume builder for blockchain and Web3 professionals. Build an ATS-optimized resume tailored for DeFi, Solidity, Smart Contract, and DAO roles.',
 alternates: {
  canonical: 'https://hashtagweb3.com/resume-builder',
 },
 openGraph: {
  type: 'website',
  title: 'Web3 Resume Builder | Create ATS-Optimized Crypto Resumes',
  description: 'Free AI-powered resume builder for blockchain and Web3 professionals. Build an ATS-optimized resume tailored for DeFi, Solidity, Smart Contract, and DAO roles.',
  url: 'https://hashtagweb3.com/resume-builder',
  images: [{
   url: '/api/og?type=default&title=Web3%20Resume%20Builder',
   width: 1200,
   height: 630,
   alt: 'Web3 Resume Builder Tool',
  }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 Resume Builder | Create ATS-Optimized Crypto Resumes',
  description: 'Free AI-powered resume builder for blockchain and Web3 professionals. Build an ATS-optimized resume tailored for DeFi, Solidity, Smart Contract, and DAO roles.',
  images: ['/api/og?type=default&title=Web3%20Resume%20Builder'],
 },
};

const ResumeForm = dynamic(
 () => import('@/components/resume-form').then(m => ({ default: m.ResumeForm })),
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
 name: 'Web3 Resume Builder',
 url: 'https://hashtagweb3.com/resume-builder',
 description: 'Free AI-powered resume builder for Web3 and blockchain professionals. Create ATS-optimized resumes for DeFi, Solidity, crypto, and DAO roles.',
 applicationCategory: 'BusinessApplication',
 operatingSystem: 'Web',
 offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
 publisher: { '@type': 'Organization', name: 'Hashtag Web3', url: 'https://hashtagweb3.com' },
});

export default function ResumeBuilderPage() {
 return (
  <div className="flex flex-col min-h-screen bg-background">
   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
      <main className="flex-1">
    <ToolUsageTracker toolName="Resume Builder" />
    <ResumeForm />
   </main>
  </div>
 );
}
