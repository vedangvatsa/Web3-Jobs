'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Web3Event, getEventSlug } from '@/lib/events';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EventCard } from '@/components/event-card';

// ISO 3166-1 alpha-2 → full country name
const COUNTRY_NAMES: Record<string, string> = {
  AE: 'United Arab Emirates', AF: 'Afghanistan', AR: 'Argentina', AT: 'Austria',
  AU: 'Australia', BD: 'Bangladesh', BE: 'Belgium', BG: 'Bulgaria', BN: 'Brunei',
  BO: 'Bolivia', BR: 'Brazil', BS: 'Bahamas', CA: 'Canada', CH: 'Switzerland',
  CL: 'Chile', CN: 'China', CO: 'Colombia', CR: 'Costa Rica', CZ: 'Czechia',
  DE: 'Germany', DK: 'Denmark', DO: 'Dominican Republic', EC: 'Ecuador',
  EE: 'Estonia', EG: 'Egypt', ES: 'Spain', FI: 'Finland', FR: 'France',
  GB: 'United Kingdom', GE: 'Georgia', GF: 'French Guiana', GH: 'Ghana',
  GR: 'Greece', GT: 'Guatemala', HK: 'Hong Kong', HR: 'Croatia', HU: 'Hungary',
  ID: 'Indonesia', IE: 'Ireland', IL: 'Israel', IN: 'India', IS: 'Iceland',
  IT: 'Italy', JM: 'Jamaica', JO: 'Jordan', JP: 'Japan', KE: 'Kenya',
  KR: 'South Korea', KW: 'Kuwait', KZ: 'Kazakhstan', LB: 'Lebanon', LK: 'Sri Lanka',
  LT: 'Lithuania', LU: 'Luxembourg', LV: 'Latvia', MA: 'Morocco', MC: 'Monaco',
  MX: 'Mexico', MY: 'Malaysia', NG: 'Nigeria', NL: 'Netherlands', NO: 'Norway',
  NZ: 'New Zealand', PA: 'Panama', PE: 'Peru', PH: 'Philippines', PK: 'Pakistan',
  PL: 'Poland', PR: 'Puerto Rico', PT: 'Portugal', QA: 'Qatar', RO: 'Romania',
  RS: 'Serbia', RU: 'Russia', RW: 'Rwanda', SA: 'Saudi Arabia', SE: 'Sweden',
  SG: 'Singapore', SI: 'Slovenia', SK: 'Slovakia', TH: 'Thailand', TN: 'Tunisia',
  TR: 'Turkey', TW: 'Taiwan', TZ: 'Tanzania', UA: 'Ukraine', UG: 'Uganda',
  US: 'United States', UY: 'Uruguay', UZ: 'Uzbekistan', VE: 'Venezuela',
  VN: 'Vietnam', ZA: 'South Africa',
};

function normalizeCountry(raw: string): string {
  if (!raw) return '';
  const upper = raw.trim().toUpperCase();
  if (COUNTRY_NAMES[upper]) return COUNTRY_NAMES[upper];
  return raw.trim();
}

const INITIAL_COUNT = 30;
const LOAD_MORE_COUNT = 30;

const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Next Month', value: 'next-month' },
  { label: 'This Year', value: 'year' },
];

function EventCardSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2 pt-4 px-4">
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="pt-0 pb-3 px-4 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  );
}

function formatEventDate(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (startStr === endStr) return startStr;
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
  }
  return `${startStr} – ${endStr}`;
}

