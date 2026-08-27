'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { getEventSlug, formatEventDate, type Web3Event } from '@/lib/events';
import { Calendar } from 'lucide-react';

export function EventCard({ event }: { event: Web3Event }) {
  const slug = getEventSlug(event);
  const locationAndDate = event.location
    ? `${event.location} • ${formatEventDate(event.startDate, event.endDate)}`
    : formatEventDate(event.startDate, event.endDate);

  return (
    <Link href={`/${slug}`} className="block h-full">
      <Card className="flex h-full flex-col border-border/70 bg-card shadow-none hover:border-foreground/25">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-md border border-border/60 bg-muted/40 shrink-0 overflow-hidden flex items-center justify-center">
              {event.coverImage ? (
                <img
                  src={event.coverImage}
                  alt={event.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Calendar className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base leading-snug font-semibold line-clamp-2" title={event.name}>
                {event.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate mt-0.5" title={locationAndDate}>
                {locationAndDate}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
