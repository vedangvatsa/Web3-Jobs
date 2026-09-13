'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/event-card';
import { Calendar, LayoutGrid } from 'lucide-react';
import { getEventSlug, type Web3Event } from '@/lib/events';

function getEventDate(event: Web3Event, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(event.startDate));
}

function getTimeOfDay(event: Web3Event, timeZone: string): string {
  const hour = Number(new Intl.DateTimeFormat('en-US', {
    timeZone,
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

export function EventSideEvents({ eventName, events, timeZone }: { eventName: string; events: Web3Event[]; timeZone: string }) {
  const days = Array.from(new Set(events.map((event) => getEventDate(event, timeZone))));
  const categories = Array.from(new Set(events.map((event) => event.category).filter((category): category is string => Boolean(category))));
  const [day, setDay] = useState('All days');
  const [category, setCategory] = useState('All categories');
  const [timeOfDay, setTimeOfDay] = useState('All times');
  const [price, setPrice] = useState('All prices');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const firstDate = getEventDate(events[0], timeZone);
    const [year, month] = firstDate.split('-').map(Number);
    return new Date(year, month - 1, 1);
  });

  const visibleEvents = events.filter((event) =>
    (day === 'All days' || getEventDate(event, timeZone) === day) &&
    (category === 'All categories' || event.category === category) &&
    (timeOfDay === 'All times' || getTimeOfDay(event, timeZone) === timeOfDay) &&
    (price === 'All prices' || getPriceType(event) === price)
  );
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: 42 }, (_, index) => {
      const day = index - firstDay + 1;
      if (day < 1) return { date: new Date(year, month - 1, daysInPreviousMonth + day), isCurrentMonth: false };
      if (day > daysInMonth) return { date: new Date(year, month + 1, day - daysInMonth), isCurrentMonth: false };
      return { date: new Date(year, month, day), isCurrentMonth: true };
    });
  }, [currentMonth]);
  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, Web3Event[]>();
    visibleEvents.forEach((event) => {
      const key = getEventDate(event, timeZone);
      grouped.set(key, [...(grouped.get(key) || []), event]);
    });
    return grouped;
  }, [timeZone, visibleEvents]);

  return (
    <section className="mt-12 border-t pt-8" aria-labelledby="side-events-heading">
      <h2 id="side-events-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">Side Events</h2>

      <div className="mt-6 space-y-4 rounded-xl border bg-muted/20 p-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button size="sm" variant={day === 'All days' ? 'default' : 'outline'} onClick={() => setDay('All days')}>All days</Button>
          {days.map((date) => (
            <Button key={date} size="sm" variant={day === date ? 'default' : 'outline'} onClick={() => setDay(date)}>
               {new Intl.DateTimeFormat('en-US', { timeZone, month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00:00Z`))}
            </Button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-medium text-muted-foreground">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1.5 flex h-9 w-full appearance-none rounded-md border bg-background px-3 pr-8 text-sm text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring [-webkit-tap-highlight-color:transparent]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1rem',
              }}
            >
              <option>All categories</option>
              {categories.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Time
            <select
              value={timeOfDay}
              onChange={(event) => setTimeOfDay(event.target.value)}
              className="mt-1.5 flex h-9 w-full appearance-none rounded-md border bg-background px-3 pr-8 text-sm text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring [-webkit-tap-highlight-color:transparent]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1rem',
              }}
            >
              <option>All times</option>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Access
            <select
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="mt-1.5 flex h-9 w-full appearance-none rounded-md border bg-background px-3 pr-8 text-sm text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring [-webkit-tap-highlight-color:transparent]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1rem',
              }}
            >
              <option>All prices</option>
              <option>Free</option>
              <option>Paid</option>
              <option>Invite only</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Showing {visibleEvents.length} events</p>
        <div className="flex items-center rounded-lg border bg-muted/20 p-1">
          <button onClick={() => setViewMode('grid')} className={`rounded p-1.5 ${viewMode === 'grid' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'}`} aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode('calendar')} className={`rounded p-1.5 ${viewMode === 'calendar' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'}`} aria-label="Calendar view">
            <Calendar className="h-4 w-4" />
          </button>
        </div>
      </div>
      {viewMode === 'grid' ? (
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.map((event) => <EventCard key={event.id} event={event} hideLocation />)}
        </div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
            <h3 className="font-semibold">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            <div className="flex gap-1">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="rounded border bg-background px-2 py-1 text-sm" aria-label="Previous month">‹</button>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="rounded border bg-background px-2 py-1 text-sm" aria-label="Next month">›</button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b bg-muted/20 py-2 text-center text-xs font-semibold text-muted-foreground">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => <div key={label}>{label}</div>)}</div>
          <div className="grid grid-cols-7 divide-x divide-y">
            {calendarDays.map(({ date, isCurrentMonth }) => {
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              const dayEvents = eventsByDay.get(key) || [];
              return <div key={key} className={`min-h-28 p-1.5 ${isCurrentMonth ? 'bg-card' : 'bg-muted/20 text-muted-foreground/50'}`}>
                <span className="text-xs font-semibold">{date.getDate()}</span>
                <div className="mt-1 space-y-1">{dayEvents.slice(0, 3).map((event) => <Link key={event.id} href={`/${getEventSlug(event)}`} className="block truncate rounded border border-primary/20 bg-primary/10 p-1 text-[11px] font-medium text-primary">{event.name}</Link>)}{dayEvents.length > 3 && <span className="block text-center text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</span>}</div>
              </div>;
            })}
          </div>
        </div>
      )}
    </section>
  );
}
