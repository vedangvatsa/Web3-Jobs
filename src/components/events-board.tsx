'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Web3Event } from '@/lib/events';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
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
  }, [hasMore, filteredEvents.length]);

  return (
    <div>
      {/* Search + Filters */}
      <div className="mb-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Search events, locations..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(INITIAL_COUNT); }}
              className="w-full text-base pl-12 h-12 rounded-full shadow-sm focus-visible:ring-offset-4"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <select
            value={countryFilter || ''}
            onChange={(e) => setCountryFilter(e.target.value === '' ? null : e.target.value)}
            className="h-12 px-4 rounded-full border border-input bg-background text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
          >
            <option value="">All Locations</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={dateFilter || ''}
            onChange={(e) => setDateFilter(e.target.value === '' ? null : e.target.value)}
            className="h-12 px-4 rounded-full border border-input bg-background text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
          >
            <option value="">All Dates</option>
            {DATE_RANGES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        {isSearching && (
          <p className="text-center text-sm text-muted-foreground mt-3">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleEvents.map((event) => (
          <a
            key={event.id}
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="flex flex-col h-full rounded-lg shadow-sm hover:shadow-sm border-transparent hover:border-border/60 bg-card transition-all duration-200">
              {event.coverImage && (
                <div className="h-36 w-full overflow-hidden rounded-t-lg">
                  <img
                    src={event.coverImage}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-base leading-snug font-semibold group-hover:text-primary transition-colors line-clamp-2">
                  {event.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow pt-0 pb-3 px-4 space-y-1.5">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatEventDate(event.startDate, event.endDate)}</span>
                </p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-8" aria-hidden="true">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            Loading more events...
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
