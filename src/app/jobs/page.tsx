import { JobBoard } from '@/components/job-board';
import { getJobSlug } from '@/lib/job-slugs';
import type { Job } from '@/types';
import homepageJobs from '../../../content/homepage-jobs.json';
import { TrustedBy } from '@/components/trusted-by';
import type { Metadata } from 'next';
import { PageHeader } from "@/components/page-header";
import { PageShell } from '@/components/page-shell';
import type { CompanyLogoMap } from '@/lib/job-logo-map';
import { CommunityFeedBanner } from '@/components/community-feed-banner';

export const dynamic = 'force-static';

export const metadata: Metadata = {
 title: 'Web3 Jobs & Crypto Careers',
 description: 'Find the best remote Web3 jobs. Discover verified opportunities in Solidity, blockchain development, smart contracts, DeFi, DAOs, and crypto marketing at top Web3 startups.',
 alternates: {
  canonical: 'https://hashtagweb3.com/jobs',
 },
 openGraph: {
  type: 'website',
  title: 'Web3 Jobs & Crypto Careers',
  description: 'Find the best remote Web3 jobs. Discover verified opportunities in Solidity, blockchain development, DeFi, DAOs, and crypto marketing.',
  url: 'https://hashtagweb3.com/jobs',
  images: [{
   url: 'https://hashtagweb3.com/og-image-jobs.png',
   width: 1200,
   height: 630,
   alt: 'Hashtag Web3 Remote Jobs',
  }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 Jobs & Crypto Careers',
  description: 'Find the best remote Web3 jobs. Discover verified opportunities in Solidity, blockchain development, DeFi, DAOs, and crypto marketing.',
  images: ['https://hashtagweb3.com/og-image-jobs.png'],
 },
};

type HomepageJobsSnapshot = {
  total: number;
  initialJobs: Job[];
  companyLogos: CompanyLogoMap;
};

export default function JobsPage() {
 const { total: totalJobs, initialJobs, companyLogos } = homepageJobs as HomepageJobsSnapshot;
  
 const siteUrl = 'https://hashtagweb3.com';
 const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
   {
    '@type': 'WebPage',
    '@id': `${siteUrl}/jobs#page`,
    url: `${siteUrl}/jobs`,
    name: 'Web3 Jobs & Crypto Careers',
    description: `Browse ${totalJobs} current Web3 and crypto job openings.`,
    isPartOf: { '@type': 'WebSite', url: siteUrl, name: 'Hashtag Web3' },
   },
   {
    '@type': 'ItemList',
    name: 'Current Web3 job openings',
    numberOfItems: totalJobs,
    itemListElement: initialJobs.map((job, index) => ({
     '@type': 'ListItem',
     position: index + 1,
      url: `${siteUrl}/${getJobSlug(job)}`,
     name: `${job.title} at ${job.company}`,
    })),
   },
  ],
 };

 return (
  <>
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
   />
   <div className="flex flex-col min-h-screen">
         <main className="flex-1" data-job-page>
      <PageShell>
        <PageHeader title="Web3 Jobs" />
        <TrustedBy />
        <CommunityFeedBanner />
        <JobBoard initialJobs={initialJobs} initialTotal={totalJobs} companyLogos={companyLogos} showResultCount={false} />
      </PageShell>
    </main>
   </div>
  </>
 );
}
