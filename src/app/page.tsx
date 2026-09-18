import { JobBoard } from '@/components/job-board';
import { getJobSlug } from '@/lib/job-slugs';
import type { Job } from '@/types';
import homepageJobs from '../../content/homepage-jobs.json';
import { TrustedBy } from '@/components/trusted-by';
import { CommunityFeedBanner } from '@/components/community-feed-banner';
import { PageHeader } from "@/components/page-header";
import { PageShell } from '@/components/page-shell';
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/lib/site-schema';
import type { Metadata } from 'next';
import type { CompanyLogoMap } from '@/lib/job-listing';

// Static HTML from build — avoid bundling full jobs-runtime.json in the Worker (Cloudflare 1102).
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Web3 Jobs and Crypto Careers',
  description: 'Find verified Web3 jobs, crypto careers, salary data, and remote blockchain roles. Updated daily for builders, engineers, and operators.',
  alternates: {
    canonical: 'https://hashtagweb3.com',
  },
  openGraph: {
    type: 'website',
    title: 'Web3 Jobs and Crypto Careers',
    description: 'Find verified Web3 jobs, crypto careers, salary data, and remote blockchain roles. Updated daily.',
    url: 'https://hashtagweb3.com',
    images: [{ url: 'https://hashtagweb3.com/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Jobs and Crypto Careers',
    description: 'Find verified Web3 jobs, crypto careers, salary data, and remote blockchain roles. Updated daily.',
    images: ['https://hashtagweb3.com/og-image.png'],
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
  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        url: siteUrl,
        name: 'Web3 Jobs & Crypto Careers | Hashtag Web3',
        description: `Browse ${totalJobs} verified Web3, smart contract, DeFi, and crypto job openings.`,
      },
      {
        '@type': 'ItemList',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1" data-job-page>
          <PageShell>
            <PageHeader title="Web3 Jobs" />

            <section className="sr-only">
              <h2>Verified Web3 jobs and crypto careers</h2>
              <p>
                Hashtag Web3 indexes {totalJobs.toLocaleString()} verified Web3 jobs from official employer career pages.
                See <a href="/index.md">index.md</a> and <a href="/llms.txt">llms.txt</a> for agents.
              </p>
            </section>

            <article className="site-container">
              <TrustedBy />
              <CommunityFeedBanner label="hiring feed" />
              <JobBoard
                initialJobs={initialJobs}
                initialTotal={totalJobs}
                companyLogos={companyLogos}
              />
            </article>
          </PageShell>
        </main>
      </div>
    </>
  );
}
