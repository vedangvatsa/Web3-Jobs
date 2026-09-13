'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type Token2049SideEvent = {
  id: string;
  slug: string;
  name: string;
  startDate: string;
  location: string;
  url: string;
  coverImage: string;
  category?: string;
  price?: string;
};

function getSingaporeDate(event: Token2049SideEvent): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore' }).format(new Date(event.startDate));
}

function getSingaporeTime(event: Token2049SideEvent): string {
  return new Intl.DateTimeFormat('en-SG', {
    timeZone: 'Asia/Singapore',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(event.startDate));
}

function getTimeOfDay(event: Token2049SideEvent): string {
  const hour = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(event.startDate)));
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function getPriceType(event: Token2049SideEvent): string {
  const price = event.price?.toLowerCase() ?? '';
  if (/invite|application|approval/.test(`${event.name} ${price}`.toLowerCase())) return 'Invite only';
  if (/free|complimentary|0/.test(price)) return 'Free';
  return 'Paid';
}

export function Token2049SideEvents({ events }: { events: Token2049SideEvent[] }) {
  const days = Array.from(new Set(events.map(getSingaporeDate)));
  const categories = Array.from(new Set(events.map((event) => event.category).filter((category): category is string => Boolean(category))));
  const [day, setDay] = useState('All days');
  const [category, setCategory] = useState('All categories');
  const [timeOfDay, setTimeOfDay] = useState('All times');
  const [price, setPrice] = useState('All prices');

  const visibleEvents = events.filter((event) =>
    (day === 'All days' || getSingaporeDate(event) === day) &&
    (category === 'All categories' || event.category === category) &&
    (timeOfDay === 'All times' || getTimeOfDay(event) === timeOfDay) &&
    (price === 'All prices' || getPriceType(event) === price)
  );

  return (
    <section className="mt-12 border-t pt-8" aria-labelledby="token2049-side-events-heading">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Singapore, October 5 to 11</p>
        <h2 id="token2049-side-events-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">TOKEN2049 Side Events</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {events.length} official side events. Times are shown in Singapore time. Registration links lead to each organizer.
        </p>
      </div>

      <div className="mt-6 space-y-4 rounded-xl border bg-muted/20 p-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button size="sm" variant={day === 'All days' ? 'default' : 'outline'} onClick={() => setDay('All days')}>All days</Button>
          {days.map((date) => (
            <Button key={date} size="sm" variant={day === date ? 'default' : 'outline'} onClick={() => setDay(date)}>
              {new Intl.DateTimeFormat('en-SG', { timeZone: 'Asia/Singapore', month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00:00+08:00`))}
            </Button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-medium text-muted-foreground">
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1.5 flex h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground">
              <option>All categories</option>
              {categories.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Time
            <select value={timeOfDay} onChange={(event) => setTimeOfDay(event.target.value)} className="mt-1.5 flex h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground">
              <option>All times</option>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Access
            <select value={price} onChange={(event) => setPrice(event.target.value)} className="mt-1.5 flex h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground">
              <option>All prices</option>
              <option>Free</option>
              <option>Paid</option>
              <option>Invite only</option>
            </select>
          </label>
        </div>
      </div>

      <p className="mt-5 text-sm text-muted-foreground">Showing {visibleEvents.length} events</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleEvents.map((event) => (
          <article key={event.id} className="overflow-hidden rounded-xl border bg-card">
            <Image src={event.coverImage} alt="" width={640} height={360} className="aspect-video w-full object-cover" />
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold text-primary">{getSingaporeTime(event)} SGT</p>
                <span className="text-right text-xs text-muted-foreground">{event.category}</span>
              </div>
              <h3 className="line-clamp-2 text-base font-semibold leading-snug"><Link href={`/${event.slug}`} className="hover:underline">{event.name}</Link></h3>
              <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" />{event.location}</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">{event.price || getPriceType(event)}</span>
                <a href={event.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">Register <ExternalLink className="h-3.5 w-3.5" /></a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
