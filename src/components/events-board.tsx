'use client';

import { useState, useMemo } from 'react';
import { Web3Event } from '@/lib/events';
import { Calendar, MapPin, Search, ArrowRight } from 'lucide-react';

export function EventsBoard({ initialEvents }: { initialEvents: Web3Event[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string | null>(null);

  const locations = useMemo(() => {
    const locs = new Set<string>();
    initialEvents.forEach(e => {
      if (e.location === 'Virtual / TBA' || e.location.toLowerCase().includes('virtual')) {
        locs.add('Virtual');
      } else {
        const country = e.location.split(',').pop()?.trim();
        if (country) locs.add(country);
      }
    });
    return Array.from(locs).sort();
  }, [initialEvents]);

  const filteredEvents = useMemo(() => {
    return initialEvents.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            event.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesLocation = true;
      if (locationFilter) {
        if (locationFilter === 'Virtual') {
          matchesLocation = event.location === 'Virtual / TBA' || event.location.toLowerCase().includes('virtual');
        } else {
          matchesLocation = event.location.includes(locationFilter);
        }
      }

      return matchesSearch && matchesLocation;
    });
  }, [initialEvents, searchTerm, locationFilter]);

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
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
        <div className="relative md:w-64 shrink-0">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <select
            value={locationFilter || ''}
            onChange={(e) => setLocationFilter(e.target.value === '' ? null : e.target.value)}
            className="w-full pl-11 pr-10 py-3 appearance-none bg-[#fafafa] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all cursor-pointer"
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>

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
        <div className="text-center py-12 text-muted-foreground border rounded-xl bg-card">
          <Calendar className="mx-auto h-12 w-12 opacity-20 mb-4" />
          <p className="text-lg">No events found matching your criteria.</p>
          <button 
            onClick={() => { setSearchTerm(''); setLocationFilter(null); }}
            className="mt-4 text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
