'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { DatePill } from '@/components/date-pill';
import { getEventSlug, getEventDatePill, getEventCity, type PublicWeb3Event } from '@/lib/events';

export function EventCard({ event, hideLocation = false }: { event: PublicWeb3Event; hideLocation?: boolean }) {
  const slug = getEventSlug(event);
  const datePill = getEventDatePill(event.startDate, event.timezone, event.eventStatus);
  const city = getEventCity(event) || 'Online';

  return (
    <Link href={`/${slug}`} className="block h-full">
      <Card className="flex h-full flex-col border-border/70 bg-card shadow-none hover:border-foreground/25 transition-colors">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center gap-3">
            <DatePill month={datePill.month} day={datePill.day} />
            <div className="min-w-0">
              <CardTitle className="text-base leading-snug font-semibold line-clamp-2" title={event.name}>
                {event.name}
              </CardTitle>
              {event.eventStatus === 'EventPostponed' && <p className="mt-0.5 text-xs text-muted-foreground">Postponed · New dates pending</p>}
              {!hideLocation && (
                <p className="text-xs text-muted-foreground truncate mt-0.5" title={city}>
                  {city}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
