
import { JobBoard } from '@/components/job-board';
import { Header } from '@/components/header';
import { getJobs } from '@/lib/jobs';
import { TrustedBy } from '@/components/trusted-by';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import { TransitioningHeadline } from '@/components/transitioning-headline';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { SITE_STATS } from '@/lib/constants';
import type { WebPage, JobPosting } from 'schema-dts';

export const revalidate = 300; // Revalidate every 5 minutes (ISR)

export default async function JobsPage() {
  const allJobs = await getJobs();
  const initialJobs = allJobs.slice(0, 150);
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
    name: "Web3 Jobs | Hashtag Web3",
    isPartOf: {
      '@type': 'WebSite',
      url: siteUrl,
      name: 'Hashtag Web3'
    },
    description: "Find the best web3 jobs. The best place for top talent to discover exclusive opportunities at leading Web3 companies, DAOs, and crypto startups.",
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
        <Header />
        <main className="flex-1">
          <div className="container mx-auto py-8 px-4">
              <section className="text-center mb-8">
                  <div className="max-w-6xl mx-auto">
                      <h1 className="sr-only">Web3 Jobs - Find Your Next Crypto Career</h1>
                      <TransitioningHeadline phrases={headlines} />
                  </div>
              </section>
              <article className="max-w-6xl mx-auto">
                  <TrustedBy />
                  <div className="text-center my-4 space-y-2">
                      <Link
                      href="https://t.me/web3hiring"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors group inline-flex items-center gap-2"
                      >
                      <Rss className="h-4 w-4 transition-transform group-hover:scale-110" />
                      <span>Join our hiring feed with <strong className="text-primary">{SITE_STATS.telegramSubscribersFormatted}</strong> subscribers.</span>
                      </Link>
                  </div>
                  <FirebaseClientProvider>
                    <JobBoard initialJobs={initialJobs} />
                  </FirebaseClientProvider>
              </article>
          </div>
        </main>
      </div>
    </>
  );
}
