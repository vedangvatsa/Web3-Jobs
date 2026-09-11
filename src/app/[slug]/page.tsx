
import { getArticle, getAllArticles } from '@/lib/articles';
import { getTerm, getAllTerms } from '@/lib/glossary';
import { getResourceByCanonicalSlug, getAllResourcePages } from '@/lib/pseo';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import * as fs from 'fs';
import * as path from 'path';
import { getCompanyBySlug, getCompanies } from '@/lib/companies';
import { CompanyDetailView } from '@/components/company-detail-view';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import type { Article as ArticleSchema, ScholarlyArticle, BreadcrumbList, Event as SchemaEvent, WithContext } from 'schema-dts';
import { ArticleContent } from '@/components/article-content';
import { RelatedArticles } from '@/components/related-articles';
import { ResourcePageView } from '@/components/pseo/resource-page-view';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { addInternalLinksToContent, generateDefinedTermSchema, generateGlossaryMetaDescription, extractFAQSchema, extractHowToSchema } from '@/lib/seo-utils';
import { GlossaryViewTracker } from '@/components/tracking/glossary-view-tracker';
import { ArticleViewTracker } from '@/components/tracking/article-view-tracker';
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import { CtaBanner } from "@/components/cta-banner";
import { getEventSlug, getEventFormat, getEventEcosystems, getEventDatePill, formatEventDate, generateGoogleCalendarUrl } from '@/lib/events';
import { resolveEventGuide } from '@/lib/event-guide-store';
import { JsonLd } from '@/components/json-ld';
import { EventHeroImage } from '@/components/event-cover';
import { EventCard } from '@/components/event-card';
import { EventGuideContent } from '@/components/event-guide-content';
import { DetailPageHeader } from '@/components/detail-page-header';
import { getEventBySlug, getEvents, getRelatedEvents } from '@/lib/events-server';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  buildSynthesizedJobContent,
  buildUniqueJobMetaDescription,
  getAllJobsWithSlugs,
  getJobBySlug,
  getOrFetchRawJobContent,
  hasSubstantialJobContent,
  resolveJobSlug,
} from '@/lib/job-guides';
import { JobDetailView } from '@/components/job-detail-view';
import { resolveCompanyLogo, getCompanyFaviconUrl } from '@/lib/company-logo';
import { getCompanySlug } from '@/lib/job-slugs';
import { buildJobOgImageUrl } from '@/lib/job-og';


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

  // Pre-render top 20 most recent articles + key resources. All other pages use ISR dynamically on first request.
  const topArticles = articles
   .sort((a, b) => new Date(b.publishedDate || 0).getTime() - new Date(a.publishedDate || 0).getTime())
   .slice(0, 20);

  const curatedEvents = events.filter(e => e.source === 'curated-premier').slice(0, 10);

  return [
   ...topArticles.map((article) => ({ slug: article.slug })),
   ...resources.slice(0, 10).map((r) => ({ slug: r.seo.canonicalSlug })),
   ...curatedEvents.map((event) => ({ slug: getEventSlug(event) })),
  ];
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const currentEvent = await getEventBySlug(params.slug);

  if (!currentEvent) {
  // Check if it's a job first (root-level: /trader, /bd).
  // resolveJobSlug also finds retitled postings via the slug archive, so
  // metadata always describes the live canonical (redirects supersede it).
  const jobMeta = (await resolveJobSlug(params.slug)).job;
  if (jobMeta) {
    const siteUrl = 'https://hashtagweb3.com';
    const { getJobSlug } = await import('@/lib/job-slugs');
    const slug = getJobSlug(jobMeta);
    const canonicalUrl = `${siteUrl}/${slug}`;
    const title = `${jobMeta.title} at ${jobMeta.company}`;
    const description = buildUniqueJobMetaDescription(jobMeta);
    const ogImageUrl = buildJobOgImageUrl(jobMeta, siteUrl);
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

  // Check if it's a company page
  const companyMeta = await getCompanyBySlug(params.slug);
  if (companyMeta) {
    const siteUrl = 'https://hashtagweb3.com';
    const canonicalUrl = `${siteUrl}/${companyMeta.slug}`;
    const ogImageUrl = `${siteUrl}/api/og?type=company&title=${encodeURIComponent(companyMeta.name)}&count=${companyMeta.jobCount}`;
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

  // Check if it's a glossary term first
  const term = await getTerm(params.slug);
  if (term) {
    const siteUrl = 'https://hashtagweb3.com';
    const termUrl = `${siteUrl}/${term.slug}`;
    const metaDescription = generateGlossaryMetaDescription(term);
    const ogImageUrl = `${siteUrl}/api/og?type=article&title=${encodeURIComponent(term.term)}&category=${encodeURIComponent(term.category)}`;
    
    return {
      title: `${term.term} - Web3 Glossary`,
      description: metaDescription,
      keywords: [term.term, ...term.synonyms || [], term.category, 'web3', 'crypto', 'blockchain', 'glossary'],
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

  // Check if it's an event page
  const event = currentEvent;
  if (event) {
    const siteUrl = 'https://hashtagweb3.com';
    const eventSlug = getEventSlug(event);
    const canonicalUrl = `${siteUrl}/${eventSlug}`;
    const formattedDate = formatEventDate(event.startDate, event.endDate);
    const ecosystems = getEventEcosystems(event);
    const ecoText = ecosystems.length > 0 ? ` (${ecosystems.join(', ')})` : '';

    const title = `${event.name} - Dates, Venue & Registration`;
    const ogTitle = title;
    const description = `${event.name} scheduled for ${formattedDate} in ${event.location}. Explore event agenda${ecoText}, venue guide, and official registration links.`;

    const ogImageUrl = event.coverImage || `${siteUrl}/api/og?type=default&title=${encodeURIComponent(event.name)}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: 'website',
        title: ogTitle,
        description,
        url: canonicalUrl,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: event.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description,
        images: [ogImageUrl],
      },
    };
  }

  // Check if it's a resource page
  const resource = getResourceByCanonicalSlug(params.slug);
  if (resource) {
    const siteUrl = 'https://hashtagweb3.com';
    const resourceUrl = `${siteUrl}/${resource.seo.canonicalSlug}`;
    const ogImageUrl = `${siteUrl}/api/og?type=article&title=${encodeURIComponent(resource.seo.title)}&category=${encodeURIComponent(resource.meta.contentType)}`;
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

  if (params.slug.includes('.')) {
    notFound();
  }

  // Fall back to article
 const article = await getArticle(params.slug);
 if (!article) {
  notFound();
 }

 const siteUrl = 'https://hashtagweb3.com';
 const articleUrl = `${siteUrl}/${article.slug}`;

 // Extract salary data from title if present
 const salaryMatch = article.title.match(/\$[\d,]+-\$[\d,]+K?/);
 const salary = salaryMatch ? salaryMatch[0] : undefined;
 
 // Generate dynamic OG image URL
 const ogImageUrl = `${siteUrl}/api/og?type=article&title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(article.category)}${salary ? `&salary=${encodeURIComponent(salary)}` : ''}&date=2026`;

 const keywords = [
  'web3', 'crypto', 'blockchain',
  article.title,
  article.category,
  ...(article['data-ai-hint'] ? [article['data-ai-hint']] : [])
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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
  // Check if it's a job (root-level: /trader, /bd).
  // Retired slugs whose posting is still live elsewhere 308 to the live
  // canonical instead of serving stale copies or 404ing.
  const resolved = await resolveJobSlug(params.slug);
  if (resolved.kind === 'moved' && resolved.canonicalSlug) {
    permanentRedirect(`/${resolved.canonicalSlug}`);
  }
  const job = resolved.job;
  if (job) {
    const siteUrl = 'https://hashtagweb3.com';
    const companySlug = getCompanySlug(job.company);
    const company = await getCompanyBySlug(companySlug);
    const rawContent = await getOrFetchRawJobContent(job);
    const contentHtml = buildSynthesizedJobContent(job, rawContent);
    const logoSrc = resolveCompanyLogo(companySlug);
    const faviconUrl = getCompanyFaviconUrl(company?.website);
    return <JobDetailView job={job} contentHtml={contentHtml} company={company} siteUrl={siteUrl} logoSrc={logoSrc} faviconUrl={faviconUrl} />;
  }

  // Check if it's a company page first
  const companyPage = await getCompanyBySlug(params.slug);
  if (companyPage) {
    if (params.slug !== companyPage.slug) {
      redirect(`/${companyPage.slug}`);
    }
    return <CompanyDetailView slug={companyPage.slug} />;
  }
  }

  // Check if it's an event page
  if (event) {
    const siteUrl = 'https://hashtagweb3.com';
    const eventSlug = getEventSlug(event);
    if (params.slug !== eventSlug) {
      permanentRedirect(`/${eventSlug}`);
    }
    const format = getEventFormat(event);
    const ecosystems = getEventEcosystems(event);
    const editorial = await resolveEventGuide(event);
    const speakerSummary = event.speakers?.join(', ');
    const googleCalendarUrl = generateGoogleCalendarUrl(event);
    const relatedEvents = await getRelatedEvents(event, 3);

    // Schema.org Event
    const isOnline = format === 'online' || event.location.toLowerCase().includes('online');

    const eventSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.name,
      description: event.description || editorial.summaryLead,
      startDate: event.startDate,
      endDate: event.endDate || event.startDate,
      eventAttendanceMode: isOnline
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': isOnline ? 'VirtualLocation' : 'Place',
        name: event.location,
        ...(isOnline
          ? { url: event.url }
          : {
              address: {
                '@type': 'PostalAddress',
                addressLocality: event.city || event.location,
                addressCountry: event.country || '',
              },
            }),
      },
      // NOTE: no organizer/performer/offers: Web3Event has no verified
      // organizer, lineup, or ticket price — emitting invented values is
      // spam-risk structured data.
      url: event.url || `${siteUrl}/${eventSlug}`,
      image: event.coverImage || `${siteUrl}/api/og?type=default&title=${encodeURIComponent(event.name)}`,
    };

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
        <JsonLd data={eventSchema} />
        <JsonLd data={breadcrumbSchema} />

        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <main className="flex-1 pb-16">
            <article className="site-container px-4 py-10 sm:py-14">
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
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="break-words">{event.location}</span>
                      </div>
                  </>
                }
                actions={
                  <>
                    <Button asChild className="flex-1 gap-2 sm:flex-none">
                      <a href={event.url} target="_blank" rel="noopener noreferrer nofollow">
                        <span>Details</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 gap-2 sm:flex-none">
                      <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Add to Calendar</span>
                      </a>
                    </Button>
                  </>
                }
              />

              <div className="mt-8">
                <EventHeroImage src={event.coverImage} name={event.name} />
              </div>

              {/* Quick Facts Grid */}
              {(event.partnerOffer || editorial.ticketPricing || editorial.expectedAttendance || speakerSummary) && (
                <div className="mt-8 grid gap-4 rounded-lg bg-muted/30 p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  {event.partnerOffer && (
                    <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                      <span className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">Community offer</span>
                      {event.partnerOffer.url ? (
                        <a href={event.partnerOffer.url} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-foreground text-sm underline underline-offset-4">
                          {event.partnerOffer.text}
                        </a>
                      ) : (
                        <span className="font-semibold text-foreground text-sm">{event.partnerOffer.text}</span>
                      )}
                    </div>
                  )}
                  {editorial.ticketPricing && (
                    <div className="space-y-1 break-words">
                      <span className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">Ticket Pricing</span>
                      <span className="font-semibold text-foreground text-sm">{editorial.ticketPricing}</span>
                    </div>
                  )}
                  {speakerSummary && (
                    <div className="space-y-1 break-words">
                      <span className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">Speakers</span>
                      <span className="font-semibold text-foreground text-sm">{speakerSummary}</span>
                    </div>
                  )}
                  {editorial.expectedAttendance && (
                    <div className="space-y-1 break-words">
                      <span className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">Expected Attendance</span>
                      <span className="font-semibold text-foreground text-sm">{editorial.expectedAttendance}</span>
                    </div>
                  )}
                </div>
              )}

              <EventGuideContent
                editorial={editorial}
                speakerSummary={speakerSummary}
                eventUrl={event.url}
              />

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

 // Check if it's a resource page first
 const resource = getResourceByCanonicalSlug(params.slug);
 if (resource) {
  // Warn if multiple content types match the same slug
  const termCollision = await getTerm(params.slug);
  const articleCollision = await getArticle(params.slug);
  if (termCollision || articleCollision) {
   console.warn(`[slug collision]"${params.slug}" resolved as resource, but also matches: ${[termCollision ? 'glossary term' : '', articleCollision ? 'article' : ''].filter(Boolean).join(', ')}`);
  }
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


  // Check if it's a glossary term
  const term = await getTerm(params.slug);
  if (term) {
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
 
 // Fall back to article
 const article = await getArticle(params.slug);
 const allArticles = await getAllArticles();

 if (!article) {
  notFound();
 }
 
 const siteUrl = 'https://hashtagweb3.com';
 const imageUrl = article.image.startsWith('http') ? article.image : `${siteUrl}${article.image}`;

 const scholarlyCategories = ["AI & The Future of Work","Web3 Career Guides"];
 const isScholarly = scholarlyCategories.includes(article.category);

 const faqSchema = article.rawContent ? extractFAQSchema(article.rawContent) : null;
 const howToSchema = article.rawContent ? extractHowToSchema(article.rawContent, article.title, article.description) : null;

 const articleSchema: WithContext<ArticleSchema | ScholarlyArticle> = {
  '@context': 'https://schema.org',
  '@type': isScholarly ? 'ScholarlyArticle' : 'Article',
  headline: article.title,
  description: article.description,
  image: imageUrl,
  datePublished: article.publishedDate,
  dateModified: article.lastUpdated || article.publishedDate,
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
    '@id': `${siteUrl}/${article.slug}`
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
    name: 'Blog',
    item: `${siteUrl}/blog`,
   },
   {
    '@type': 'ListItem',
    position: 3,
    name: article.title,
    item: `${siteUrl}/${article.slug}`,
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
          <article className="max-w-4xl mx-auto w-full">
            <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading article...</div>}>
              {/* Header: title and subtitle */}
              <header className="mb-10 text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.2] text-balance break-normal mb-4">
                  {article.title}
                </h1>

                {article.description && (
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mt-3">
                    {article.description}
                  </p>
                )}
              </header>

              {/* Featured Image. SVG heroes (data charts) must not be cropped:
                  object-cover would slice their edges, so they render
                  contained on a muted backdrop instead. */}
              {/* Featured Image - render if explicitly defined in frontmatter */}
              {article.image && !article.image.includes('picsum.photos') && !article.image.includes('/api/og?') && (
                <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] max-h-[380px] overflow-hidden rounded-xl border border-border/70 shadow-none mb-10 bg-muted/30">
                  <Image
                    src={article.image}
                    alt={`${article.title} - Hashtag Web3 article cover`}
                    fill
                    className={article.image.toLowerCase().endsWith('.svg') ? 'object-contain p-4' : 'object-cover'}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 800px, 900px"
                    priority
                    data-ai-hint={`${article['data-ai-hint'] || ''}`}
                  />
                </div>
              )}

              {/* Prose Content */}
              <ArticleContent content={article.content} className="mb-12" />

              {/* In-article CTA */}
              <CtaBanner
                variant="jobs"
                title="Looking for a Web3 Job?"
                description="Explore thousands of verified blockchain, DeFi, and crypto roles on the #1 Web3 job board."
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
            />
          </Suspense>
        </PageShell>
      </main>
    </div>
  );
}
