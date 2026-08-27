import { JobBoard } from '@/components/job-board';
import { buildCompanyLogoMap } from '@/lib/job-listing';
import { getJobSlug } from '@/lib/job-slugs';
import { getJobs } from '@/lib/jobs';
import { TrustedBy } from '@/components/trusted-by';
import { CommunityFeedBanner } from '@/components/community-feed-banner';
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
        description: `Browse ${allJobs.length} verified Web3, smart contract, DeFi, and crypto job openings.`,
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

            {/* Semantic SSR content for AI search and crawlers */}
            <section className="sr-only" aria-hidden="false">
              <h2>Verified Web3 Engineering, DeFi &amp; Blockchain Career Directory</h2>
              <p>
                Hashtag Web3 indexes thousands of verified Web3 jobs across Solidity, Rust, smart contract security, zero-knowledge proofs, DeFi protocols, DAOs, and crypto marketing. Every listing is verified against official employer career portals and updated in real-time.
              </p>
              <h2>Top Web3 Companies &amp; Protocols Hiring Now</h2>
              <p>
                Discover active hiring opportunities at leading Layer 1 blockchains, Layer 2 rollups, DeFi protocols, crypto custody providers, and Web3 infrastructure companies including Coinbase, Uniswap, Binance, Aave, and Anchorage Digital.
              </p>
              <h2>How Hashtag Web3 Verifies Job Listings</h2>
              <p>
                All positions are verified against first-party applicant tracking systems (Greenhouse, Lever, Ashby, Workable) and authentic protocol repositories to eliminate ghost and scam postings. Read access is 100% free and unauthenticated via our public REST APIs at https://hashtagweb3.com/api/v1/jobs and Streamable HTTP MCP server at https://hashtagweb3.com/.well-known/mcp.
              </p>
            </section>

            <article className="site-container">
              <TrustedBy />
              <CommunityFeedBanner label="hiring feed" />
              <section className="mt-6">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
                  Latest Verified Web3 &amp; Blockchain Jobs
                </h2>
                <JobBoard
                  initialJobs={initialJobs}
                  initialTotal={allJobs.length}
                  companyLogos={companyLogos}
                />
              </section>
            </article>
          </PageShell>
        </main>
      </div>
    </>
  );
}
