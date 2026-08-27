import { JobBoard } from '@/components/job-board';
import { buildCompanyLogoMap } from '@/lib/job-listing';
import { getJobSlug } from '@/lib/job-slugs';
import { getJobs } from '@/lib/jobs';
import { TrustedBy } from '@/components/trusted-by';
import Link from 'next/link';
import { Rss } from 'lucide-react';

import { SITE_STATS } from '@/lib/constants';
import { PageHeader } from "@/components/page-header";
import { PageShell } from '@/components/page-shell';

const JOBS_PER_PAGE = 50;

export const revalidate = 300; // Revalidate every 5 minutes (ISR)

export default async function JobsPage() {
 const allJobs = await getJobs();
 const initialJobs = allJobs.slice(0, JOBS_PER_PAGE);
 const companyLogos = await buildCompanyLogoMap(initialJobs);

 
 const siteUrl = 'https://hashtagweb3.com';
 const pageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
   {
    '@type': 'WebPage',
    url: siteUrl,
    name: 'Web3 Jobs & Crypto Careers | Hashtag Web3',
    description: `Browse ${allJobs.length} current Web3 and crypto job openings.`,
   },
   {
    '@type': 'ItemList',
    numberOfItems: allJobs.length,
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
     dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
    />
    <div className="flex flex-col min-h-screen">
         <main className="flex-1">
       <PageShell>
         <section className="text-center mb-8">
           <div className="site-container">
             <PageHeader title="Find Your Next Web3 Job" />
           </div>
         </section>
         {/* SSR-only agentic content: invisible to sighted users, visible to crawlers without JS */}
         <section className="sr-only" aria-hidden="false">
           <h2>Explore Verified Web3 Jobs by Role and Technology</h2>
           <p>
             Hashtag Web3 indexes thousands of verified Web3 jobs across Solidity, Rust, smart contracts, zero-knowledge proofs, DeFi, DAOs, and crypto marketing. Every listing is verified against the original employer posting and refreshed every five minutes via our public REST API at https://hashtagweb3.com/api/v1/jobs. Search by keyword, technology tag, company, or location, and paginate with limit and offset. Our job board serves engineers, auditors, product managers, designers, and community builders seeking remote and on-site roles at leading Web3 startups, L2 teams, and DAOs. Trusted by 60,000+ professionals, the platform surfaces salary benchmarks, hiring trends, and company directories without requiring authentication for read access.
           </p>
           <h2>Top Web3 Companies Hiring Now</h2>
           <p>
             Discover employers actively hiring in Web3, from L1 foundations and DeFi protocols to custody, analytics, and infrastructure providers. Browse 200+ companies with open position counts, locations, and direct application links. Each company page aggregates live openings, verification dates, and structured JobPosting data for AI agents.
           </p>
           <h3>How Hashtag Web3 Verifies Every Listing</h3>
           <p>
             Listings are sourced from Greenhouse, Lever, Ashby, and first-party career pages, deduplicated by canonical link, and checked for substance before indexing. Substantial postings retain full verified descriptions; thin postings are marked noindex. All data is available as JSON-LD, RSS, and via the Agent Skill at https://hashtagweb3.com/.well-known/agent-skills/index.json.
           </p>
         </section>
        <article className="site-container">
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
          <JobBoard
           initialJobs={initialJobs}
           initialTotal={allJobs.length}
           companyLogos={companyLogos}
          />
        </article>
      </PageShell>
     </main>
    </div>

   </>
  );
}
