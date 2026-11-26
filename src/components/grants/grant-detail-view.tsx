import type { GrantProgram } from '@/types';
import Link from 'next/link';
import { GrantCard } from '@/components/grants/grant-card';
import { JsonLd } from '@/components/json-ld';
import { Button } from '@/components/ui/button';
import { DetailPageHeader } from '@/components/detail-page-header';
import { DetailPrimaryActionLink } from '@/components/primary-action-link';
import { EventGuideContent } from '@/components/event-guide-content';
import { DirectoryDisclaimer } from '@/components/directory-disclaimer';
import { getRelatedGrants } from '@/lib/grants';
import { formatGrantDetailSubtitle } from '@/lib/grant-subtitle';
import { generateGrantEditorial, grantEditorialToEventArticle } from '@/lib/grant-editorial';
import { Calendar, Coins, ExternalLink, ArrowRight } from 'lucide-react';

export function GrantDetailView({ grant }: { grant: GrantProgram }) {
  const editorial = generateGrantEditorial(grant);
  const eventArticle = grantEditorialToEventArticle(editorial);
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
  const faviconUrl = grant.logo || (domain ? `https://icons.duckduckgo.com/ip3/${domain}.ico` : null);
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

      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <main className="flex-1 pb-16" data-grant-page>
          <article className="site-container py-10 sm:py-14">
            <DetailPageHeader
              breadcrumbs={[
                { href: '/', label: 'Home' },
                { href: '/grants', label: 'Grants & Credits' },
              ]}
              icon={
                <div className="flex h-full w-full items-center justify-center rounded-md border border-border/60 bg-muted/40 p-2">
                  {faviconUrl ? (
                    <img
                      src={faviconUrl}
                      alt={`${grant.provider} logo`}
                      width={48}
                      height={48}
                      className="h-12 w-12 object-contain"
                      loading="eager"
                    />
                  ) : (
                    <span className="text-xl font-bold text-foreground">{initial}</span>
                  )}
                </div>
              }
              title={grant.name}
              subtitle={
                <p className="text-base font-medium text-muted-foreground">
                  {formatGrantDetailSubtitle(grant)}
                </p>
              }
              metadata={
                <>
                  {grant.amount ? (
                    <div className="flex min-w-0 items-center gap-1.5">
                      <Coins className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="font-medium text-foreground break-words">{grant.amount}</span>
                    </div>
                  ) : null}
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span>{grant.deadline || 'Rolling applications'}</span>
                  </div>
                </>
              }
              actions={
                <DetailPrimaryActionLink href={grant.url} target="_blank" rel="noopener noreferrer nofollow">
                  Details
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </DetailPrimaryActionLink>
              }
            />

            <EventGuideContent
              editorial={eventArticle}
              officialUrl={grant.url}
              contentMarker="grant"
              unavailableCopy={{
                heading: 'Program details',
                message: `Full eligibility and application steps live on ${grant.provider}'s official site.`,
                linkLabel: 'View the official program page',
              }}
            />

            <DirectoryDisclaimer
              variant="grant"
              entityName={grant.provider || grant.name}
              outboundUrl={grant.url}
            />

            {relatedGrants.length > 0 && (
              <section className="mt-12 space-y-4 border-t pt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Related Grants &amp; Builder Credits</h2>
                  <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                    <Link href="/grants" prefetch={false} className="flex items-center gap-1">
                      <span>All Grants</span>
                      <ArrowRight className="h-3.5 w-3.5" />
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
          </article>
        </main>
      </div>
    </>
  );
}