'use client';

import { ListingCard, ListingCardHeader, ListingCardTitle } from '@/components/listing-card';
import Link from 'next/link';
import { DatePill } from '@/components/date-pill';
import { getEventSlug, getEventDatePill, getEventCity, type EventListItem } from '@/lib/events';

export function EventCard({ event, hideLocation = false }: { event: EventListItem; hideLocation?: boolean }) {
  const slug = getEventSlug(event);
  const datePill = getEventDatePill(event.startDate, event.timezone, event.eventStatus);
  const city = getEventCity(event) || 'Online';

  return (
    <Link href={`/${slug}`} prefetch={false} className="block h-full">
      <ListingCard>
        <ListingCardHeader>
          <div className="flex items-center gap-3">
            <DatePill month={datePill.month} day={datePill.day} />
            <div className="min-w-0">
              <ListingCardTitle title={event.name}>
                {event.name}
              </ListingCardTitle>
              {event.eventStatus === 'EventPostponed' && <p className="mt-0.5 text-xs text-muted-foreground">Postponed · New dates pending</p>}
              {!hideLocation && (
                <p className="text-xs text-muted-foreground truncate mt-0.5" title={city}>
                  {city}
                </p>
              )}
            </div>
          </div>
        </ListingCardHeader>
      </ListingCard>
    </Link>
  );
}
