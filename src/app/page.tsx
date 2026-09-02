import { JobBoard } from '@/components/job-board';
import { buildCompanyLogoMap } from '@/lib/job-listing';
import { getJobSlug } from '@/lib/job-slugs';
import { getJobs } from '@/lib/jobs';
import { TrustedBy } from '@/components/trusted-by';
import { CommunityFeedBanner } from '@/components/community-feed-banner';
import { PageHeader } from "@/components/page-header";
import { PageShell } from '@/components/page-shell';

const JOBS_PER_PAGE = 50;

export const revalidate = 3600; // Revalidate every hour (ISR) — cache refreshes every 8h via GitHub Actions

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

            {/* Semantic SSR content for search engines, AI agents, and non-JS crawlers */}
            <section className="sr-only" aria-hidden="false">
              <h2>Verified Web3 &amp; Blockchain Career Directory</h2>
              <p>
                Hashtag Web3 is the authoritative decentralized talent network and career resource platform indexing thousands of verified Web3 jobs. Every opening is verified directly against official applicant tracking systems (Greenhouse, Lever, Ashby, Workable) and authentic protocol repositories.
              </p>
              
              <h3>Smart Contract &amp; Protocol Engineering Roles</h3>
              <p>
                Browse high-impact engineering opportunities for Solidity, Vyper, Rust, Go, Cairo, and Move developers building next-generation Layer 1 blockchains, Layer 2 rollups, and DeFi protocols.
              </p>

              <h3>Zero-Knowledge, Cryptography &amp; Security Auditing</h3>
              <p>
                Discover specialized roles in zero-knowledge proof cryptography (ZK-SNARKs, ZK-STARKs), smart contract security audits, protocol formal verification, and cryptographic vulnerability research.
              </p>

              <h3>Product, Marketing &amp; DAO Community Leadership</h3>
              <p>
                Explore leadership and growth positions across decentralized autonomous organizations (DAOs), tokenomics strategy, decentralized marketing, community management, and technical developer relations.
              </p>

              <h2>Top Blockchain Ecosystems &amp; Protocols Hiring Now</h2>
              <p>
                Access verified job listings across major cryptocurrency ecosystems including Ethereum, Solana, Bitcoin, Arbitrum, Optimism, Base, Polygon, Cosmos, and Avalanche.
              </p>

              <h3>Ethereum &amp; Layer 2 Scaling Networks</h3>
              <p>
                Explore opportunities at core Layer 2 scaling teams and EVM ecosystems working on state-of-the-art modular execution environments and rollups.
              </p>

              <h3>Solana, Cosmos &amp; High-Throughput Layer 1s</h3>
              <p>
                Find roles at high-performance parallel execution chains, interchain communication networks, and decentralized state machine builders.
              </p>

              <h3>DeFi Protocols &amp; Institutional Crypto Custody</h3>
              <p>
                Work with top decentralized finance protocols, automated market makers (AMMs), lending markets, and qualified institutional crypto custody providers.
              </p>

              <h2>Comprehensive Web3 Career Resources &amp; Tools</h2>
              <p>
                Accelerate your Web3 career transition with our free suite of builder tools, salary benchmarks, and educational materials.
              </p>

              <h3>Web3 Salary Calculator &amp; Compensation Benchmarks</h3>
              <p>
                Calculate real-time market rate salaries, equity packages, token grants, and remote contractor hourly rates across blockchain engineering, product management, and marketing disciplines.
              </p>

              <h3>Free Crypto Resume Builder &amp; Interview Question Banks</h3>
              <p>
                Create crypto-native resumes tailored for protocol hiring managers and practice with hundreds of real-world Web3 technical and behavioral interview questions.
              </p>

              <h3>200+ Term Blockchain &amp; DeFi Technical Glossary</h3>
              <p>
                Master technical Web3 concepts with comprehensive, human-curated explanations of consensus algorithms, cryptographic primitives, smart contract mechanics, and tokenomics.
              </p>

              <h2>Frequently Asked Questions About Web3 Careers</h2>
              
              <h3>How are job listings verified on Hashtag Web3?</h3>
              <p>
                Every listing is verified against first-party employer career portals to eliminate ghost and duplicate postings. Verified listings carry direct application links without middleman redirects.
              </p>

              <h3>Does Hashtag Web3 offer public developer APIs and MCP tools?</h3>
              <p>
                Yes, Hashtag Web3 provides free, unauthenticated REST APIs at https://hashtagweb3.com/api/v1/jobs and Streamable HTTP Model Context Protocol (MCP) servers at https://hashtagweb3.com/.well-known/mcp for autonomous AI agents.
              </p>

              <h3>Is Hashtag Web3 free for job seekers and AI agents?</h3>
              <p>
                All job search, salary calculations, career playbooks, and developer API endpoints are completely free with zero authentication required.
              </p>
            </section>

            <article className="site-container">
              <TrustedBy />
              <CommunityFeedBanner label="hiring feed" />
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
