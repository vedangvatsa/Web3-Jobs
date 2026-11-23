import type { GrantProgram } from '@/types';
import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { DetailPageHeader } from '@/components/detail-page-header';
import { GrantCard } from '@/components/grants/grant-card';
import { JsonLd } from '@/components/json-ld';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRelatedGrants } from '@/lib/grants';
import { generateGrantEditorial } from '@/lib/grant-editorial';
import {
  ExternalLink,
  Coins,
  Layers,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function GrantDetailView({ grant }: { grant: GrantProgram }) {
  const editorial = generateGrantEditorial(grant);
  const relatedGrants = getRelatedGrants(grant, 3);
  const siteUrl = 'https://hashtagweb3.com';
  const canonicalUrl = `${siteUrl}/${grant.id}`;

  const domain =
    grant.domain ||
    (() => {
      try {
        return new URL(grant.url).hostname.replace(/^www\./, '');
      } catch {
        return '';
      }
    })();
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;
  const initial = (grant.provider || grant.name || 'G').trim().charAt(0).toUpperCase();

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Grants & Credits', item: `${siteUrl}/grants` },
      { '@type': 'ListItem', position: 3, name: grant.name, item: canonicalUrl },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: grant.name,
    description: grant.description,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Hashtag Web3',
    },
    about: {
      '@type': 'FinancialProduct',
      name: grant.name,
      provider: {
        '@type': 'Organization',
        name: grant.provider,
      },
      category: grant.category,
      feesAndCommissionsSpecification: 'Zero equity, non-dilutive grant funding',
    },
  };

  return (
    <>
      <JsonLd data={breadcrumbsSchema} />
      <JsonLd data={webPageSchema} />

      <div className="flex flex-col min-h-screen">
        <main className="flex-1 pb-16">
          <PageShell>
            <article className="pt-6 sm:pt-8">
              {/* Detail Page Header */}
              <DetailPageHeader
                breadcrumbs={[
                  { href: '/', label: 'Home' },
                  { href: '/grants', label: 'Grants & Credits' },
                ]}
                currentPageLabel={grant.name}
                icon={
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border/70 bg-card p-2 shadow-sm">
                    {faviconUrl ? (
                      <img
                        src={faviconUrl}
                        alt={`${grant.provider} logo`}
                        width={40}
                        height={40}
                        className="h-10 w-10 object-contain rounded-md"
                        loading="eager"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted/60 text-lg font-bold text-foreground">
                        {initial}
                      </div>
                    )}
                  </div>
                }
                title={grant.name}
                subtitle={
                  <p className="text-base text-muted-foreground font-medium">
                    {grant.provider} · <span className="text-foreground/80">{grant.category}</span>
                  </p>
                }
                metadata={
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                    {grant.amount && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/60 px-2.5 py-1 font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                        {grant.amount}
                      </span>
                    )}
                    {grant.ecosystem && grant.ecosystem !== 'Other' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-2.5 py-1 text-muted-foreground">
                        <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                        {grant.ecosystem}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-2.5 py-1 text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      {grant.type}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-2.5 py-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      {grant.deadline || 'Rolling Applications'}
                    </span>
                  </div>
                }
                actions={
                  <Button asChild size="lg" className="gap-2 font-semibold shadow-sm">
                    <a href={grant.url} target="_blank" rel="noopener noreferrer">
                      Apply on Official Site
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                }
              />

              {/* Body Content Grid */}
              <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                {/* Main Content Column */}
                <div className="min-w-0 space-y-10">
                  {editorial.summaryLead && (
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-5 text-base sm:text-lg leading-relaxed text-foreground/90 font-normal">
                      {editorial.summaryLead}
                    </div>
                  )}

                  {!editorial.hasSourceBody && (
                    <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm leading-relaxed text-muted-foreground">
                      Full program details are on the official site. Use the apply link to read eligibility, funding
                      terms, and the current application process from {grant.provider}.
                    </div>
                  )}

                  {editorial.sections.map((section, idx) => (
                    <section key={idx} className="space-y-4">
                      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        {section.heading}
                      </h2>

                      {section.paragraphs.map((p, pIdx) => (
                        <p key={pIdx} className="text-base leading-relaxed text-muted-foreground">
                          {p}
                        </p>
                      ))}

                      {section.bullets && section.bullets.length > 0 && (
                        <ul className="mt-3 space-y-2.5 pl-2">
                          {section.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2.5 text-base leading-relaxed text-muted-foreground">
                              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}

                  {/* Tags */}
                  {grant.tags && grant.tags.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Program Keywords &amp; Tracks
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {grant.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground/80"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Apply Card */}
                  <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-foreground">
                        Ready to apply to {grant.name}?
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Apply on the official {grant.provider} program page linked below.
                      </p>
                    </div>
                    <Button asChild size="lg" className="shrink-0 gap-2 font-semibold">
                      <a href={grant.url} target="_blank" rel="noopener noreferrer">
                        Visit Application Portal
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                  {/* Highlights Card */}
                  <Card className="border-border/70 shadow-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">Program Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      {editorial.keyHighlights.map((item) => (
                        <div key={item.label} className="flex flex-col border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                            {item.label}
                          </span>
                          <span className="mt-0.5 font-semibold text-foreground break-words">
                            {item.value}
                          </span>
                        </div>
                      ))}

                      <div className="pt-2">
                        <Button asChild className="w-full gap-2 font-semibold" size="default">
                          <a href={grant.url} target="_blank" rel="noopener noreferrer">
                            Apply on Official Site
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Verification Note Card */}
                  <Card className="border-border/70 bg-muted/15 shadow-none">
                    <CardContent className="p-4 flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" aria-hidden="true" />
                      <div>
                        <strong className="block text-foreground font-semibold mb-0.5">Official source</strong>
                        {grant.descriptionSource?.method === 'listing-summary-unverified-fetch'
                          ? `Could not scrape the live program page (${grant.descriptionSource.url}). Overview text is the directory listing summary until a fresh fetch succeeds. Confirm amounts and deadlines on the official page.`
                          : grant.descriptionSource
                            ? `Body copy excerpted from ${grant.descriptionSource.url} (${new Date(grant.descriptionSource.fetchedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}). Confirm amounts and deadlines on the live page.`
                            : `Indexed from ${grant.url}. Confirm amounts and deadlines on the live page.`}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Back to all grants */}
                  <div>
                    <Button asChild variant="outline" className="w-full gap-2">
                      <Link href="/grants">
                        <ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" />
                        Back to All Grants &amp; Credits
                      </Link>
                    </Button>
                  </div>
                </aside>
              </div>

              {/* Related Grants Section */}
              {relatedGrants.length > 0 && (
                <section className="mt-16 pt-12 border-t border-border/70">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        Related Grants &amp; Builder Credits
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Explore more non-dilutive funding in {grant.ecosystem || grant.category}
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex gap-1.5 text-xs">
                      <Link href="/grants">
                        View all grants <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedGrants.map((related) => (
                      <GrantCard key={related.id} grant={related} />
                    ))}
                  </div>
                </section>
              )}

              {/* Directory Disclaimer */}
              <div className="mt-16 border-t border-border/50 pt-8 text-center text-xs text-muted-foreground/80 space-y-2">
                <p>
                  Hashtag Web3 is an independent directory indexing verified grant programs and startup credits.
                  Grant terms, amounts, and eligibility are governed solely by each respective organization.
                </p>
              </div>
            </article>
          </PageShell>
        </main>
      </div>
    </>
  );
}
