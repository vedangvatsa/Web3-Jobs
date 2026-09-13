'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/event-card';
import type { Web3Event } from '@/lib/events';

function getSingaporeDate(event: Web3Event): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore' }).format(new Date(event.startDate));
}

function getTimeOfDay(event: Web3Event): string {
  const hour = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(event.startDate)));
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function getPriceType(event: Web3Event): string {
  const price = event.price?.toLowerCase() ?? '';
  if (/invite|application|approval/.test(`${event.name} ${price}`.toLowerCase())) return 'Invite only';
  if (/free|complimentary|0/.test(price)) return 'Free';
  return 'Paid';
}

export function Token2049SideEvents({ events }: { events: Web3Event[] }) {
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
      <h2 id="token2049-side-events-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">TOKEN2049 Side Events</h2>

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
      <div className="mt-3 grid gap-3">
        {visibleEvents.map((event) => (
          <EventCard key={event.id} event={event} hideLocation />
        ))}
      </div>
    </section>
  );
}
