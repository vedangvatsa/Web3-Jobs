import { EventsBoard } from '@/components/events-board';
import { Header } from '@/components/header';
import { getEvents } from '@/lib/events';
import type { WebPage, Event } from 'schema-dts';

export const metadata = {
  title: 'Web3 Events Calendar 2026 | Crypto Conferences & Meetups',
  description: 'Discover the top Web3 events, crypto conferences, blockchain summits, and virtual meetups. Stay updated with the latest in DeFi, DAOs, and crypto networking.',
};

export const revalidate = 3600; // Revalidate every hour

export default async function EventsPage() {
  const events = await getEvents();
  const headlines = [
    "Web3 Events Calendar",
    "Top Crypto Conferences",
    "Blockchain Summits"
  ];
  
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
        <main className="flex-1 bg-muted/20">
          <div className="container mx-auto py-12 px-4">
            <section className="text-center mb-12">
              <div className="max-w-3xl mx-auto space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 pb-2">
                  {headlines[0]}
                </h1>
                <p className="text-xl text-muted-foreground">
                  The ultimate calendar for Web3 conferences, blockchain summits, and crypto meetups worldwide.
                </p>
              </div>
            </section>
            
            <div className="max-w-7xl mx-auto">
              <EventsBoard initialEvents={events} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
