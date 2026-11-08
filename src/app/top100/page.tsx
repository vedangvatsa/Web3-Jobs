import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { Top100Board } from '@/components/top100-board';
import { TrustedBy } from '@/components/trusted-by';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CtaBanner } from '@/components/cta-banner';
import { top100Data } from '@/lib/top100';
import { resolveCompanyLogo, getCompanyFaviconUrl, getCompanyFaviconUrlBySlug } from '@/lib/company-logo';
import { withLogoImageVariants } from '@/lib/responsive-images-server';
import { STATIC_OG } from '@/lib/job-og';

export const metadata: Metadata = {
  title: 'Top 100 Web3 Employers | Web3 Rankings',
  description:
    'A ranking of the top 100 Web3 employers based on verified active hiring volume, role diversity, remote flexibility, and salary transparency.',
  alternates: {
    canonical: 'https://hashtagweb3.com/top100',
  },
  openGraph: {
    type: 'website',
    title: 'Top 100 Web3 Employers | Hashtag Web3',
    description:
      'A ranking of the top 100 Web3 employers based on verified active hiring volume, role diversity, remote flexibility, and salary transparency.',
    url: 'https://hashtagweb3.com/top100',
    images: [
      {
        url: STATIC_OG.top100,
        width: 1200,
        height: 630,
        alt: 'Top 100 Web3 Employers | Hashtag Web3',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top 100 Web3 Employers | Hashtag Web3',
    description:
      'A ranking of the top 100 Web3 employers based on verified active hiring volume, role diversity, remote flexibility, and salary transparency.',
    images: [STATIC_OG.top100],
  },
};

export const revalidate = 3600;

export default async function Top100Page() {
  const { employers, year } = top100Data;

  // Build company logos map server-side
  const companyLogos: Record<string, { logo: string | null; favicon: string | null }> = {};
  for (const emp of employers) {
    companyLogos[emp.slug] = {
      logo: resolveCompanyLogo(emp.slug),
      favicon: getCompanyFaviconUrl(emp.website) ?? getCompanyFaviconUrlBySlug(emp.slug),
    };
  }

  const enhancedLogos = withLogoImageVariants(companyLogos);

  const siteUrl = 'https://hashtagweb3.com';
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Top 100 Web3 Employers (${year})`,
    description:
      'A ranking of the top 100 Web3 employers based on verified active hiring volume, role diversity, remote flexibility, and salary transparency.',
    url: `${siteUrl}/top100`,
    numberOfItems: employers.length,
    itemListElement: employers.slice(0, 20).map((emp) => ({
      '@type': 'ListItem',
      position: emp.rank,
      name: emp.name,
      url: `${siteUrl}/${emp.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <div className="flex min-w-0 flex-col min-h-screen">
        <main className="min-w-0 flex-1">
          <PageShell containerClassName="min-w-0">
            <PageHeader title="Top 100 Web3 Employers" />

            <TrustedBy />

            <div className="mt-8">
              <Top100Board
                initialEmployers={employers}
                companyLogos={enhancedLogos}
              />
            </div>

            {/* Methodology Section */}
            <section
              id="methodology"
              aria-label="Ranking Methodology"
              className="mt-16 border-t border-border/60 pt-12"
            >
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                How Employers Are Ranked
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground font-normal">
                Rankings are calculated directly from verified job listings across four objective criteria:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card className="border-border/70 bg-card shadow-none">
                  <CardHeader className="p-5">
                    <h3 className="text-base font-semibold text-foreground">
                      1. Hiring Volume (60%)
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 font-normal">
                      Based on verified live open roles across engineering, product, security, and operations.
                    </p>
                    <p className="text-xs text-muted-foreground mt-3 pt-2.5 border-t border-border/50">
                      <strong>Source:</strong> Verified ATS job feeds (Greenhouse, Lever, Ashby, Workable).
                    </p>
                  </CardHeader>
                </Card>

                <Card className="border-border/70 bg-card shadow-none">
                  <CardHeader className="p-5">
                    <h3 className="text-base font-semibold text-foreground">
                      2. Role Diversity (20%)
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 font-normal">
                      Measures functional hiring breadth across distinct disciplines (Engineering, Product, Security, Operations, Marketing, Legal).
                    </p>
                    <p className="text-xs text-muted-foreground mt-3 pt-2.5 border-t border-border/50">
                      <strong>Source:</strong> Department categorizations in live job listings.
                    </p>
                  </CardHeader>
                </Card>

                <Card className="border-border/70 bg-card shadow-none">
                  <CardHeader className="p-5">
                    <h3 className="text-base font-semibold text-foreground">
                      3. Remote Flexibility (10%)
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 font-normal">
                      Evaluates the percentage of active positions offering global or regional remote work.
                    </p>
                    <p className="text-xs text-muted-foreground mt-3 pt-2.5 border-t border-border/50">
                      <strong>Source:</strong> Workplace and location fields in verified job feeds.
                    </p>
                  </CardHeader>
                </Card>

                <Card className="border-border/70 bg-card shadow-none">
                  <CardHeader className="p-5">
                    <h3 className="text-base font-semibold text-foreground">
                      4. Salary Transparency (10%)
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 font-normal">
                      Recognizes employers that publish clear upfront compensation and salary ranges.
                    </p>
                    <p className="text-xs text-muted-foreground mt-3 pt-2.5 border-t border-border/50">
                      <strong>Source:</strong> Published salary ranges in verified job listings.
                    </p>
                  </CardHeader>
                </Card>
              </div>

              <div className="mt-4 rounded-lg border border-border/70 bg-card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      Research Whitepaper
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1 font-normal">
                      Read the complete empirical study on hiring capacity, mathematical formulation, and pay transparency.
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="shrink-0">
                    <a
                      href="/whitepaper-top100-web3-employers.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Whitepaper (PDF)
                    </a>
                  </Button>
                </div>
              </div>
            </section>

            {/* Frequently Asked Questions */}
            <section aria-label="Frequently Asked Questions" className="mt-12 border-t border-border/60 pt-12">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Frequently Asked Questions
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card className="border-border/70 bg-card shadow-none">
                  <CardHeader className="p-5">
                    <h3 className="text-base font-semibold text-foreground">
                      How are rankings calculated?
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 font-normal">
                      Rankings are calculated entirely from live job listings verified through official ATS feeds. Employers are evaluated on active hiring volume, role diversity, remote availability, and compensation transparency.
                    </p>
                  </CardHeader>
                </Card>

                <Card className="border-border/70 bg-card shadow-none">
                  <CardHeader className="p-5">
                    <h3 className="text-base font-semibold text-foreground">
                      Why do companies with more open roles rank higher?
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 font-normal">
                      The Top 100 Web3 Employers Index highlights organizations with the largest active hiring footprints and career opportunities in Web3.
                    </p>
                  </CardHeader>
                </Card>

                <Card className="border-border/70 bg-card shadow-none">
                  <CardHeader className="p-5">
                    <h3 className="text-base font-semibold text-foreground">
                      Can employers pay to be ranked higher?
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 font-normal">
                      No. Rankings are determined entirely by verified hiring data. Companies cannot pay for placement or score increases.
                    </p>
                  </CardHeader>
                </Card>

                <Card className="border-border/70 bg-card shadow-none">
                  <CardHeader className="p-5">
                    <h3 className="text-base font-semibold text-foreground">
                      How often is the ranking updated?
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 font-normal">
                      Rankings update regularly as companies post new roles and active ATS feeds refresh.
                    </p>
                  </CardHeader>
                </Card>
              </div>
            </section>

            {/* Standard CTA Banner */}
            <CtaBanner
              variant="jobs"
              title="Looking for your next Web3 role?"
              description="Explore open roles across engineering, product, and operations at top Web3 companies."
              buttonText="Browse Web3 Jobs"
              href="/jobs"
            />
          </PageShell>
        </main>
      </div>
    </>
  );
}
