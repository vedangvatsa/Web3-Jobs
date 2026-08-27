import { EventsBoard } from '@/components/events-board';
import { getEvents } from '@/lib/events-server';
import type { Web3Event } from '@/lib/events';
import type { Metadata } from 'next';
import { PageHeader } from "@/components/page-header";
import { PageShell } from '@/components/page-shell';
import { EventPartners } from '@/components/event-partners';
import { SITE_STATS } from '@/lib/constants';
import Link from 'next/link';
import { Rss } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Web3 Events Calendar 2026 | Crypto Conferences & Meetups',
  description: 'Discover the top Web3 events, crypto conferences, blockchain summits, and virtual meetups. Stay updated with the latest in DeFi, DAOs, and crypto networking.',
  alternates: {
    canonical: 'https://hashtagweb3.com/events',
  },
  openGraph: {
    type: 'website',
    title: 'Web3 Events Calendar 2026 | Crypto Conferences & Meetups',
    description: 'Browse 3,000+ upcoming Web3 events, crypto conferences, blockchain summits, and builder meetups worldwide.',
    url: 'https://hashtagweb3.com/events',
    images: [{ url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Events%20Calendar', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Events Calendar 2026 | Crypto Conferences & Meetups',
    description: 'Browse 3,000+ upcoming Web3 events, crypto conferences, blockchain summits, and builder meetups worldwide.',
    images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Events%20Calendar'],
  },
};

export const revalidate = 300;

export default async function EventsPage() {
  const events = await getEvents();
  const siteUrl = 'https://hashtagweb3.com';

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/events#page`,
        url: `${siteUrl}/events`,
        name: 'Web3 Events Calendar 2026 | Crypto Conferences & Meetups',
        isPartOf: {
          '@type': 'WebSite',
          url: siteUrl,
          name: 'Hashtag Web3',
        },
        description: 'Discover the top Web3 events, crypto conferences, blockchain summits, and virtual meetups.',
      },
      {
        '@type': 'ItemList',
        name: 'Upcoming Web3 Conferences & Events',
        numberOfItems: events.length,
        itemListElement: events.slice(0, 25).map((event: Web3Event, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Event',
            name: event.name,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            eventAttendanceMode: event.location.includes('Virtual')
              ? 'https://schema.org/OnlineEventAttendanceMode'
              : 'https://schema.org/OfflineEventAttendanceMode',
            eventStatus: 'https://schema.org/EventScheduled',
            location: {
              '@type': event.location.includes('Virtual') ? 'VirtualLocation' : 'Place',
              name: event.location,
              ...(event.url ? { url: event.url } : {}),
            },
            url: event.url || `${siteUrl}/events`,
          },
        })),
      },
    ],
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
                <PageHeader
                  title="Web3 Events"
                />
              </div>
            </section>
            <article className="site-container">
              <EventPartners />
              <div className="text-center my-4 space-y-2">
                <Link
                  href={SITE_STATS.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
                >
                  <Rss className="h-4 w-4" />
                  <span>Join our events &amp; networking feed with <strong className="text-foreground">{SITE_STATS.telegramSubscribersFormatted}</strong> subscribers.</span>
                </Link>
              </div>
              <EventsBoard initialEvents={events} />
            </article>
          </PageShell>
        </main>
      </div>
    </>
  );
}
