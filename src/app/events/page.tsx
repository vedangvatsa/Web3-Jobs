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
      <div className="h-screen overflow-y-auto bg-[#fafafa] dark:bg-black selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors duration-200 flex flex-col">
        <Header />
        <main id="main-content" className="w-full max-w-5xl mx-auto px-6 py-16 md:py-20 pb-20 flex-1">
          {/* HERO */}
          <div className="mb-20">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.2em] mb-6">Hashtag Web3 Events / 2026</p>
            <h1 className="text-4xl sm:text-[3.4rem] font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-8 leading-[1.12]">
              Web3 Events<br />& Conferences
            </h1>
            <p className="text-[17px] text-zinc-500 dark:text-zinc-400 leading-[1.8] max-w-3xl">
              A directory of active Web3 conferences, blockchain summits, and builder meetups. Browse global events or filter by location to find networking opportunities near you.
            </p>
          </div>
          
          <div className="w-full">
            <EventsBoard initialEvents={events} />
          </div>
        </main>
      </div>
    </>
  );
}
