'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Web3Event,
  EventType,
  getEventType,
  getEventFormat,
  getEventEcosystems,
  formatEventDate,
  getEventDatePill,
  getRelativeBadge,
  normalizeCountry,
  getEventSlug,
} from '@/lib/events';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  Calendar,
  MapPin,
  ExternalLink,
  Globe,
  Building2,
  Code2,
  Users,
  Layers,
  LayoutGrid,
  List,
  X,
  PlusCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { CtaBanner } from '@/components/cta-banner';

const INITIAL_COUNT = 30;
const LOAD_MORE_COUNT = 30;

const CATEGORY_TABS: Array<{ label: string; value: string; icon: React.ElementType }> = [
  { label: 'All Events', value: 'all', icon: LayoutGrid },
  { label: 'Conferences & Summits', value: 'conference', icon: Building2 },
  { label: 'Hackathons', value: 'hackathon', icon: Code2 },
  { label: 'Meetups & Networking', value: 'meetup', icon: Users },
  { label: 'Workshops & Demos', value: 'workshop', icon: Layers },
  { label: 'Virtual / Online', value: 'online', icon: Globe },
];

const DATE_RANGES = [
  { label: 'All Upcoming Dates', value: 'all' },
  { label: 'Happening This Week', value: 'week' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Next Month', value: 'next-month' },
  { label: 'Later in 2026', value: 'later-year' },
  { label: '2027', value: '2027' },
];

const ECOSYSTEM_OPTIONS = [
  'All Ecosystems',
  'Ethereum',
  'Solana',
  'Bitcoin',
  'Base',
  'Polygon',
  'Arbitrum',
  'Optimism',
  'Sui',
  'Aptos',
  'Monad',
  'Berachain',
  'Avalanche',
  'NEAR',
  'TON',
  'DeFi',
  'AI + Web3',
  'ZK / L2',
  'NFT / Gaming',
  'Security',
  'RWA',
];

// Deterministic gradients for cover image fallbacks
const PLACEHOLDER_GRADIENTS = [
  'from-violet-600/80 via-purple-700/80 to-indigo-800/80',
  'from-blue-600/80 via-cyan-700/80 to-teal-800/80',
  'from-emerald-600/80 via-teal-700/80 to-cyan-800/80',
  'from-amber-600/80 via-orange-700/80 to-rose-800/80',
  'from-rose-600/80 via-pink-700/80 to-fuchsia-800/80',
  'from-indigo-600/80 via-blue-700/80 to-sky-800/80',
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PLACEHOLDER_GRADIENTS[Math.abs(hash) % PLACEHOLDER_GRADIENTS.length];
}

function EventCardImage({
  src,
  name,
  type,
  format,
}: {
  src?: string | null;
  name: string;
  type: EventType;
  format: string;
}) {
  const [hasError, setHasError] = useState(false);
  const initial = name.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase() || 'W';
  const gradient = getGradient(name);

  if (!src || hasError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-15">
          <div className="absolute -top-6 -right-6 w-32 h-32 border border-white/40 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 border border-white/40 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/20 rounded-xl rotate-45" />
        </div>
        <div className="flex flex-col items-center gap-1.5 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-md">
            <span className="text-xl font-bold text-white tracking-wider">{initial}</span>
          </div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/80">
            {type === 'hackathon'
              ? 'Hackathon'
              : type === 'conference'
              ? 'Conference'
              : format === 'online'
              ? 'Virtual Event'
              : 'Web3 Event'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
}

export function EventsBoard({ initialEvents }: { initialEvents: Web3Event[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>('All Ecosystems');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Extract unique locations
  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    initialEvents.forEach(e => {
      if (e.city) set.add(e.city);
      else if (e.country) set.add(e.country);
      else if (e.location && !e.location.includes('TBA') && !e.location.includes('Virtual')) {
        const parts = e.location.split(',').map(s => s.trim());
        if (parts[0]) set.add(parts[0]);
      }
    });
    return Array.from(set).sort();
  }, [initialEvents]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return initialEvents.filter(event => {
      const type = getEventType(event);
      const format = getEventFormat(event);
      const ecosystems = getEventEcosystems(event);

      // Category tab
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'online' && format !== 'online') return false;
        if (selectedCategory === 'conference' && type !== 'conference') return false;
        if (selectedCategory === 'hackathon' && type !== 'hackathon') return false;
        if (selectedCategory === 'meetup' && type !== 'meetup') return false;
        if (selectedCategory === 'workshop' && type !== 'workshop') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          event.name.toLowerCase().includes(q) ||
          (event.description || '').toLowerCase().includes(q) ||
          (event.location || '').toLowerCase().includes(q) ||
          (event.city || '').toLowerCase().includes(q) ||
          (event.country || '').toLowerCase().includes(q) ||
          ecosystems.some(t => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Location Filter
      if (selectedLocation !== 'all') {
        if (selectedLocation === 'Online') {
          if (format !== 'online') return false;
        } else {
          const locMatch =
            (event.city || '').toLowerCase() === selectedLocation.toLowerCase() ||
            (event.country || '').toLowerCase() === selectedLocation.toLowerCase() ||
            (event.location || '').toLowerCase().includes(selectedLocation.toLowerCase());
          if (!locMatch) return false;
        }
      }

      // Ecosystem Filter
      if (selectedEcosystem !== 'All Ecosystems') {
        const hasTag = ecosystems.some(
          t => t.toLowerCase() === selectedEcosystem.toLowerCase()
        );
        const nameOrDesc = `${event.name} ${event.description || ''}`.toLowerCase();
        if (!hasTag && !nameOrDesc.includes(selectedEcosystem.toLowerCase())) {
          return false;
        }
      }

      // Date Range Filter
      if (selectedDateRange !== 'all') {
        const eventDate = new Date(event.startDate);
        if (isNaN(eventDate.getTime())) return true;

        if (selectedDateRange === 'week') {
          const nextWeek = new Date(today.getTime() + 7 * 86400000);
          if (eventDate < today || eventDate > nextWeek) return false;
        } else if (selectedDateRange === 'this-month') {
          if (
            eventDate.getMonth() !== now.getMonth() ||
            eventDate.getFullYear() !== now.getFullYear()
          ) {
            return false;
          }
        } else if (selectedDateRange === 'next-month') {
          const targetMonth = (now.getMonth() + 1) % 12;
          const targetYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
          if (
            eventDate.getMonth() !== targetMonth ||
            eventDate.getFullYear() !== targetYear
          ) {
            return false;
          }
        } else if (selectedDateRange === 'later-year') {
          if (eventDate.getFullYear() !== now.getFullYear() || eventDate.getMonth() <= now.getMonth() + 1) {
            return false;
          }
        } else if (selectedDateRange === '2027') {
          if (eventDate.getFullYear() !== 2027) return false;
        }
      }

      return true;
    });
  }, [
    initialEvents,
    selectedCategory,
    searchQuery,
    selectedLocation,
    selectedEcosystem,
    selectedDateRange,
  ]);

  const hasActiveFilters =
    searchQuery.length > 0 ||
    selectedCategory !== 'all' ||
    selectedLocation !== 'all' ||
    selectedEcosystem !== 'All Ecosystems' ||
    selectedDateRange !== 'all';

  const visibleEvents = hasActiveFilters ? filteredEvents : filteredEvents.slice(0, visibleCount);
  const hasMore = !hasActiveFilters && visibleCount < filteredEvents.length;

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, filteredEvents.length));
        }
      },
      { rootMargin: '1000px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, filteredEvents.length]);

  // Group events by month for timeline view
  const eventsByMonth = useMemo(() => {
    const grouped: Record<string, Web3Event[]> = {};
    visibleEvents.forEach(e => {
      const month = e.month || 'Upcoming';
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(e);
    });
    return grouped;
  }, [visibleEvents]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialEvents.length };
    initialEvents.forEach(e => {
      const t = getEventType(e);
      const f = getEventFormat(e);
      counts[t] = (counts[t] || 0) + 1;
      if (f === 'online') counts['online'] = (counts['online'] || 0) + 1;
    });
    return counts;
  }, [initialEvents]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedEcosystem('All Ecosystems');
    setSelectedDateRange('all');
    setVisibleCount(INITIAL_COUNT);
  };

  return (
    <div className="space-y-8">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_TABS.map(tab => {
          const Icon = tab.icon;
          const isSelected = selectedCategory === tab.value;
          const count = tabCounts[tab.value] ?? 0;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setSelectedCategory(tab.value);
                setVisibleCount(INITIAL_COUNT);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card hover:bg-accent text-muted-foreground hover:text-foreground border-border/70'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by event, speaker, city, chain..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setVisibleCount(INITIAL_COUNT);
              }}
              className="pl-9 pr-8 h-10 rounded-xl text-sm bg-background border-border/80"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Location Dropdown */}
          <div className="lg:col-span-3">
            <select
              value={selectedLocation}
              onChange={e => {
                setSelectedLocation(e.target.value);
                setVisibleCount(INITIAL_COUNT);
              }}
              className="w-full h-10 px-3 rounded-xl border border-border/80 bg-background text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">All Locations</option>
              <option value="Online">Virtual / Online</option>
              <optgroup label="Popular Cities & Hubs">
                {locationOptions.map(loc => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Ecosystem Dropdown */}
          <div className="lg:col-span-3">
            <select
              value={selectedEcosystem}
              onChange={e => {
                setSelectedEcosystem(e.target.value);
                setVisibleCount(INITIAL_COUNT);
              }}
              className="w-full h-10 px-3 rounded-xl border border-border/80 bg-background text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {ECOSYSTEM_OPTIONS.map(eco => (
                <option key={eco} value={eco}>
                  {eco}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter & View Mode Switcher */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <select
              value={selectedDateRange}
              onChange={e => {
                setSelectedDateRange(e.target.value);
                setVisibleCount(INITIAL_COUNT);
              }}
              className="flex-1 h-10 px-3 rounded-xl border border-border/80 bg-background text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {DATE_RANGES.map(d => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-xl p-0.5 bg-muted/40 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-background shadow-xs text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-background shadow-xs text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Timeline View"
                aria-label="Timeline View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips & Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Showing <strong className="text-foreground font-semibold">{filteredEvents.length}</strong> verified events
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs text-primary hover:text-primary/90 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Reset filters
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://t.me/web3jobs_rep"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5 text-primary" />
              <span>Submit an Event</span>
            </a>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleEvents.map(event => {
            const type = getEventType(event);
            const format = getEventFormat(event);
            const ecosystems = getEventEcosystems(event);
            const datePill = getEventDatePill(event.startDate);
            const relativeBadge = getRelativeBadge(event.startDate);
            const slug = getEventSlug(event);

            return (
              <Link
                key={event.id}
                href={`/${slug}`}
                className="block group h-full"
              >
                <Card className="flex flex-col h-full rounded-2xl overflow-hidden border border-border/80 hover:border-primary/50 bg-card hover:shadow-md transition-all duration-300">
                  {/* Card Cover Header */}
                  <div className="h-44 w-full relative overflow-hidden bg-muted">
                    <EventCardImage
                      src={event.coverImage}
                      name={event.name}
                      type={type}
                      format={format}
                    />

                    {/* Top Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <Badge
                        variant="secondary"
                        className="backdrop-blur-md bg-background/90 text-foreground font-medium text-[11px] px-2.5 py-0.5 rounded-full border border-border/40 shadow-xs flex items-center gap-1"
                      >
                        {format === 'online' ? (
                          <>
                            <Globe className="h-3 w-3 text-sky-500" />
                            <span>Virtual</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3 text-emerald-500" />
                            <span>In-Person</span>
                          </>
                        )}
                      </Badge>

                      {relativeBadge ? (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/90 text-primary-foreground shadow-xs">
                          {relativeBadge}
                        </span>
                      ) : type === 'hackathon' ? (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-600/90 text-white shadow-xs flex items-center gap-1">
                          <Code2 className="h-3 w-3" />
                          Hackathon
                        </span>
                      ) : null}
                    </div>

                    {/* Bottom Date Overlay Badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
                      <div className="bg-background/95 backdrop-blur-md border border-border/60 rounded-xl px-2.5 py-1 text-center shadow-md">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-primary leading-none">
                          {datePill.month}
                        </span>
                        <span className="block text-base font-extrabold text-foreground leading-tight">
                          {datePill.day}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <CardContent className="flex flex-col flex-1 p-5 space-y-3">
                    {/* Event Title */}
                    <h3 className="font-bold text-base leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {event.name}
                    </h3>

                    {/* Location & Date details */}
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
                        <span className="truncate">{event.location}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
                        <span>{formatEventDate(event.startDate, event.endDate)}</span>
                      </p>
                    </div>

                    {/* Description snippet if present */}
                    {event.description && (
                      <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {/* Tags */}
                    {ecosystems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {ecosystems.map(eco => (
                          <span
                            key={eco}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-muted/80 text-muted-foreground font-medium"
                          >
                            {eco}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer Action */}
                    <div className="pt-3 mt-auto border-t border-border/40 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                        {event.source === 'curated-premier' ? (
                          <span className="text-muted-foreground font-semibold">
                            Curated
                          </span>
                        ) : (
                          event.source || 'Web3'
                        )}
                      </span>
                      <span className="font-medium text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        View Event
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-10">
          {Object.entries(eventsByMonth).map(([month, events]) => (
            <div key={month} className="space-y-4">
              {/* Month Header */}
              <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-md py-3 border-b border-border/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">{month}</h2>
                </div>
                <Badge variant="outline" className="font-medium text-xs">
                  {events.length} event{events.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Events in Month */}
              <div className="space-y-3">
                {events.map(event => {
                  const type = getEventType(event);
                  const format = getEventFormat(event);
                  const ecosystems = getEventEcosystems(event);
                  const datePill = getEventDatePill(event.startDate);
                  const relativeBadge = getRelativeBadge(event.startDate);
                  const slug = getEventSlug(event);

                  return (
                    <Link
                      key={event.id}
                      href={`/${slug}`}
                      className="block group"
                    >
                      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-sm transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                        {/* Date Left Box */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="w-14 h-14 rounded-xl bg-muted/60 border border-border/60 flex flex-col items-center justify-center text-center shrink-0">
                            <span className="text-[10px] font-bold text-primary uppercase">
                              {datePill.month}
                            </span>
                            <span className="text-lg font-extrabold text-foreground leading-none">
                              {datePill.day}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {datePill.dayName}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                                {event.name}
                              </h3>
                              {relativeBadge && (
                                <Badge className="bg-primary/90 text-primary-foreground text-[10px] px-2 py-0">
                                  {relativeBadge}
                                </Badge>
                              )}
                              {event.source === 'curated-premier' && (
                                <Badge variant="secondary" className="text-[10px] px-2 py-0">
                                  Curated
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground/80" />
                                {event.location}
                              </span>
                              <span>•</span>
                              <span>{formatEventDate(event.startDate, event.endDate)}</span>
                            </div>

                            {ecosystems.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {ecosystems.map(eco => (
                                  <span
                                    key={eco}
                                    className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium"
                                  >
                                    {eco}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right CTA */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors flex items-center gap-1.5 text-xs h-9 px-4"
                          >
                            <span>View Details</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-10" aria-hidden="true">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            <span>Loading more events...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-16 px-4 border-2 border-dashed border-border/80 rounded-2xl max-w-lg mx-auto">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-bold text-foreground">No matching Web3 events found</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            We couldn&apos;t find any events matching your selected filters or search terms.
          </p>
          <Button onClick={clearAllFilters} variant="outline" className="mt-5 rounded-xl">
            Clear all filters
          </Button>
        </div>
      )}

      {/* Host / Submit Event Callout */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-gradient-to-br from-card via-muted/30 to-card shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-lg font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Organizing a Web3 Conference or Hackathon?
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl">
            Get your event featured in front of 30,000+ monthly Web3 builders, developers, and crypto investors worldwide.
          </p>
        </div>
        <Button asChild className="rounded-xl shrink-0">
          <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <span>Submit Your Event</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      {/* Job Board & Community CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <CtaBanner variant="community" />
        <CtaBanner variant="jobs" />
      </div>
    </div>
  );
}
