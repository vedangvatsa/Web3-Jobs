import { EventsBoard } from '@/components/events-board';
import { getEvents } from '@/lib/events-server';
import { getEventSlug, isEventUpcoming, type Web3Event } from '@/lib/events';
import { getEventListItem } from '@/lib/event-public';
import type { Metadata } from 'next';
import { PageHeader } from "@/components/page-header";
import { PageShell } from '@/components/page-shell';
import { EventPartners } from '@/components/event-partners';
import { CommunityFeedBanner } from '@/components/community-feed-banner';
import { seoSocialTitle, seoTitleSegment } from '@/lib/seo-title';

const eventsTitleSegment = 'Web3 Events Calendar 2026';
const eventsSocialTitle = seoSocialTitle(eventsTitleSegment);

export const metadata: Metadata = {
  title: seoTitleSegment(eventsTitleSegment),
  description: 'Discover the top Web3 events, crypto conferences, blockchain summits, and virtual meetups. Stay updated with the latest in DeFi, DAOs, and crypto networking.',
  alternates: {
    canonical: 'https://hashtagweb3.com/events',
  },
  openGraph: {
    type: 'website',
    title: eventsSocialTitle,
    description: 'Browse upcoming Web3 events, crypto conferences, blockchain summits, and builder meetups worldwide.',
    url: 'https://hashtagweb3.com/events',
    images: [{ url: 'https://hashtagweb3.com/og/pages/events.png', width: 1200, height: 630, alt: 'Web3 Events' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: eventsSocialTitle,
    description: 'Browse upcoming Web3 events, crypto conferences, blockchain summits, and builder meetups worldwide.',
    images: ['https://hashtagweb3.com/og/pages/events.png'],
  },
};

export const revalidate = 300;

export default async function EventsPage() {
  const events = await getEvents();
  const upcomingEvents = events.filter((event) => isEventUpcoming(event)).map(getEventListItem);
  const siteUrl = 'https://hashtagweb3.com';

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/events#page`,
        url: `${siteUrl}/events`,
        name: eventsSocialTitle,
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
        numberOfItems: upcomingEvents.length,
        itemListElement: upcomingEvents.slice(0, 25).map((event, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
            item: {
              '@type': 'WebPage',
              name: event.name,
              url: `${siteUrl}/${getEventSlug(event)}`,
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
        <main className="flex-1" data-event-page>
          <PageShell>
            <PageHeader title="Web3 Events" />
            <EventPartners />
            <CommunityFeedBanner variant="community" />
            <EventsBoard initialEvents={upcomingEvents} />
          </PageShell>
        </main>
      </div>
    </>
  );
}
