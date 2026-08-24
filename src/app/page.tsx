import { JobBoard } from '@/components/job-board';
import { getJobs } from '@/lib/jobs';
import { TrustedBy } from '@/components/trusted-by';
import Link from 'next/link';
import { Rss } from 'lucide-react';

import { FirebaseClientProvider } from '@/firebase/client-provider';
import { SITE_STATS } from '@/lib/constants';
import type { WebPage, JobPosting } from 'schema-dts';
import { PageHeader } from "@/components/page-header";

export const revalidate = 300; // Revalidate every 5 minutes (ISR)

export default async function JobsPage() {
 const allJobs = await getJobs();
 const initialJobs = allJobs; // Pass all jobs; JobBoard handles pagination client-side

 
 const siteUrl = 'https://hashtagweb3.com';
 const pageSchema: WebPage = {
  '@type': 'WebPage',
  url: `${siteUrl}/jobs`,
  name:"Web3 Jobs & Crypto Careers | Hashtag Web3",
  isPartOf: {
   '@type': 'WebSite',
   url: siteUrl,
   name: 'Hashtag Web3'
  },
  description:"Find the best web3 jobs. The best place for top talent to discover exclusive opportunities at leading Web3 companies, DAOs, and crypto startups.",
 };

 const jobPostingsSchema: JobPosting[] = initialJobs.slice(0, 10).map(job => ({
  '@type': 'JobPosting',
  title: job.title,
  description: `${job.title} at ${job.company}.`,
  datePosted: new Date(job.date).toISOString(),
  hiringOrganization: {
   '@type': 'Organization',
   name: job.company,
  },
  jobLocation: {
   '@type': 'Place',
   address: {
    '@type': 'PostalAddress',
    addressLocality: 'Remote'
   }
  },
  url: job.link,
  validThrough: new Date(new Date(job.date).setDate(new Date(job.date).getDate() + 30)).toISOString(),
 }));

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
   <div className="flex flex-col min-h-screen">
        <main className="flex-1">
     <div className="container mx-auto page-section px-4">
       <section className="text-center mb-8">
         <div className="site-container">
           <PageHeader title="Find Your Next Web3 Job" />
         </div>
       </section>
       <article className="site-container">
         <TrustedBy />
         <div className="text-center my-4 space-y-2">
           <Link
           href="https://t.me/web3hiring"
           target="_blank"
           rel="noopener noreferrer"
           className="text-sm text-muted-foreground hover:text-primary transition-colors group inline-flex items-center gap-2"
           >
           <Rss className="h-4 w-4 transition-transform group-hover:scale-110" />
           <span>Join our hiring feed with <strong className="text-foreground">{SITE_STATS.telegramSubscribersFormatted}</strong> subscribers.</span>
           </Link>
         </div>
         <FirebaseClientProvider>
          <JobBoard initialJobs={initialJobs} />
         </FirebaseClientProvider>
       </article>
     </div>
    </main>
   </div>

   {/*
     Invisible SSR content for web crawlers and AI agents.
     sr-only = visually hidden but fully present in the HTML payload.
     No UI impact whatsoever.
   */}
   <div className="sr-only" aria-hidden="true">
     <h2>About Hashtag Web3</h2>
     <p>
       Hashtag Web3 is the leading global Web3 job board and career intelligence platform,
       connecting over 60,000 crypto-native builders with leading protocols and startups
       including Uniswap Labs, Coinbase, Aave, Chainlink, and Circle. Founded in 2022,
       we aggregate and verify thousands of live blockchain opportunities across Ethereum,
       Solana, Bitcoin L2s, Cosmos, NEAR, and emerging rollups.
     </p>
     <h2>High-Demand Web3 Job Categories</h2>
     <ul>
       <li>Solidity &amp; Smart Contracts — Build decentralized applications on Ethereum, EVM L2s, and Arbitrum.</li>
       <li>Security &amp; Auditing — Find protocol vulnerabilities, perform formal verification, and secure DeFi protocols.</li>
       <li>Rust &amp; Solana Engineering — High-performance smart contract development with Rust and Anchor framework.</li>
       <li>DeFi &amp; Tokenomics — Design liquidity models, automated market makers, yield systems, and crypto tokenomics.</li>
       <li>ZK &amp; Cryptography — Zero-knowledge proofs, Circom, Noir, privacy systems, and zk-rollups architecture.</li>
       <li>Web3 Product &amp; Marketing — Lead decentralized protocol launches, community growth, and DAO governance.</li>
     </ul>
     <h2>Free Career Tools &amp; Developer Resources</h2>
     <ul>
       <li><a href="/salary-calculator">Web3 Salary Calculator</a>: Benchmark compensation across roles, seniority levels, and regions.</li>
       <li><a href="/resume-builder">Crypto Resume Builder</a>: Create a Web3-tailored resume highlighting on-chain projects and audits.</li>
       <li><a href="/developers">Developer Portal &amp; API</a>: Explore REST endpoints, OpenAPI 3.1 schema, and machine-readable data feeds.</li>
       <li><a href="/learn">200+ Term Web3 Glossary</a>: Master blockchain fundamentals, DeFi mechanisms, and cryptography.</li>
     </ul>
     <h2>Platform Facts</h2>
     <ul>
       <li>60,000+ community subscribers across Telegram, Discord, and LinkedIn</li>
       <li>10,000+ verified Web3 job listings updated daily</li>
       <li>500+ career guides and educational resources</li>
       <li>Public REST API: /api/jobs, /api/news, /api/events, /api/glossary</li>
       <li>OpenAPI 3.1.0 spec: https://hashtagweb3.com/openapi.json</li>
       <li>LLMs navigation index: https://hashtagweb3.com/llms.txt</li>
     </ul>
   </div>
  </>
 );
}
