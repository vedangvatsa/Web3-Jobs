'use client';

import { useState, useMemo } from 'react';
import { Web3Event } from '@/lib/events';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Web3 events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap md:flex-nowrap overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <Badge 
            variant={locationFilter === null ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setLocationFilter(null)}
          >
            All
          </Badge>
          {locations.map(loc => (
            <Badge 
              key={loc}
              variant={locationFilter === loc ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setLocationFilter(loc)}
            >
              {loc}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <a 
            key={event.id}
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block h-full bg-card hover:bg-accent/50 border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
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
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors">
                  {event.name}
                </h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>{formatEventDate(event.startDate, event.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm line-clamp-3 opacity-80">
                {event.description}
              </p>
              
              <div className="pt-2 flex items-center text-sm font-medium text-primary">
                View Details <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
