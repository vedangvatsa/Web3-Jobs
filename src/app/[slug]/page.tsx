
import React from 'react';
import { getArticle, getAllArticles } from '@/lib/articles';
import { getNewsFeed } from '@/lib/news';
import { getTerm, getAllTerms } from '@/lib/glossary';
import { getResourceByCanonicalSlug, getAllResourcePages } from '@/lib/pseo';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { classifySlug } from '@/lib/slug-classifier';
import { getCompanyBySlug, getCompanies } from '@/lib/companies';
import { CompanyDetailView } from '@/components/company-detail-view';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import type { Article as ArticleSchema, NewsArticle, ScholarlyArticle, BreadcrumbList, WithContext } from 'schema-dts';
import { ArticleContent } from '@/components/article-content';
import { ArticleImageCaption } from '@/components/article-image-caption';
import { RelatedArticles } from '@/components/related-articles';
import { ResourcePageView } from '@/components/pseo/resource-page-view';
import { Suspense } from 'react';
import { addInternalLinksToContent, generateDefinedTermSchema, generateGlossaryMetaDescription, extractFAQSchema, extractHowToSchema } from '@/lib/seo-utils';
import { GlossaryViewTracker } from '@/components/tracking/glossary-view-tracker';
import { ArticleViewTracker } from '@/components/tracking/article-view-tracker';
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { CtaBanner } from "@/components/cta-banner";
import { getEventSlug, getEventEcosystems, getEventDatePill, formatEventDate, generateGoogleCalendarUrl, formatEventLocation, normalizeCountry } from '@/lib/events';
import { getEventExternalUrl } from '@/lib/event-external-url';
import { getPublicEvent } from '@/lib/event-public';
import { buildGoogleEventSchema } from '@/lib/event-schema';
import { resolveEventGuide } from '@/lib/event-guide-store';
import { buildEventMetaDescription } from '@/lib/event-editorial-facts';
import { hasCuratedEventGuide } from '@/lib/event-page-quality';
import { JsonLd } from '@/components/json-ld';
import { EventHeroImage } from '@/components/event-cover';
import { EventCard } from '@/components/event-card';
import { EventGuideContent } from '@/components/event-guide-content';
import { DetailPageHeader } from '@/components/detail-page-header';
import { EventSideEvents } from '@/components/token2049-side-events';
import { DirectoryDisclaimer } from '@/components/directory-disclaimer';
import { Token2049Details } from '@/components/token2049-details';
import { getEventBySlug, getEvents, getRelatedEvents } from '@/lib/events-server';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  buildSynthesizedJobContent,
  buildUniqueJobMetaDescription,
  getAllJobsWithSlugs,
  getJobBySlug,
  hasSubstantialJobContent,
  resolveJobSlug,
} from '@/lib/job-guides';
import { ensureDescriptionShardLoaded } from '@/lib/job-description-shard-loader';
import { JobDetailView } from '@/components/job-detail-view';
import { FAVICON_FIRST_SLUGS, resolveCompanyLogo, getCompanyFaviconUrl } from '@/lib/company-logo';
import { getCompanySlug } from '@/lib/job-slugs';
import { buildJobOgImageUrl, buildArticleOgImageUrl, buildCompanyOgImageUrl, resolveEventOgImageUrl, eventOgImageMimeType } from '@/lib/job-og';
import { PopupDetailPage } from '@/components/popup-detail-page';
import { getPopupBySlug } from '@/lib/popups';
import { getPopupPath, popupPageMetadata, resolvePopupSlug } from '@/lib/popup-seo';


type ArticlePageProps = {
 params: {
  slug: string;
 };
};

export const dynamicParams = true;
export const revalidate = 3600; // ISR: revalidate every hour

