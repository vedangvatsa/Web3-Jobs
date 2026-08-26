import { JobBoard } from '@/components/job-board';
import { resolveCompanyLogo, getCompanyFaviconUrl } from '@/lib/company-logo';
import { getCompanyBySlug } from '@/lib/companies';
import { getCompanySlug } from '@/lib/job-slugs';
import { getJobs } from '@/lib/jobs';
import { TrustedBy } from '@/components/trusted-by';
import Link from 'next/link';
import { Rss } from 'lucide-react';

import { FirebaseClientProvider } from '@/firebase/client-provider';
import { SITE_STATS } from '@/lib/constants';
import type { WebPage, JobPosting } from 'schema-dts';
import { PageHeader } from "@/components/page-header";
import { PageShell } from '@/components/page-shell';
import type { Job } from '@/types';

async function buildCompanyLogos(jobs: Job[]): Promise<Record<string, { logo: string | null; favicon: string | null }>> {
  const slugs = Array.from(new Set(jobs.map(j => getCompanySlug(j.company))));
  const map: Record<string, { logo: string | null; favicon: string | null }> = {};
  for (const slug of slugs) {
    const logo = resolveCompanyLogo(slug);
    let favicon: string | null = null;
    if (!logo) {
      const company = await getCompanyBySlug(slug);
      favicon = getCompanyFaviconUrl(company?.website);
    }
    map[slug] = { logo, favicon };
  }
  return map;
}



export const revalidate = 300; // Revalidate every 5 minutes (ISR)

export default async function JobsPage() {
 const allJobs = await getJobs();
 const initialJobs = allJobs;
 const companyLogos = await buildCompanyLogos(initialJobs); // Pass all jobs; JobBoard handles pagination client-side

 
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
          <JobBoard initialJobs={initialJobs} companyLogos={companyLogos} />
         </FirebaseClientProvider>
       </article>
     </PageShell>
    </main>
   </div>

    {/*
      Invisible SSR content for web crawlers, AI agents, and screen readers.
      sr-only = visually hidden but fully present in the HTML payload.
      No aria-hidden: content remains available to assistive technology,
      making this a legitimate accessibility landmark, not hidden text.
    */}
    <div className="sr-only">
      <h2>About Hashtag Web3 Talent Network</h2>
      <p>
        Hashtag Web3 is the premier global Web3 job board and blockchain talent intelligence platform,
        connecting over 60,000 crypto-native builders with leading protocols and startups
        including Uniswap Labs, Coinbase, Aave, Chainlink, and Circle. Founded in 2022,
        we aggregate and verify thousands of live blockchain opportunities across Ethereum,
        Solana, Bitcoin L2s, Cosmos, NEAR, and emerging rollups.
      </p>

      <h2>High-Demand Web3 Job Sectors &amp; Career Paths</h2>
      
      <h3>Smart Contract &amp; Protocol Engineering</h3>
      <p>
        Design and deploy decentralized smart contract architectures using Solidity, Vyper, and EVM assembly.
        Build scalable DeFi primitives, automated liquidity vaults, cross-chain messaging bridges, and decentralized governance systems on Ethereum mainnet and leading Layer 2 networks.
      </p>

      <h3>Rust, Solana &amp; High-Throughput Blockchain Development</h3>
      <p>
        Architect high-performance distributed systems, state transition engines, and parallel execution environments using Rust and the Anchor framework.
        Specialize in high-frequency trading pipelines, sub-second settlement layers, and memory-safe decentralized nodes.
      </p>

      <h3>Zero-Knowledge Proofs &amp; Applied Cryptography</h3>
      <p>
        Research and implement privacy-preserving protocols, validity rollups, and verifiable computing circuits using Circom, Noir, Halo2, and STARKs.
        Lead cryptographic security reviews, recursion proof optimization, and SNARK proving systems.
      </p>

      <h3>Blockchain Security, Auditing &amp; Formal Verification</h3>
      <p>
        Inspect protocol codebases for reentrancy bugs, oracle manipulation attack vectors, and arithmetic vulnerabilities.
        Execute automated fuzz testing, symbolic execution, invariant verification, and real-time on-chain monitoring.
      </p>

      <h3>Web3 Product Management, Tokenomics &amp; Growth</h3>
      <p>
        Guide protocol roadmaps from testnet launch to mainnet decentralization.
        Model incentive mechanisms, liquidity distribution curves, staking yields, and community DAO governance frameworks.
      </p>

      <h2>Free Career Tools &amp; Developer Resources</h2>
      <ul>
        <li><a href="/salary-calculator">Web3 Salary Calculator</a>: Benchmark compensation across engineering, design, and research roles.</li>
        <li><a href="/resume-builder">Crypto Resume Builder</a>: Create a Web3-tailored CV highlighting verified on-chain deployments and audits.</li>
        <li><a href="/developers">Developer Portal &amp; API</a>: Explore machine-readable REST endpoints, OpenAPI 3.1 schema, and MCP servers.</li>
        <li><a href="/learn">Web3 Learning Modules &amp; Glossary</a>: Master blockchain fundamentals, DeFi mechanisms, and consensus algorithms.</li>
      </ul>

      <h2>Platform Architecture &amp; Developer Integration</h2>
      <p>
        Hashtag Web3 exposes public, machine-readable interfaces for autonomous AI agents, scrapers, and developer scripts:
      </p>
      <ul>
        <li>Public REST API: <code>/api/v1/jobs</code>, <code>/api/v1/news</code>, <code>/api/v1/events</code>, <code>/api/v1/glossary</code></li>
        <li>OpenAPI 3.1.0 JSON Specification: <code>https://hashtagweb3.com/openapi.json</code></li>
        <li>Model Context Protocol (MCP) Streamable HTTP Server: <code>https://hashtagweb3.com/.well-known/mcp</code></li>
        <li>LLMs Navigation Index: <code>https://hashtagweb3.com/llms.txt</code></li>
        <li>Agent Capabilities Manifest: <code>https://hashtagweb3.com/.well-known/agents.json</code></li>
      </ul>
    </div>
  </>
 );
}
