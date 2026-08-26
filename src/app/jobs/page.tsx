import { JobBoard } from '@/components/job-board';
import { buildCompanyLogoMap } from '@/lib/job-listing';
import { getJobSlug } from '@/lib/job-slugs';
import { getJobs } from '@/lib/jobs';
import { TrustedBy } from '@/components/trusted-by';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import type { Metadata } from 'next';
import { PageHeader } from "@/components/page-header";

import { SITE_STATS } from '@/lib/constants';
import { PageShell } from '@/components/page-shell';

const JOBS_PER_PAGE = 50;

export const revalidate = 300; // Revalidate every 5 minutes (ISR)

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
   url: 'https://hashtagweb3.com/api/og?type=default&title=Remote%20Web3%20Jobs',
   width: 1200,
   height: 630,
   alt: 'Hashtag Web3 Remote Jobs',
  }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 Jobs & Crypto Careers',
  description: 'Find the best remote Web3 jobs. Discover verified opportunities in Solidity, blockchain development, DeFi, DAOs, and crypto marketing.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Remote%20Web3%20Jobs'],
 },
};

export default async function JobsPage() {
 const allJobs = await getJobs();
 const initialJobs = allJobs.slice(0, JOBS_PER_PAGE);
 const companyLogos = await buildCompanyLogoMap(initialJobs);
 const totalJobs = allJobs.length;
  
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
        <main className="flex-1">
     <PageShell>
       <section className="text-center mb-8">
         <div className="site-container">
           <PageHeader title="Find Your Next Web3 Job" />
         </div>
       </section>
       <div className="site-container">
         <TrustedBy />
         <div className="text-center my-4 space-y-2">
           <Link
           href={SITE_STATS.telegramUrl}
           target="_blank"
           rel="noopener noreferrer"
           className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
           >
           <Rss className="h-4 w-4" />
           <span>Join our hiring feed with <strong className="text-foreground">{SITE_STATS.telegramSubscribersFormatted}</strong> subscribers.</span>
           </Link>
         </div>
         <JobBoard initialJobs={initialJobs} initialTotal={totalJobs} companyLogos={companyLogos} />
       </div>
     </PageShell>
    </main>
   </div>
  </>
 );
}