export function EventsBoard({ initialEvents }: { initialEvents: Web3Event[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const countries = useMemo(() => {
    const set = new Set<string>();
    initialEvents.forEach(e => {
      if (e.country) set.add(normalizeCountry(e.country));
      else if (e.location === 'Online' || e.location?.toLowerCase().includes('online')) set.add('Online');
    });
    return Array.from(set).sort();
  }, [initialEvents]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return initialEvents.filter(event => {
      // Exclude past events
      const eventEnd = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
      if (!isNaN(eventEnd.getTime()) && eventEnd < now) return false;

      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || event.name.toLowerCase().includes(q) ||
                            (event.description || '').toLowerCase().includes(q) ||
                            (event.location || '').toLowerCase().includes(q);

      // Country
      let matchesCountry = true;
      if (countryFilter) {
        if (countryFilter === 'Online') {
          matchesCountry = event.location === 'Online' || event.location?.toLowerCase().includes('online');
        } else {
          matchesCountry = normalizeCountry(event.country || '') === countryFilter || Boolean(event.location?.includes(countryFilter));
        }
      }

      // Date range
      let matchesDate = true;
      if (dateFilter) {
        const eventDate = new Date(event.startDate);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        switch (dateFilter) {
          case 'today':
            matchesDate = eventDate >= today && eventDate < new Date(today.getTime() + 86400000);
            break;
          case 'week':
            matchesDate = eventDate >= today && eventDate < new Date(today.getTime() + 7 * 86400000);
            break;
          case 'month':
            matchesDate = eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
            break;
          case 'next-month': {
            const nm = now.getMonth() === 11 ? 0 : now.getMonth() + 1;
            const ny = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
            matchesDate = eventDate.getMonth() === nm && eventDate.getFullYear() === ny;
            break;
          }
          case 'year':
            matchesDate = eventDate.getFullYear() === now.getFullYear();
            break;
        }
      }

      return matchesSearch && matchesCountry && matchesDate;
    });
  }, [initialEvents, searchQuery, countryFilter, dateFilter]);

  const isSearching = searchQuery.length > 0 || countryFilter || dateFilter;
  const visibleEvents = isSearching ? filteredEvents : filteredEvents.slice(0, visibleCount);
  const hasMore = !isSearching && visibleCount < filteredEvents.length;

  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // Calendar matrix computation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];
    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    // Next month padding to complete 42 cells (6 rows × 7 days)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    return days;
  }, [currentMonth]);

  // Map events to calendar days
  const eventsByDay = useMemo(() => {
    const map = new Map<string, Web3Event[]>();
    filteredEvents.forEach(event => {
      const d = new Date(event.startDate);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    });
    return map;
  }, [filteredEvents]);

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || viewMode === 'calendar') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, filteredEvents.length));
        }
      },
      { rootMargin: '1200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, filteredEvents.length, viewMode]);

  return (
    <div>
      {/* Search + Filters + View Toggle */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full" role="search">
            <Input
              placeholder="Search events, locations..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(INITIAL_COUNT); }}
              className="h-11 w-full rounded-md pl-10 text-base"
              aria-label="Search events"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border/60 rounded-md shrink-0 self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Grid View"
            >
              <span className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5">
                <span className="bg-current rounded-xs"></span>
                <span className="bg-current rounded-xs"></span>
                <span className="bg-current rounded-xs"></span>
                <span className="bg-current rounded-xs"></span>
              </span>
              Grid View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Calendar View"
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar View
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-3 w-full sm:w-auto">
            <select
              value={countryFilter || ''}
              onChange={(e) => { setCountryFilter(e.target.value === '' ? null : e.target.value); setVisibleCount(INITIAL_COUNT); }}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground shadow-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer truncate"
              aria-label="Filter by location"
            >
              <option value="">All Locations</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={dateFilter || ''}
              onChange={(e) => { setDateFilter(e.target.value === '' ? null : e.target.value); setVisibleCount(INITIAL_COUNT); }}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground shadow-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer truncate"
              aria-label="Filter by date"
            >
              <option value="">All Dates</option>
              {DATE_RANGES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {isSearching && (
            <p className="text-xs text-muted-foreground" aria-live="polite">
              Showing {filteredEvents.length} result{filteredEvents.length === 1 ? '' : 's'}
            </p>
          )}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-8" aria-hidden="true">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
                Loading more events...
              </div>
            </div>
          )}
        </>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-xs">
          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-muted/30">
            <h2 className="text-base font-bold text-foreground">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-2.5 py-1 text-xs font-medium border border-border/80 rounded-md bg-background hover:bg-muted text-foreground transition-colors"
              >
                Today
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="p-1.5 border border-border/80 rounded-md bg-background hover:bg-muted text-foreground transition-colors"
                  aria-label="Previous Month"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="p-1.5 border border-border/80 rounded-md bg-background hover:bg-muted text-foreground transition-colors"
                  aria-label="Next Month"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-border/70 bg-muted/20 text-center text-xs font-semibold text-muted-foreground py-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/60">
            {calendarDays.map(({ date, isCurrentMonth }, idx) => {
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              const dayEvents = eventsByDay.get(key) || [];
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] p-1.5 flex flex-col transition-colors ${
                    isCurrentMonth ? 'bg-card' : 'bg-muted/20 text-muted-foreground/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold inline-flex items-center justify-center h-5 w-5 rounded-full ${
                        isToday
                          ? 'bg-primary text-primary-foreground font-bold'
                          : isCurrentMonth
                          ? 'text-foreground'
                          : 'text-muted-foreground/50'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event Badges */}
                  <div className="flex-1 space-y-1 overflow-y-auto max-h-[90px] pr-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <Link
                        key={ev.id}
                        href={`/${getEventSlug(ev)}`}
                        className="block text-[11px] font-medium leading-tight p-1 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 truncate transition-colors"
                        title={`${ev.name} (${getEventCity(ev) || 'Online'})`}
                      >
                        {ev.name}
                      </Link>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="block text-[10px] font-medium text-muted-foreground text-center pt-0.5">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-lg col-span-full mt-8">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-xl font-semibold">No Events Found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setCountryFilter(null); setDateFilter(null); }}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
