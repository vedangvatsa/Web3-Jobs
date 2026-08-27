import { getCompanies } from '@/lib/companies';
import type { Metadata } from 'next';
import { PageHeader } from "@/components/page-header";
import { PageShell } from '@/components/page-shell';
import { CompaniesBoard } from '@/components/companies-board';
import { resolveCompanyLogo, getCompanyFaviconUrl } from '@/lib/company-logo';
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
    images: [{ url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Companies', width: 1200, height: 630, alt: 'Web3 Companies hiring in crypto and blockchain' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top Web3 Companies | Hashtag Web3',
    description: 'Explore Web3 companies actively hiring in blockchain, DeFi, and crypto.',
    images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Companies'],
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
      favicon: getCompanyFaviconUrl(c.website),
    };
  }

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
            <section className="text-center mb-8">
              <div className="site-container">
                <PageHeader title="Web3 Companies" />
              </div>
            </section>

            <article className="site-container">
              <TrustedBy />
              <CommunityFeedBanner label="company & hiring feed" />
              <CompaniesBoard initialCompanies={companies} companyLogos={companyLogos} />
            </article>
          </PageShell>
        </main>
      </div>
    </>
  );
}
