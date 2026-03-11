
import { JobBoard } from '@/components/job-board';
import { Header } from '@/components/header';
import { getJobs } from '@/lib/jobs';
import { TrustedBy } from '@/components/trusted-by';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import { TransitioningHeadline } from '@/components/transitioning-headline';
import type { WebPage, JobPosting } from 'schema-dts';

export const revalidate = 0; // Revalidate on every request

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
    name: "Web3 Jobs | Hashtag Web3",
    isPartOf: {
      '@type': 'WebSite',
      url: siteUrl,
      name: 'Hashtag Web3'
    },
    description: "Find the best web3 jobs. The best place for top talent to discover exclusive opportunities at leading Web3 companies, DAOs, and crypto startups.",
  };

  const jobPostingsSchema: JobPosting[] = initialJobs.map(job => ({
    '@type': 'JobPosting',
    title: job.title,
    description: `A new job opportunity: ${job.title} at ${job.company}.`,
    datePosted: new Date(job.date).toISOString(),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
    },
    employmentType: 'FULL_TIME', // Assuming full time, can be adjusted if data is available
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Remote'
      }
    },
    url: job.link,
    validThrough: new Date(new Date(job.date).setDate(new Date(job.date).getDate() + 30)).toISOString(), // Expires in 30 days
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
                      <span>Join our hiring feed with <strong className="text-primary">60,000+</strong> subscribers.</span>
                      </Link>
                  </div>
                  <JobBoard initialJobs={initialJobs} captureEmail={true} />
                  <section className="mt-16 mb-8 max-w-3xl mx-auto text-sm text-muted-foreground leading-relaxed">
                    <h2 className="text-base font-semibold text-foreground mb-3">About Hashtag Web3</h2>
                    <p>
                      Hashtag Web3 is the leading Web3 job board and career resource platform, connecting professionals with opportunities at blockchain companies, DAOs, DeFi protocols, and crypto startups. The platform aggregates verified job listings from leading organizations including Uniswap Labs, Anchorage Digital, Coinbase, and Aave — updated daily across engineering, product, marketing, legal, and operations roles. Web3 salaries typically range from $80,000 to $250,000+, with Solidity engineers and smart contract auditors commanding 20–40% more than equivalent Web2 roles. Alongside the job board, Hashtag Web3 publishes over 500 career guides, maintains a glossary of 200+ blockchain terms with detailed definitions, and operates a real-time Telegram hiring channel with 60,000+ subscribers. Job seekers can also access a free salary calculator, resume builder, and an interview question bank covering Solidity, DeFi, product management, and more.
                    </p>
                  </section>
              </div>
          </div>
        </main>
      </div>
    </>
  );
}
