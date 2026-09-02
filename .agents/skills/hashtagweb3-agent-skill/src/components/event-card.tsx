'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { getEventSlug, getEventDatePill, getEventCity, type Web3Event } from '@/lib/events';

export function EventCard({ event }: { event: Web3Event }) {
  const slug = getEventSlug(event);
  const datePill = getEventDatePill(event.startDate);
  const city = getEventCity(event) || 'Online';

  return (
    <Link href={`/${slug}`} className="block h-full">
      <Card className="flex h-full flex-col border-border/70 bg-card shadow-none hover:border-foreground/25 transition-colors">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md border border-border/60 bg-muted/40 shrink-0 flex flex-col items-center justify-center text-center select-none">
              <span className="text-[10px] font-bold text-primary uppercase leading-none tracking-tight">
                {datePill.month}
              </span>
              <span className="text-sm font-extrabold text-foreground leading-none mt-1">
                {datePill.day}
              </span>
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base leading-snug font-semibold line-clamp-2" title={event.name}>
                {event.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate mt-0.5" title={city}>
                {city}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
