'use client';

import { useState, useMemo } from 'react';
import { Web3Event } from '@/lib/events';
import { Calendar, Search } from 'lucide-react';

const SELECT_STYLE = "w-full pl-4 pr-10 py-3 appearance-none bg-[#fafafa] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all cursor-pointer";

const CHEVRON = (
  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  </div>
);

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
  // Already a full name
  return raw.trim();
}

export function EventsBoard({ initialEvents }: { initialEvents: Web3Event[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState<string | null>(null);

  const countries = useMemo(() => {
    const set = new Set<string>();
    initialEvents.forEach(e => {
      if (e.country) set.add(normalizeCountry(e.country));
      else if (e.location === 'Online' || e.location?.toLowerCase().includes('online')) set.add('Online');
    });
    return Array.from(set).sort();
  }, [initialEvents]);

  const DATE_RANGES = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Next Month', value: 'next-month' },
    { label: 'This Year', value: 'year' },
  ];

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return initialEvents.filter(event => {
      // Search
      const q = searchTerm.toLowerCase();
      const matchesSearch = !q || event.name.toLowerCase().includes(q) || 
                            (event.description || '').toLowerCase().includes(q) ||
                            (event.location || '').toLowerCase().includes(q);

      // Country
      let matchesCountry = true;
      if (countryFilter) {
        if (countryFilter === 'Online') {
          matchesCountry = event.location === 'Online' || event.location?.toLowerCase().includes('online');
        } else {
          matchesCountry = normalizeCountry(event.country) === countryFilter || event.location?.includes(countryFilter);
        }
      }

      // Date range
      let matchesDate = true;
      if (monthFilter) {
        const eventDate = new Date(event.startDate);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (monthFilter) {
          case 'today':
            matchesDate = eventDate >= today && eventDate < new Date(today.getTime() + 86400000);
            break;
          case 'week': {
            const weekEnd = new Date(today.getTime() + 7 * 86400000);
            matchesDate = eventDate >= today && eventDate < weekEnd;
            break;
          }
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
  }, [initialEvents, searchTerm, countryFilter, monthFilter]);

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (startStr === endStr) return startStr;
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
    }
    return `${startStr} - ${endStr}`;
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#fafafa] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all"
          />
        </div>
        <div className="relative md:w-48 shrink-0">
          <select
            value={countryFilter || ''}
            onChange={(e) => setCountryFilter(e.target.value === '' ? null : e.target.value)}
            className={SELECT_STYLE}
          >
            <option value="">All Locations</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {CHEVRON}
        </div>
        <div className="relative md:w-52 shrink-0">
          <select
            value={monthFilter || ''}
            onChange={(e) => setMonthFilter(e.target.value === '' ? null : e.target.value)}
            className={SELECT_STYLE}
          >
            <option value="">All Dates</option>
            {DATE_RANGES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {CHEVRON}
        </div>
      </div>

      {/* Count */}
      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.15em] mb-5">
        {filteredEvents.length.toLocaleString()} events found
      </p>

      {/* Event List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {filteredEvents.map(event => (
          <a 
            key={event.id}
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center p-4 md:p-5 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50 mr-4">
              {event.coverImage ? (
                <img 
                  src={event.coverImage} 
                  alt={event.name} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Calendar className="h-5 w-5 text-zinc-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-[15px] md:text-[16px] font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {event.name}
              </h3>
              <div className="mt-1 flex items-center text-[13px] text-zinc-500 dark:text-zinc-400">
                <span className="truncate max-w-[140px] md:max-w-[200px]">{event.location}</span>
                <span className="mx-1.5 opacity-50">&middot;</span>
                <span className="whitespace-nowrap shrink-0">{formatEventDate(event.startDate, event.endDate)}</span>
              </div>
            </div>
            
            <div className="shrink-0 ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
            </div>
          </a>
        ))}
      </div>
      
      {filteredEvents.length === 0 && (
        <div className="text-center py-12 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50">
          <Calendar className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">No events match your filters.</p>
          <button 
            onClick={() => { setSearchTerm(''); setCountryFilter(null); setMonthFilter(null); }}
            className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
