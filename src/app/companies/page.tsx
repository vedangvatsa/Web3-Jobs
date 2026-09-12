import { getCompanies } from '@/lib/companies';
import type { Metadata } from 'next';
import { PageHeader } from "@/components/page-header";
import { PageShell } from '@/components/page-shell';
import { CompaniesBoard } from '@/components/companies-board';
import { resolveCompanyLogo, getCompanyFaviconUrl, getCompanyFaviconUrlBySlug } from '@/lib/company-logo';
import { TrustedBy } from '@/components/trusted-by';
import { CommunityFeedBanner } from '@/components/community-feed-banner';

export const metadata: Metadata = {
  title: 'Top Web3 Companies | Crypto & Blockchain Employers',
  description: 'Explore top Web3 companies actively hiring in blockchain, DeFi, infrastructure, and crypto. Browse company profiles, open roles, and direct application links.',
  alternates: {
    canonical: 'https://hashtagweb3.com/companies',
  },
  openGraph: {
    type: 'website',
    title: 'Top Web3 Companies | Hashtag Web3',
    description: 'Explore top Web3 companies actively hiring in blockchain, DeFi, and crypto.',
    url: 'https://hashtagweb3.com/companies',
    images: [{ url: 'https://hashtagweb3.com/og-companies.png', width: 1200, height: 630, alt: 'Web3 Companies hiring in crypto and blockchain' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top Web3 Companies | Hashtag Web3',
    description: 'Explore Web3 companies actively hiring in blockchain, DeFi, and crypto.',
    images: ['https://hashtagweb3.com/og-companies.png'],
  },
};

export const revalidate = 3600;

export default async function CompaniesPage() {
  const companies = await getCompanies();

  // Build logo map server-side (shared pattern with homepage JobBoard)
  const companyLogos: Record<string, { logo: string | null; favicon: string | null }> = {};
  for (const c of companies) {
    companyLogos[c.slug] = {
      logo: resolveCompanyLogo(c.slug),
      favicon: getCompanyFaviconUrl(c.website) ?? getCompanyFaviconUrlBySlug(c.slug),
    };
  }

  // Ship a lean projection to the client board: full Company objects carry
  // every job posting + long-form copy (27MB RSC payload). The board only
  // renders/searches slug, name, description, and jobCount.
  const boardCompanies = companies.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description ?? '',
    jobCount: c.jobCount,
  }));

  const siteUrl = 'https://hashtagweb3.com';
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Top Web3 Companies | Hashtag Web3',
    description: `Explore ${companies.length} Web3 companies actively hiring in crypto and blockchain.`,
    url: `${siteUrl}/companies`,
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
            <PageHeader title="Web3 Companies" />

            <article className="site-container">
              <TrustedBy />
              <CommunityFeedBanner label="company & hiring feed" />
              <CompaniesBoard initialCompanies={boardCompanies} companyLogos={companyLogos} />
            </article>
          </PageShell>
        </main>
      </div>
    </>
  );
}
