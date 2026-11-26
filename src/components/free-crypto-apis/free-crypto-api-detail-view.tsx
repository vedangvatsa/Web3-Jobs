import type { FreeCryptoApiListing } from '@/types';
import Link from 'next/link';
import { FreeCryptoApiCard } from './free-crypto-api-card';
import { JsonLd } from '@/components/json-ld';
import { Button } from '@/components/ui/button';
import { DetailPageHeader } from '@/components/detail-page-header';
import { DetailPrimaryActionLink } from '@/components/primary-action-link';
import { EventGuideContent } from '@/components/event-guide-content';
import { DirectoryDisclaimer } from '@/components/directory-disclaimer';
import { getRelatedCryptoApis, getFreeCryptoApiLogo } from '@/lib/free-crypto-apis';
import {
  generateCryptoApiEditorial,
  cryptoApiEditorialToEventArticle,
} from '@/lib/free-crypto-api-editorial';
import { Code, ExternalLink, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

function domainFromUrl(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function FreeCryptoApiDetailView({ listing }: { listing: FreeCryptoApiListing }) {
  const editorial = generateCryptoApiEditorial(listing);
  const eventArticle = cryptoApiEditorialToEventArticle(editorial);
  const relatedApis = getRelatedCryptoApis(listing, 3);
  const siteUrl = 'https://hashtagweb3.com';
  const canonicalUrl = `${siteUrl}/${listing.slug}`;

  const domain = domainFromUrl(listing.websiteUrl);
  const localLogo = getFreeCryptoApiLogo(listing.slug);
  const faviconUrl = localLogo || (domain ? `https://icons.duckduckgo.com/ip3/${domain}.ico` : null);
  const initial = (listing.name || 'A').trim().charAt(0).toUpperCase();

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Crypto APIs', item: `${siteUrl}/freeapis` },
      { '@type': 'ListItem', position: 3, name: listing.name, item: canonicalUrl },
    ],
  };

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${canonicalUrl}#software`,
    url: canonicalUrl,
    name: listing.name,
    applicationCategory: listing.categoryLabel || listing.category,
    description: listing.freeTier,
    provider: {
      '@type': 'Organization',
      name: listing.name,
      url: listing.websiteUrl || undefined,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: listing.freeTier,
    },
  };

  const actionUrl = listing.pricingUrl || listing.websiteUrl || 'https://hashtagweb3.com/freeapis';

  return (
    <>
      <JsonLd data={breadcrumbsSchema} />
      <JsonLd data={softwareAppSchema} />

      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <main className="flex-1 pb-16" data-crypto-api-page>
          <article className="site-container py-10 sm:py-14">
            <DetailPageHeader
              breadcrumbs={[
                { href: '/', label: 'Home' },
                { href: '/freeapis', label: 'Crypto APIs' },
              ]}
              icon={
                <div className="flex h-full w-full items-center justify-center rounded-md border border-border/60 bg-muted/40 p-2">
                  {faviconUrl ? (
                    <img
                      src={faviconUrl}
                      alt={`${listing.name} logo`}
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
              title={listing.name}
              subtitle={
                <p className="text-base font-medium text-muted-foreground">
                  {listing.categoryLabel || listing.category} · {listing.freePath === 'ongoing' ? 'Ongoing Free Tier' : listing.freePath === 'keyless' ? 'Keyless Access' : 'Developer Access'}
                </p>
              }
              metadata={
                <>
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Zap className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="font-medium text-foreground break-words">{listing.freeTier}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span>API Key: {listing.keyRequired === 'yes' ? 'Required' : 'Keyless'}</span>
                  </div>
                </>
              }
              actions={
                <DetailPrimaryActionLink href={actionUrl} target="_blank" rel="noopener noreferrer nofollow">
                  Official Docs &amp; Pricing
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </DetailPrimaryActionLink>
              }
            />

            <EventGuideContent
              editorial={eventArticle}
              officialUrl={actionUrl}
              contentMarker="grant"
              unavailableCopy={{
                heading: 'API Details',
                message: `Full endpoint specifications and live status live on ${listing.name}'s official site.`,
                linkLabel: 'View official documentation',
              }}
            />

            <DirectoryDisclaimer
              variant="api"
              entityName={listing.name}
              outboundUrl={actionUrl}
            />

            {relatedApis.length > 0 && (
              <section className="mt-12 space-y-4 border-t pt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Related Free Crypto APIs</h2>
                  <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                    <Link href="/freeapis" prefetch={false} className="flex items-center gap-1">
                      <span>All APIs</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedApis.map((related) => (
                    <FreeCryptoApiCard key={related.slug} listing={related} />
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
