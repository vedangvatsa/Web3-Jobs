import { JobBoard } from '@/components/job-board';
import { Header } from '@/components/header';
import { getJobs } from '@/lib/jobs';
import { TrustedBy } from '@/components/trusted-by';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import type { Metadata } from 'next';
import type { WebPage, JobPosting } from 'schema-dts';

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
   url: '/api/og?type=default&title=Remote%20Web3%20Jobs',
   width: 1200,
   height: 630,
   alt: 'Hashtag Web3 Remote Jobs',
  }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 Jobs & Crypto Careers',
  description: 'Find the best remote Web3 jobs. Discover verified opportunities in Solidity, blockchain development, DeFi, DAOs, and crypto marketing.',
  images: ['/api/og?type=default&title=Remote%20Web3%20Jobs'],
 },
};

export default async function JobsPage() {
 const initialJobs = await getJobs();
 const headlines = [
   "Find Your Next Web3 Job",
   "Discover Top Crypto Roles",
   "Work in Blockchain",
   "Explore DeFi Careers",
   "Join a DAO Today"
 ];
  
 const siteUrl = 'https://hashtagweb3.com';
 const pageSchema: WebPage = {
  '@type': 'WebPage',
  url: `${siteUrl}/jobs`,
  name: `${initialJobs.length}+ Live Web3 Jobs in 2026 | Remote Crypto Careers`,
  isPartOf: {
   '@type': 'WebSite',
   url: siteUrl,
   name: 'Hashtag Web3'
  },
  description: `Browse ${initialJobs.length}+ verified Web3 jobs updated daily. Find remote blockchain developer, DeFi, DAO, and crypto roles at top companies. Apply today!`,
 };

 const jobPostingsSchema: JobPosting[] = initialJobs.slice(0, 50).map(job => ({
  '@type': 'JobPosting',
  title: job.title,
  description: `A new job opportunity: ${job.title} at ${job.company}.`,
  datePosted: new Date(job.date).toISOString(),
  hiringOrganization: {
   '@type': 'Organization',
   name: job.company,
  },
  employmentType: 'FULL_TIME',
  jobLocation: {
   '@type': 'Place',
   address: {
    '@type': 'PostalAddress',
    addressLocality: 'Remote'
   }
  },
  url: job.link,
  validThrough: new Date(new Date(job.date).setDate(new Date(job.date).getDate() + 30)).toISOString(),
  skills: ((job as any).tags || []).join(', ') || 'Web3, Blockchain, Cryptocurrency',
 }));

 const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `Web3 Jobs | ${initialJobs.length}+ Open Positions`,
  description: `Curated list of ${initialJobs.length}+ Web3, blockchain, and crypto job openings updated daily.`,
  url: `${siteUrl}/jobs`,
  numberOfItems: initialJobs.length,
  itemListElement: initialJobs.slice(0, 50).map((job, idx) => ({
   '@type': 'ListItem',
   position: idx + 1,
   url: job.link,
   name: `${job.title} at ${job.company}`,
  })),
 };

 return (
  <>
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
   />
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingsSchema) }}
   />
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
   />
   <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1">
     <div className="container mx-auto py-8 px-4">
       <section className="text-center mb-8">
         <div className="max-w-6xl mx-auto">
           <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{headlines[0]}</h1>
         </div>
       </section>
       <div className="max-w-6xl mx-auto">
         <TrustedBy />
         <div className="text-center my-4 space-y-2">
           <Link
           href="https://t.me/web3hiring"
           target="_blank"
           rel="noopener noreferrer"
           className="text-sm text-muted-foreground hover:text-primary transition-colors group inline-flex items-center gap-2"
           >
           <Rss className="h-4 w-4 transition-transform group-hover:scale-110" />
           <span>Join our hiring feed with <strong className="text-foreground">60,000+</strong> subscribers.</span>
           </Link>
         </div>
         <JobBoard initialJobs={initialJobs} />
       </div>
     </div>
    </main>
   </div>
  </>
 );
}
