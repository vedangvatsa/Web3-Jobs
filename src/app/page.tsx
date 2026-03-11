
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
                    <h2 className="text-lg font-semibold text-foreground mb-4">About Hashtag Web3</h2>
                    
                    <p className="text-base text-foreground font-medium mb-4">
                      The Leading Web3 Job Board & Career Resource
                    </p>
                    
                    <p className="mb-6">
                      Hashtag Web3 connects professionals with opportunities at blockchain companies, DAOs, DeFi protocols, and crypto startups. We aggregate verified job listings from leading organizations including{' '}
                      <Link href="https://uniswap.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Uniswap Labs</Link>
                      {', '}
                      <Link href="https://anchorage.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Anchorage Digital</Link>
                      {', '}
                      <Link href="https://coinbase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Coinbase</Link>
                      {', and '}
                      <Link href="https://aave.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Aave</Link>
                      {' — updated daily.'}
                    </p>
                    
                    <div className="mb-6">
                      <h3 className="font-semibold text-foreground mb-3">Why Hashtag Web3?</h3>
                      <ul className="space-y-2 ml-4 list-disc text-muted-foreground">
                        <li>
                          <Link href="/guides" className="text-blue-600 hover:text-blue-800 underline">
                            <strong className="text-foreground">500+ Career Guides</strong>
                          </Link>
                          {' covering Web3 roles, transitions, and industry trends'}
                        </li>
                        <li>
                          <Link href="/glossary" className="text-blue-600 hover:text-blue-800 underline">
                            <strong className="text-foreground">200+ Blockchain Glossary Terms</strong>
                          </Link>
                          {' with detailed definitions and examples'}
                        </li>
                        <li>
                          <Link href="/jobs" className="text-blue-600 hover:text-blue-800 underline">
                            <strong className="text-foreground">Daily Updated Jobs</strong>
                          </Link>
                          {' across engineering, product, marketing, legal, and operations'}
                        </li>
                        <li>
                          <Link href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                            <strong className="text-foreground">60,000+ Subscribers</strong>
                          </Link>
                          {' on our real-time Telegram hiring channel'}
                        </li>
                        <li>
                          <strong className="text-foreground">
                            <Link href="/tools" className="text-blue-600 hover:text-blue-800 underline">Free Tools:</Link>
                          </strong>
                          {' '}
                          <Link href="/tools/salary-calculator" className="text-blue-600 hover:text-blue-800 underline">Salary calculator</Link>
                          {', '}
                          <Link href="/tools/resume-builder" className="text-blue-600 hover:text-blue-800 underline">resume builder</Link>
                          {', and '}
                          <Link href="/tools/interview-questions" className="text-blue-600 hover:text-blue-800 underline">interview question bank</Link>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-semibold text-foreground mb-2">
                        <Link href="/guides/web3-salaries" className="text-blue-600 hover:text-blue-800 underline">Web3 Compensation</Link>
                      </h3>
                      <p>
                        Web3 roles typically pay <strong className="text-foreground">20–40% more</strong> than equivalent Web2 positions, with salaries ranging from <strong className="text-foreground">$80,000–$250,000+</strong>. {' '}
                        <Link href="/tools/salary-calculator" className="text-blue-600 hover:text-blue-800 underline">Solidity engineers and smart contract auditors</Link>
                        {' command the highest premiums due to talent scarcity.'}
                      </p>
                    </div>
                    
                    <p className="text-base font-medium text-foreground">
                      Get started today.{' '}
                      <Link href="/jobs" className="text-blue-600 hover:text-blue-800 underline">
                        Browse open roles
                      </Link>
                      , {' '}
                      <Link href="/guides" className="text-blue-600 hover:text-blue-800 underline">
                        explore our guides
                      </Link>
                      , or{' '}
                      <Link href="https://discord.gg/hashtagweb3" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                        join our community
                      </Link>
                      {' '}to discover your next Web3 opportunity.
                    </p>
                  </section>
              </div>
          </div>
        </main>
      </div>
    </>
  );
}
