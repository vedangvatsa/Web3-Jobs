import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { CommunityFeedBanner } from '@/components/community-feed-banner';
import { getAllCbdcSlugs, getCbdcBySlug } from '@/lib/cbdcs';
import { seoSocialTitle, seoTitleSegment } from '@/lib/seo-title';
import { Landmark, Calendar, Cpu, Layers, ExternalLink, ArrowLeft, ShieldCheck, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = getAllCbdcSlugs();
  return slugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const cbdc = getCbdcBySlug(params.slug);
  if (!cbdc) return {};

  const titleSegment = `${cbdc.digitalCurrency} (${cbdc.country}) CBDC Profile & Status`;
  const socialTitle = seoSocialTitle(titleSegment);
  const desc = `Detailed overview of ${cbdc.digitalCurrency} in ${cbdc.country}. Status: ${cbdc.status}. Central Bank: ${cbdc.centralBank}. Architecture: ${cbdc.dlt}. Type: ${cbdc.type}.`;

  return {
    title: seoTitleSegment(titleSegment),
    description: desc,
    alternates: {
      canonical: `https://hashtagweb3.com/cbdcs/${cbdc.slug}`,
    },
    openGraph: {
      type: 'article',
      title: socialTitle,
      description: desc,
      url: `https://hashtagweb3.com/cbdcs/${cbdc.slug}`,
      images: ['https://hashtagweb3.com/og/pages/grants.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: desc,
      images: ['https://hashtagweb3.com/og/pages/grants.png'],
    },
  };
}

export default function CbdcDetailPage({ params }: { params: { slug: string } }) {
  const cbdc = getCbdcBySlug(params.slug);
  if (!cbdc) {
    notFound();
  }

  const siteUrl = 'https://hashtagweb3.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `${cbdc.digitalCurrency} (${cbdc.country})`,
    description: cbdc.goals || `Central Bank Digital Currency project developed by ${cbdc.centralBank}.`,
    url: `${siteUrl}/cbdcs/${cbdc.slug}`,
    provider: {
      '@type': 'Organization',
      name: cbdc.centralBank,
    },
    areaServed: {
      '@type': 'Country',
      name: cbdc.country,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1" data-cbdc-detail-page>
          <PageShell>
            <div className="mb-6">
              <Button asChild variant="ghost" size="sm" className="gap-1.5 pl-0 hover:bg-transparent">
                <Link href="/cbdcs">
                  <ArrowLeft className="h-4 w-4" />
                  Back to all CBDCs
                </Link>
              </Button>
            </div>

            <PageHeader
              title={`${cbdc.digitalCurrency}`}
            />
            <div className="text-sm font-medium text-muted-foreground -mt-4 mb-6">
              {cbdc.country} &bull; <span className="text-primary font-semibold">{cbdc.status}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <div className="md:col-span-2 space-y-6">
                <div className="rounded-lg border border-border/70 bg-card p-6 shadow-none">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground mb-3">
                    Project Overview & Strategic Goals
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {cbdc.goals ||
                      `The ${cbdc.digitalCurrency} is an initiative led by ${cbdc.centralBank} to explore national digital currency architecture, settlement efficiency, and digital payment infrastructure in ${cbdc.country}.`}
                  </p>
                </div>

                <div className="rounded-lg border border-border/70 bg-card p-6 shadow-none">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4">
                    Technical Specifications
                  </h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                        Architecture
                      </dt>
                      <dd className="font-medium text-foreground mt-1 flex items-center gap-1.5">
                        <Cpu className="h-4 w-4 text-primary" />
                        {cbdc.dlt}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                        Distribution Type
                      </dt>
                      <dd className="font-medium text-foreground mt-1 flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-primary" />
                        {cbdc.type}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                        Cross-Border Capable
                      </dt>
                      <dd className="font-medium text-foreground mt-1 flex items-center gap-1.5">
                        <Globe className="h-4 w-4 text-primary" />
                        {cbdc.crossBorderProject ? 'Yes (Multi-Central Bank)' : 'Domestic Focus'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                        Announcement Year
                      </dt>
                      <dd className="font-medium text-foreground mt-1 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" />
                        {cbdc.announcementYear || 'Not Disclosed'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-lg border border-border/70 bg-card p-6 shadow-none space-y-4">
                  <h3 className="font-semibold text-foreground text-base">Key Details</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">Country</span>
                      <span className="font-medium text-foreground">{cbdc.country}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Central Bank</span>
                      <span className="font-medium text-foreground">{cbdc.centralBank}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Status</span>
                      <span className="inline-block mt-0.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {cbdc.status}
                      </span>
                    </div>
                  </div>

                  {cbdc.announcementLink && (
                    <div className="pt-3 border-t border-border">
                      <Button asChild className="w-full gap-1.5" size="sm">
                        <a href={cbdc.announcementLink} target="_blank" rel="noopener noreferrer">
                          Official Source & Reports
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium text-foreground mb-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Verified Primary Source
                  </div>
                  Data indexed from official central bank declarations and global CBDC tracking repositories. Last verified on {cbdc.verifiedOn}.
                </div>
              </div>
            </div>

            <CommunityFeedBanner variant="community" />
          </PageShell>
        </main>
      </div>
    </>
  );
}
