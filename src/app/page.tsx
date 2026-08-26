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
     url: `${siteUrl}/jobs/${getJobSlug(job)}`,
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
