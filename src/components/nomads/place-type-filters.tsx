'use client';

import { BedDouble, Building2, Home, Hotel, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COMPACT_CATEGORIES, PLACE_CATEGORIES, type PlaceCategory } from '@/lib/nomads/types';
import { cn } from '@/lib/utils';

const icons = { coliving: Users, hostel: BedDouble, apartment: Home, guesthouse: Hotel, coworking: Building2 };

export function PlaceTypeFilters({ counts, selected, onToggle }: { counts: Record<PlaceCategory, number>; selected: readonly PlaceCategory[]; onToggle: (type: PlaceCategory) => void }) {
  return <div data-explorer-controls className="mb-6 flex flex-wrap justify-center gap-2" role="group" aria-label="Map place types">
    {COMPACT_CATEGORIES.map(type => {
      const Icon = icons[type], active = selected.includes(type);
      return <Button key={type} type="button" variant={active ? 'default' : 'outline'} data-place-category={type} aria-pressed={active} onClick={() => onToggle(type)} className={cn('h-11 min-w-0 gap-1.5 rounded-full border px-2 text-xs sm:px-3 sm:text-sm', active && 'border-primary')}>
        <Icon className="h-3.5 w-3.5" aria-hidden />{PLACE_CATEGORIES[type]}<span className="tabular-nums opacity-60">({counts[type].toLocaleString('en-US')})</span>
      </Button>;
    })}
  </div>;
}
