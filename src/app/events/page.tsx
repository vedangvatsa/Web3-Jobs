import { EventsBoard } from '@/components/events-board';
import { Header } from '@/components/header';
import { getEvents } from '@/lib/events';
import type { Metadata } from 'next';
import type { WebPage, Event } from 'schema-dts';

export const metadata: Metadata = {
  title: 'Web3 Events Calendar 2026 | Crypto Conferences & Meetups',
  description: 'Discover the top Web3 events, crypto conferences, blockchain summits, and virtual meetups. Stay updated with the latest in DeFi, DAOs, and crypto networking.',
  openGraph: {
    title: 'Web3 Events Calendar 2026 | Crypto Conferences & Meetups',
    description: 'Browse 3,000+ upcoming Web3 events, crypto conferences, blockchain summits, and builder meetups worldwide.',
    url: 'https://hashtagweb3.com/events',
    images: [{ url: '/api/og?type=default&title=Web3%20Events%20Calendar', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Events Calendar 2026 | Crypto Conferences & Meetups',
    description: 'Browse 3,000+ upcoming Web3 events, crypto conferences, blockchain summits, and builder meetups worldwide.',
    images: ['/api/og?type=default&title=Web3%20Events%20Calendar'],
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

  const eventsSchema: Event[] = events.slice(0, 20).map(event => ({
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
        <Header />
        <main className="flex-1">
          <div className="container mx-auto py-8 px-4">
            <section className="text-center mb-8">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">Web3 Events</h1>
              </div>
            </section>
            <article className="max-w-6xl mx-auto">
              <EventsBoard initialEvents={events} />
            </article>
          </div>
        </main>
      </div>
    </>
  );
}
