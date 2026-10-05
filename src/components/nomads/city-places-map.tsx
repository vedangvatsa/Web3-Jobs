'use client';

import { useMemo, useState } from 'react';
import { COMPACT_CATEGORIES, type CitySummary, type NomadPlace, type PlaceCategory } from '@/lib/nomads/types';
import { PlaceTypeFilters } from './place-type-filters';
import { PlacesMapClient } from './places-map-client';

export function CityPlacesMap({ city, places }: { city: Pick<CitySummary, 'slug' | 'name' | 'country' | 'lat' | 'lon'>; places: NomadPlace[] }) {
  const [selected, setSelected] = useState<readonly PlaceCategory[]>(COMPACT_CATEGORIES);
  const visible = useMemo(() => places.filter(place => selected.includes(place.category)), [places, selected]);
  const counts = useMemo(() => Object.fromEntries(COMPACT_CATEGORIES.map(type => [type, places.filter(place => place.category === type).length])) as Record<PlaceCategory, number>, [places]);
  return <>
    <PlaceTypeFilters counts={counts} selected={selected} onToggle={type => setSelected(current => current.includes(type) ? current.filter(value => value !== type) : [...current, type])} />
    {!places.length && <p className="mb-4 text-sm text-muted-foreground">No stays or workspaces are listed in {city.name} yet.</p>}
    <PlacesMapClient places={visible} cities={[city]} selectedCity={city.slug} />
  </>;
}
