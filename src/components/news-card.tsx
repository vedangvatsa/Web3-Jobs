'use client';

import { ListingCard, ListingCardHeader, ListingCardTitle } from '@/components/listing-card';
import { DatePill } from '@/components/date-pill';
import { trackNewsClick } from '@/lib/posthog';
import { getEventDatePill } from '@/lib/events';
import type { NewsItem } from '@/types';

export function NewsCard({ item }: { item: NewsItem }) {
  const datePill = getEventDatePill(item.pubDate);
  const showSource = Boolean(item.source && item.source !== 'Hashtag Web3');
  const isExternal = item.link.startsWith('http');

  return (
    <a
      href={item.link}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      onClick={() => trackNewsClick(item.title, item.link, item.source)}
      className="group block h-full"
    >
      <ListingCard>
        <ListingCardHeader>
          <div className="flex items-center gap-3">
            <DatePill month={datePill.month} day={datePill.day} />
            <div className="min-w-0">
              <ListingCardTitle
                className="transition-colors group-hover:text-primary"
                title={item.title}
              >
                {item.title}
              </ListingCardTitle>
              {showSource && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground" title={item.source}>
                  {item.source}
                </p>
              )}
            </div>
          </div>
        </ListingCardHeader>
      </ListingCard>
    </a>
  );
}
