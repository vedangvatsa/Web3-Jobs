import { EventsBoard } from '@/components/events-board';
import { getEvents } from '@/lib/events-server';
import { Web3Event } from '@/lib/events';
import type { Metadata } from 'next';
import type { WebPage, Event } from 'schema-dts';
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: 'Web3 Events Calendar 2026 | Crypto Conferences & Meetups',
  description: 'Discover the top Web3 events, crypto conferences, blockchain summits, and virtual meetups. Stay updated with the latest in DeFi, DAOs, and crypto networking.',
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
  alternates: {
    canonical: '/events',
  },
};

export default async function EventsPage() {
  const events = await getEvents();

  const siteUrl = 'https://hashtagweb3.com';

  const pageSchema: WebPage = {
    '@type': 'WebPage',
    url: `${siteUrl}/events`,
    name: 'Web3 Events Calendar 2026 | Crypto Conferences & Meetups',
    isPartOf: {
      '@type': 'WebSite',
      url: siteUrl,
      name: 'Hashtag Web3'
    },
    description: 'Discover the top Web3 events, crypto conferences, blockchain summits, and virtual meetups.',
  };

  const eventsSchema: Event[] = events.slice(0, 20).map((event: Web3Event) => ({
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: event.location.includes('Virtual') ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': event.location.includes('Virtual') ? 'VirtualLocation' : 'Place',
      name: event.location,
      ...(event.url ? { url: event.url } : {})
    },
    url: event.url,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsSchema) }}
      />
      <div className="flex flex-col min-h-screen">
                <main className="flex-1">
          <div className="container mx-auto page-section px-4">
            <section className="text-center mb-8">
              <div className="site-container">
                <PageHeader
                  title="Web3 Events & Conferences"
                  description="Discover verified crypto conferences, hackathons, developer summits, and builder meetups worldwide in 2026."
                />
              </div>
            </section>
            <article className="site-container">
              <EventsBoard initialEvents={events} />
            </article>
          </div>
        </main>
      </div>
    </>
  );
}
