import { EventsBoard } from '@/components/events-board';
import { getEvents } from '@/lib/events-server';
import { getEventSlug, type Web3Event } from '@/lib/events';
import type { Metadata } from 'next';
import { PageHeader } from "@/components/page-header";
import { PageShell } from '@/components/page-shell';
import { EventPartners } from '@/components/event-partners';
import { CommunityFeedBanner } from '@/components/community-feed-banner';

export const metadata: Metadata = {
  title: 'Web3 Events Calendar 2026 | Crypto Conferences & Meetups',
  description: 'Discover the top Web3 events, crypto conferences, blockchain summits, and virtual meetups. Stay updated with the latest in DeFi, DAOs, and crypto networking.',
  alternates: {
    canonical: 'https://hashtagweb3.com/events',
  },
  openGraph: {
    type: 'website',
    title: 'Web3 Events Calendar 2026 | Crypto Conferences & Meetups',
    description: 'Browse upcoming Web3 events, crypto conferences, blockchain summits, and builder meetups worldwide.',
    url: 'https://hashtagweb3.com/events',
    images: [{ url: 'https://hashtagweb3.com/og-events.jpg', width: 1200, height: 630, alt: 'Web3 Events' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Events Calendar 2026 | Crypto Conferences & Meetups',
    description: 'Browse upcoming Web3 events, crypto conferences, blockchain summits, and builder meetups worldwide.',
    images: ['https://hashtagweb3.com/og-events.jpg'],
  },
};

// Date-sensitive listings must be rendered from the current cache on every request.
export const dynamic = 'force-dynamic';

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
        <main className="flex-1">
          <PageShell>
            <PageHeader title="Web3 Events" />
            <article className="site-container">
              <EventPartners />
              <CommunityFeedBanner
                href="https://t.me/hashtagweb3"
                text={
                  <>
                    Join our Telegram community with <strong className="text-foreground">18,000+</strong> members
                  </>
                }
              />
              <EventsBoard initialEvents={events} />
            </article>
          </PageShell>
        </main>
      </div>
    </>
  );
}
