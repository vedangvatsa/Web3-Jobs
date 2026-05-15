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
        <div className="flex gap-2 flex-wrap md:flex-nowrap overflow-x-auto pb-2 md:pb-0 hide-scrollbar items-center">
          <button 
            className={`px-4 py-2 text-sm rounded-full transition-colors whitespace-nowrap ${locationFilter === null ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
            onClick={() => setLocationFilter(null)}
          >
            All Locations
          </button>
          {locations.map(loc => (
            <button 
              key={loc}
              className={`px-4 py-2 text-sm rounded-full transition-colors whitespace-nowrap ${locationFilter === loc ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
              onClick={() => setLocationFilter(loc)}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-800/50 rounded-lg overflow-hidden">
        {filteredEvents.map(event => (
          <a 
            key={event.id}
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block h-full bg-[#fafafa] dark:bg-black hover:bg-white dark:hover:bg-zinc-900 transition-colors flex flex-col"
          >
            {event.coverImage ? (
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={event.coverImage} 
                  alt={event.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="h-48 w-full bg-muted flex items-center justify-center">
                <Calendar className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            
            <div className="p-8 flex flex-col flex-1">
              <div className="mb-4">
                <h3 className="font-bold text-[19px] leading-tight text-zinc-900 dark:text-zinc-50 mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {event.name}
                </h3>
                <div className="space-y-2.5 text-[14px] text-zinc-500 dark:text-zinc-400 font-medium">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 shrink-0 opacity-70" />
                    <span>{formatEventDate(event.startDate, event.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-6 flex-1">
                {event.description}
              </p>
              
              <div className="mt-auto flex items-center text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide uppercase">
                View Event <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
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