export async function generateStaticParams() {
  const articles = await getAllArticles();
  const resources = getAllResourcePages();
  const events = await getEvents();

  // Pre-render recent articles/news + key resources/events. Jobs and the rest use dynamicParams.
  const topArticles = articles
   .sort((a, b) => new Date(b.publishedDate || 0).getTime() - new Date(a.publishedDate || 0).getTime())
   .slice(0, 80);

  const curatedEvents = events
    .filter(e => e.source === 'curated-premier' || e.source === 'curated-series')
    .slice(0, 15);

  return [
   ...topArticles.map((article) => ({ slug: article.slug })),
   ...resources.slice(0, 10).map((r) => ({ slug: r.seo.canonicalSlug })),
   ...curatedEvents.map((event) => ({ slug: getEventSlug(event) })),
  ];
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const slugType = classifySlug(params.slug);

  if (slugType === 'event') {
    const event = await getEventBySlug(params.slug);
    if (event) {
      const siteUrl = 'https://hashtagweb3.com';
      const eventSlug = getEventSlug(event);
      const canonicalUrl = `${siteUrl}/${eventSlug}`;
      const title = event.name;
      const ogTitle = `${event.name} | Hashtag Web3`;
      const description = buildEventMetaDescription(event, hasCuratedEventGuide(event));
      const ogImageUrl = resolveEventOgImageUrl(event, siteUrl);
      const ogImageType = eventOgImageMimeType(ogImageUrl);
      return {
        title,
        description,
        metadataBase: new URL(siteUrl),
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          type: 'website',
          siteName: 'Hashtag Web3',
          title: ogTitle,
          description,
          url: canonicalUrl,
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: event.name,
              type: ogImageType,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: ogTitle,
          description,
          site: '@hashtag_web3',
          images: [ogImageUrl],
        },
      };
    }
  }

  if (slugType === 'company') {
    const companyMeta = await getCompanyBySlug(params.slug);
    if (companyMeta) {
      const siteUrl = 'https://hashtagweb3.com';
      const canonicalUrl = `${siteUrl}/${companyMeta.slug}`;
      const ogImageUrl = buildCompanyOgImageUrl(companyMeta, siteUrl);
      const rawDesc = companyMeta.description
        || `Browse ${companyMeta.jobCount} open positions at ${companyMeta.name} on Hashtag Web3.`;
      const desc = rawDesc.length > 155 ? rawDesc.slice(0, 152) + '...' : rawDesc;

      return {
        title: `${companyMeta.name} Jobs`,
        description: desc,
        robots: companyMeta.jobCount >= 2
          ? undefined
          : { index: false, follow: true },
        alternates: { canonical: canonicalUrl },
        openGraph: {
          type: 'website',
          title: `${companyMeta.name} Jobs`,
          description: desc,
          url: canonicalUrl,
          images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${companyMeta.name} Jobs` }],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${companyMeta.name} Jobs`,
          description: desc,
          images: [ogImageUrl],
        },
      };
    }
  }

  if (slugType === 'popup') {
    const popupSlug = resolvePopupSlug(params.slug);
    const popupMeta = getPopupBySlug(popupSlug);
    if (popupMeta && params.slug === popupSlug) {
      return popupPageMetadata(popupMeta);
    }
  }

  if (slugType === 'glossary') {
    const term = await getTerm(params.slug);
    if (term) {
      const siteUrl = 'https://hashtagweb3.com';
      const termUrl = `${siteUrl}/${term.slug}`;
      const metaDescription = generateGlossaryMetaDescription(term);
      const ogImageUrl = `${siteUrl}/og-image.png`;
      
      return {
        title: `${term.term} - Web3 Glossary`,
        description: metaDescription,
        keywords: [term.term, ...(term.synonyms || []), term.category, 'web3', 'crypto', 'blockchain', 'glossary'],
        alternates: {
          canonical: termUrl,
        },
        openGraph: {
          title: `${term.term} - Web3 Glossary`,
          description: metaDescription,
          url: termUrl,
          type: 'article',
          images: [{ url: ogImageUrl, width: 1200, height: 630, alt: term.term }],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${term.term} - Web3 Glossary`,
          description: metaDescription,
          images: [ogImageUrl],
        },
      };
    }
  }

  if (slugType === 'resource') {
    const resource = getResourceByCanonicalSlug(params.slug);
    if (resource) {
      const siteUrl = 'https://hashtagweb3.com';
      const resourceUrl = `${siteUrl}/${resource.seo.canonicalSlug}`;
      const ogImageUrl = `${siteUrl}/og-image.png`;
      return {
        title: resource.seo.title,
        description: resource.seo.description,
        keywords: resource.seo.keywords,
        alternates: { canonical: resourceUrl },
        openGraph: {
          title: resource.seo.title,
          description: resource.seo.description,
          type: 'article',
          url: resourceUrl,
          images: [{ url: ogImageUrl, width: 1200, height: 630, alt: resource.seo.title }],
        },
        twitter: {
          card: 'summary_large_image',
          title: resource.seo.title,
          description: resource.seo.description,
          images: [ogImageUrl],
        },
      };
    }
  }

  if (slugType === 'article') {
    const article = await getArticle(params.slug);
    if (article) {
      const siteUrl = 'https://hashtagweb3.com';
      const articleUrl = `${siteUrl}/${article.slug}`;
      const ogImageUrl = buildArticleOgImageUrl(article, siteUrl);

      const keywords = [
        'web3', 'crypto', 'blockchain',
        article.title,
        article.category,
        ...(article['data-ai-hint'] ? [article['data-ai-hint']] : []),
      ].filter((v, i, a) => a.indexOf(v) === i);

      const truncatedTitle = article.title.length > 44 ? article.title.slice(0, 41) + '...' : article.title;
      const truncatedDescription = article.description.length > 155 ? article.description.slice(0, 152) + '...' : article.description;

      return {
        title: truncatedTitle,
        description: truncatedDescription,
        keywords: keywords,
        alternates: {
          canonical: articleUrl,
        },
        openGraph: {
          title: article.title,
          description: article.description,
          type: 'article',
          url: articleUrl,
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: `${article.title} - Hashtag Web3`,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: article.title,
          description: article.description,
          images: [ogImageUrl],
        },
      };
    }
  }

  if (slugType === 'job') {
    const jobResolution = await resolveJobSlug(params.slug);
    const jobMeta = jobResolution.job;
    if (jobMeta) {
      await ensureDescriptionShardLoaded(jobMeta);
      const siteUrl = 'https://hashtagweb3.com';
      const canonicalSlug = jobResolution.canonicalSlug || jobMeta.slug || params.slug;
      const canonicalUrl = `${siteUrl}/${canonicalSlug}`;
      const title = `${jobMeta.title} at ${jobMeta.company}`;
      const description = buildUniqueJobMetaDescription(jobMeta);
      const ogImageUrl = buildJobOgImageUrl(
        { ...jobMeta, slug: canonicalSlug },
        siteUrl,
      );
      const hasVerifiedContent = hasSubstantialJobContent(jobMeta);
      return {
        title,
        description,
        metadataBase: new URL(siteUrl),
        alternates: { canonical: canonicalUrl },
        robots: hasVerifiedContent ? { index: true, follow: true } : { index: false, follow: true },
        openGraph: {
          title,
          description,
          url: canonicalUrl,
          type: 'website',
          siteName: 'Hashtag Web3',
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: title,
              type: 'image/png',
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          site: '@hashtag_web3',
          creator: '@hashtag_web3',
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: `${title} - Hashtag Web3`,
            },
          ],
        },
      };
    }
  }

  // Final fallback
  if (params.slug.includes('.')) {
    notFound();
  }

  const articleFallback = await getArticle(params.slug);
  if (articleFallback) {
    const siteUrl = 'https://hashtagweb3.com';
    const articleUrl = `${siteUrl}/${articleFallback.slug}`;
    const ogImageUrl = buildArticleOgImageUrl(articleFallback, siteUrl);
    return {
      title: articleFallback.title,
      description: articleFallback.description,
      alternates: { canonical: articleUrl },
      openGraph: {
        title: articleFallback.title,
        description: articleFallback.description,
        url: articleUrl,
        images: [{ url: ogImageUrl }],
      },
    };
  }

  const popupFallback = getPopupBySlug(resolvePopupSlug(params.slug));
  if (popupFallback) {
    return popupPageMetadata(popupFallback);
  }

  notFound();
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const slugType = classifySlug(params.slug);

  if (slugType === 'company') {
    const companyPage = await getCompanyBySlug(params.slug);
    if (!companyPage) notFound();
    if (params.slug !== companyPage.slug) {
      redirect(`/${companyPage.slug}`);
    }
    return <CompanyDetailView slug={companyPage.slug} />;
  }

  if (slugType === 'job') {
    const resolved = await resolveJobSlug(params.slug);
    const job = resolved.job ?? null;
    if (!job) notFound();

    const canonicalSlug = resolved.canonicalSlug || job.slug;
    if (canonicalSlug && canonicalSlug.toLowerCase() !== params.slug.toLowerCase()) {
      permanentRedirect(`/${canonicalSlug}`);
    }
    const siteUrl = 'https://hashtagweb3.com';
    await ensureDescriptionShardLoaded(job);
    const companySlug = getCompanySlug(job.company);
    const company = await getCompanyBySlug(companySlug);
    const contentHtml = buildSynthesizedJobContent(job);
    const rawLogoFile = resolveCompanyLogo(companySlug);
    const rawFavicon = getCompanyFaviconUrl(company?.website);
    const preferFavicon = FAVICON_FIRST_SLUGS.has(companySlug) && !!rawFavicon;
    const logoSrc = preferFavicon ? rawFavicon : rawLogoFile;
    const faviconUrl = preferFavicon ? rawLogoFile : rawFavicon;
    return <JobDetailView job={job} contentHtml={contentHtml} company={company} siteUrl={siteUrl} logoSrc={logoSrc} faviconUrl={faviconUrl} />;
  }

  if (slugType === 'popup') {
    const popupSlug = resolvePopupSlug(params.slug);
    const popup = getPopupBySlug(popupSlug);
    if (!popup) notFound();
    if (params.slug !== popup.slug) {
      permanentRedirect(getPopupPath(popup.slug));
    }
    return <PopupDetailPage popup={popup} />;
  }

  // Event page
  if (slugType === 'event') {
    const event = await getEventBySlug(params.slug);
    if (!event) notFound();
    const siteUrl = 'https://hashtagweb3.com';
    const eventSlug = getEventSlug(event);
    const isToken2049Page = eventSlug === 'token2049';
    if (params.slug !== eventSlug) {
      permanentRedirect(`/${eventSlug}`);
    }
    const editorial = await resolveEventGuide(event);
    const speakerSummary = event.speakerDetails?.length
      ? event.speakerDetails
          .map((speaker) => {
            const detail = speaker.organization || speaker.title;
            return detail ? `${speaker.name} (${detail})` : speaker.name;
          })
          .join(', ')
      : editorial.speakers || event.speakers?.join(', ');
    const speakerFact = event.speakerDetails?.length
      ? `${event.speakerDetails.length} speaker${event.speakerDetails.length === 1 ? '' : 's'} listed`
      : editorial.speakers
        ? editorial.speakers
        : event.speakers?.length
          ? `${event.speakers.length} speaker${event.speakers.length === 1 ? '' : 's'} announced`
          : undefined;
    const ticketPricing = editorial.ticketPricing;
    const expectedAttendance = editorial.expectedAttendance;
    const eventExternalUrl = getEventExternalUrl(event);
    const partnerOfferUrl = event.partnerOffer?.url
      ? getEventExternalUrl({ registrationUrl: event.partnerOffer.url, website: undefined, url: '' })
      : undefined;
    const googleCalendarUrl = generateGoogleCalendarUrl(event, eventExternalUrl);
    const allEvents = await getEvents();
    const relatedEvents = (await getRelatedEvents(event, 3, allEvents)).map(getPublicEvent);
    const sideEvents = allEvents
      .filter((sideEvent) => sideEvent.sideEventFor?.includes(eventSlug))
      .map(getPublicEvent);
    const eventTimeZone = eventSlug === 'token2049' ? 'Asia/Singapore'
      : eventSlug === 'kbw' ? 'Asia/Seoul'
      : eventSlug === 'ibw' || eventSlug === 'devcon' ? 'Asia/Kolkata'
      : 'UTC';

    const eventPageUrl = `${siteUrl}/${eventSlug}`;
    const eventImageUrl = resolveEventOgImageUrl(event, siteUrl);
    const eventSchema = buildGoogleEventSchema(event, {
      pageUrl: eventPageUrl,
      imageUrl: eventImageUrl,
    });

    // Schema.org Breadcrumbs
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Events', item: `${siteUrl}/events` },
        { '@type': 'ListItem', position: 3, name: event.name, item: `${siteUrl}/${eventSlug}` },
      ],
    };

    return (
      <>
        {eventSchema && <JsonLd data={eventSchema} />}
        <JsonLd data={breadcrumbSchema} />

        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <main className="flex-1 pb-16" data-event-page>
            <article className="site-container py-10 sm:py-14">
              <DetailPageHeader
                breadcrumbs={[{ href: '/', label: 'Home' }, { href: '/events', label: 'Events' }]}
                icon={
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-md border border-border/60 bg-muted/40 text-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="mt-1 text-[10px] font-bold uppercase leading-none text-primary">
                      {getEventDatePill(event.startDate).month}
                    </span>
                    <span className="mt-0.5 text-base font-extrabold leading-none text-foreground">
                      {getEventDatePill(event.startDate).day}
                    </span>
                  </div>
                }
                title={event.name}
                metadata={
                  <>
                      <div className="flex min-w-0 items-center gap-1.5">
                        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="break-words">
                          {event.city && event.country
                            ? `${event.city}, ${normalizeCountry(event.country)}`
                            : formatEventLocation(event)}
                        </span>
                      </div>
                  </>
                }
                actions={
                  <>
                    {eventExternalUrl && (
                      <Button asChild className="flex-1 gap-2 whitespace-nowrap sm:flex-none">
                        <a href={eventExternalUrl} target="_blank" rel="noopener noreferrer nofollow" className="whitespace-nowrap">
                          <span>Details</span>
                          <ExternalLink className="h-4 w-4 shrink-0" />
                        </a>
                      </Button>
                    )}
                    <Button asChild variant="outline" className="flex-1 gap-2 whitespace-nowrap sm:flex-none">
                      <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap">
                        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="whitespace-nowrap">Add to Calendar</span>
                      </a>
                    </Button>
                  </>
                }
              />

              <EventHeroImage src={event.coverImage} name={event.name} />

              {/* Quick Facts Grid */}
              {(event.partnerOffer || ticketPricing || expectedAttendance || speakerFact) && (
                <div className="mt-8 grid gap-4 rounded-lg bg-muted/30 p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  {event.partnerOffer && (
                    <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                      <span className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">Community offer</span>
                      {partnerOfferUrl ? (
                        <a href={partnerOfferUrl} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-foreground text-sm underline underline-offset-4">
                          {event.partnerOffer.text}
                        </a>
                      ) : (
                        <span className="font-semibold text-foreground text-sm">{event.partnerOffer.text}</span>
                      )}
                    </div>
                  )}
                  {ticketPricing && (
                    <div className="space-y-1 break-words">
                      <span className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">Ticket Pricing</span>
                      <span className="font-semibold text-foreground text-sm">{ticketPricing}</span>
                    </div>
                  )}
                  {speakerFact && (
                    <div className="space-y-1 break-words">
                      <span className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">Speakers</span>
                      <span className="font-semibold text-foreground text-sm">{speakerFact}</span>
                    </div>
                  )}
                  {expectedAttendance && (
                    <div className="space-y-1 break-words">
                      <span className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">Expected Attendance</span>
                      <span className="font-semibold text-foreground text-sm">{expectedAttendance}</span>
                    </div>
                  )}
                </div>
              )}

              {!isToken2049Page && (
                <EventGuideContent
                  editorial={editorial}
                  speakerSummary={speakerSummary}
                />
              )}

              {isToken2049Page && <Token2049Details speakers={event.speakerDetails || []} />}

              {sideEvents.length > 0 && <EventSideEvents eventName={event.name} events={sideEvents} timeZone={eventTimeZone} />}
              <DirectoryDisclaimer />

              {/* Related Events Section */}
              {relatedEvents.length > 0 && (
                <section className="mt-12 space-y-4 border-t pt-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Related Upcoming Events</h2>
                    <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                      <Link href="/events" className="flex items-center gap-1">
                        <span>All Events</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedEvents.map((relEvent) => (
                      <EventCard key={relEvent.id} event={relEvent} />
                    ))}
                  </div>
                </section>
              )}

              {/* Community CTA */}
              <div className="mt-12 flex justify-center border-t pt-8">
                <Button asChild size="lg">
                  <a href="https://t.me/hashtagweb3" target="_blank" rel="noopener noreferrer">
                    Join Our Builder Community <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </article>
          </main>
        </div>
      </>
    );
  }

  // Resource page
  if (slugType === 'resource') {
    const resource = getResourceByCanonicalSlug(params.slug);
    if (!resource) notFound();
    const siteUrl = 'https://hashtagweb3.com';
    const pageUrl = `${siteUrl}/${resource.seo.canonicalSlug}`;
    const articleSchema: WithContext<ArticleSchema> = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: resource.seo.title,
      description: resource.seo.description,
      url: pageUrl,
      datePublished: resource.meta.generatedAt,
      dateModified: resource.meta.generatedAt,
      author: { '@type': 'Organization', name: 'Hashtag Web3', url: siteUrl },
      publisher: {
        '@type': 'Organization',
        name: 'Hashtag Web3',
        url: siteUrl,
        logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
      keywords: resource.seo.keywords.join(', '),
    };
    const breadcrumbSchema: WithContext<BreadcrumbList> = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Resources', item: `${siteUrl}/resources` },
        { '@type': 'ListItem', position: 3, name: resource.seo.title, item: pageUrl },
      ],
    };
    const nicheResources = getAllResourcePages().filter(
      (p) => p.meta.niche === resource.meta.niche && p.seo.canonicalSlug !== resource.seo.canonicalSlug
    );
    return (
      <>
        <JsonLd data={articleSchema} />
        <JsonLd data={breadcrumbSchema} />
        <ResourcePageView page={resource} nicheResources={nicheResources} />
      </>
    );
  }

  // Glossary term
  if (slugType === 'glossary') {
    const term = await getTerm(params.slug);
    if (!term) notFound();
    const siteUrl = 'https://hashtagweb3.com';
    const allTerms = await getAllTerms();
    const relatedTermsData = term.relatedTerms
      .map(relatedSlug => allTerms.find(t => t.slug === relatedSlug || t.term === relatedSlug))
      .filter((t): t is NonNullable<typeof t> => t != null);
    
    // Add internal links to content for related terms
    const enhancedContent = addInternalLinksToContent(term.content, term, allTerms);
    
    const definedTermSchema = generateDefinedTermSchema(term, siteUrl, relatedTermsData);
    
    const breadcrumbSchema: WithContext<BreadcrumbList> = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Glossary',
          item: `${siteUrl}/glossary`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: term.term,
          item: `${siteUrl}/${term.slug}`,
        },
      ],
    };
    
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <GlossaryViewTracker term={term.term} category={term.category} difficulty={term.difficulty} />
        <JsonLd data={definedTermSchema} />
        <JsonLd data={breadcrumbSchema} />
        <main className="flex-1">
          <div className="bg-background">
            <article className="max-w-4xl mx-auto w-full px-4 page-section">
              <header className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Link href="/glossary" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Web3 Glossary
                  </Link>
                </div>
                <PageHeader title={term.term} align="left" className="mb-0" />
                <p className="text-xl text-muted-foreground mb-4">
                  {term.description}
                </p>
              </header>
              
              {term.image && (
                <div className="relative w-full aspect-[21/9] overflow-hidden rounded-lg mb-8">
                  <Image
                    src={term.image}
                    alt={term.imageAlt || term.term}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 900px"
                    priority
                  />
                </div>
              )}
              
              <div 
                className="prose prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-a:underline"
                dangerouslySetInnerHTML={{ __html: enhancedContent }}
              />
            </article>
          </div>
        </main>
      </div>
    );
  }

  // Article or fallback
  if (params.slug.includes('.')) {
    notFound();
  }

  let article = await getArticle(params.slug);
  if (!article) {
    const popup = getPopupBySlug(resolvePopupSlug(params.slug));
    if (popup) {
      return <PopupDetailPage popup={popup} />;
    }
    notFound();
  }
  const allArticles = await getAllArticles();
 
 const siteUrl = 'https://hashtagweb3.com';
 const imageUrl = article.image.startsWith('http') ? article.image : `${siteUrl}${article.image}`;

  const scholarlyCategories = ["AI & The Future of Work","Web3 Career Guides"];
  const isScholarly = scholarlyCategories.includes(article.category);
  const isNews = article.category === 'News';
  const newsItems = isNews ? await getNewsFeed() : undefined;

 const faqSchema = article.rawContent ? extractFAQSchema(article.rawContent) : null;
 const howToSchema = article.rawContent ? extractHowToSchema(article.rawContent, article.title, article.description) : null;

  const articleUrl = `${siteUrl}/${article.slug}`;
  const articleSchema: WithContext<ArticleSchema | NewsArticle | ScholarlyArticle> = {
   '@context': 'https://schema.org',
   '@type': isNews ? 'NewsArticle' : isScholarly ? 'ScholarlyArticle' : 'Article',
   headline: article.title,
   description: article.description,
   image: imageUrl,
   datePublished: article.publishedDate,
   dateModified: article.lastUpdated || article.publishedDate,
   url: articleUrl,
   articleSection: article.category,
   inLanguage: 'en',
   isAccessibleForFree: true,
   keywords: [article.category, article['data-ai-hint'], 'Web3', 'crypto', 'blockchain'].filter(Boolean).join(', '),
   author: {
    '@type': 'Organization',
    name: 'Hashtag Web3',
    url: siteUrl,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Hashtag Web3',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`
    }
  },
   mainEntityOfPage: {
     '@type': 'WebPage',
     '@id': articleUrl
   }
 };

 const breadcrumbSchema: WithContext<BreadcrumbList> = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
   {
    '@type': 'ListItem',
    position: 1,
    name: 'Home',
    item: siteUrl,
   },
   {
    '@type': 'ListItem',
    position: 2,
     name: isNews ? 'News' : 'Blog',
     item: `${siteUrl}/${isNews ? 'news' : 'blog'}`,
   },
   {
    '@type': 'ListItem',
    position: 3,
    name: article.title,
     item: articleUrl,
   },
  ],
 };

 return (
    <div className="flex flex-col min-h-screen bg-background">
      <ArticleViewTracker slug={article.slug} title={article.title} category={article.category} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {howToSchema && <JsonLd data={howToSchema} />}
      <main className="flex-1">
        <PageShell>
          <article className="w-full">
            <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading article...</div>}>
              {/* Header: title and subtitle */}
               <header className="mb-10 text-center">
                 <h1 className="mx-auto max-w-5xl text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.2] text-balance break-normal mb-4">
                   {article.title}
                 </h1>

                 {article.description && (
                   <p className="mx-auto max-w-4xl text-base sm:text-lg text-muted-foreground leading-relaxed mt-3">
                     {article.description}
                   </p>
                )}
              </header>

              {/* Featured Image. SVG heroes (data charts) must not be cropped:
                  object-cover would slice their edges, so they render
                  contained on a muted backdrop instead. */}
              {/* Featured Image - render if explicitly defined in frontmatter */}
              {article.image && !article.image.includes('picsum.photos') && !article.image.includes('/api/og?') && (
                <>
                  <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] max-h-[380px] overflow-hidden rounded-xl border border-border/70 shadow-none mb-2 bg-muted/30">
                    <Image
                      src={article.image}
                      alt={`${article.title} - Hashtag Web3 article cover`}
                      fill
                       className={article.imageFit === 'contain' || article.image.toLowerCase().endsWith('.svg') ? 'object-contain p-4' : 'object-cover'}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 800px, 900px"
                      priority
                      data-ai-hint={`${article['data-ai-hint'] || ''}`}
                    />
                  </div>
                  {(article.imageCaption || article.imageCreditUrl) ? (
                    <ArticleImageCaption
                      caption={article.imageCaption}
                      creditUrl={article.imageCreditUrl}
                    />
                  ) : (
                    <div className="mb-8" />
                  )}
                </>
              )}

              {/* Prose Content */}
              <ArticleContent content={article.content} tweetEmbeds={article.tweetEmbeds} className="mb-12" />

              {/* In-article CTA */}
            <CtaBanner
              variant={isNews ? 'news' : 'jobs'}
              title={isNews ? undefined : 'Looking for a Web3 Job?'}
              description={isNews ? undefined : 'Explore thousands of verified blockchain, DeFi, and crypto roles on the #1 Web3 job board.'}
              className="my-12"
            />
            </Suspense>
          </article>

          {/* Related Articles with symmetrical grid */}
          <Suspense fallback={null}>
            <RelatedArticles
              allArticles={allArticles}
               currentCategory={article.category}
               currentSlug={article.slug}
               newsItems={newsItems}
             />
          </Suspense>
        </PageShell>
      </main>
    </div>
  );
}
