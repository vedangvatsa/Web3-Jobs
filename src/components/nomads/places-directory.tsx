'use client';

import { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { BedDouble, Building2, Home, Hotel, Users } from 'lucide-react';
import { type CitySummary, type CompactPlaces, type PlaceCategory, COMPACT_CATEGORIES, decodePlaces, PLACE_CATEGORIES, cityPath } from '@/lib/nomads/types';
import { useNomadData, useNomadQuery } from './hooks';
import { buttonStyle, inputStyle, Field, FilterSelect, EmptyResults, SourceNote } from './ui';
import { PlaceCard } from './place-card';
import { cn } from '@/lib/utils';

const PlacesMap = dynamic(() => import('./places-map'), { ssr: false, loading: () => <div role="status" className="flex h-[360px] items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground sm:h-[520px] lg:h-[600px]">Loading map…</div> });
const validPlaces = (value: unknown) => !!value && typeof value === 'object' && Array.isArray((value as CompactPlaces).cities) && Array.isArray((value as CompactPlaces).rows);
const categoryIcons = { coliving: Users, hostel: BedDouble, apartment: Home, guesthouse: Hotel, coworking: Building2 };

export function PlacesDirectory({ cities }: { cities: CitySummary[] }) {
  const { params, update } = useNomadQuery();
  const { data, error, loading, retry } = useNomadData<CompactPlaces>('/data/nomads/places.json', validPlaces);
  const allPlaces = useMemo(() => data ? decodePlaces(data) : [], [data]);
  const [limit, setLimit] = useState(30);
  const [focused, setFocused] = useState<{ id: string; request: number }>();
  const mapContainer = useRef<HTMLDivElement>(null);
  const q = params.get('q') || '';
  const selectedCity = cities.some(city => city.slug === params.get('city')) ? params.get('city')! : '';
  const categoriesParam = params.get('types') ?? params.get('type');
  const selectedCategories = useMemo(() => categoriesParam === null || categoriesParam === '' ? COMPACT_CATEGORIES : categoriesParam.split(',').filter((value): value is PlaceCategory => COMPACT_CATEGORIES.includes(value as PlaceCategory)), [categoriesParam]);
  const city = cities.find(city => city.slug === selectedCity);
  const basePlaces = useMemo(() => allPlaces.filter(place => (!selectedCity || place.citySlug === selectedCity) && (!q || `${place.name} ${place.address} ${place.citySlug}`.toLowerCase().includes(q.toLowerCase().trim()))), [allPlaces, q, selectedCity]);
  const filtered = useMemo(() => basePlaces.filter(place => selectedCategories.includes(place.category)).sort((a, b) => a.name.localeCompare(b.name)), [basePlaces, selectedCategories]);
  const counts = useMemo(() => Object.fromEntries(COMPACT_CATEGORIES.map(category => [category, basePlaces.filter(place => place.category === category).length])) as Record<PlaceCategory, number>, [basePlaces]);
  function filter(values: Record<string, string | null>) { setLimit(30); setFocused(undefined); update(values); }
  function toggleCategory(category: PlaceCategory) {
    const next = selectedCategories.includes(category) ? selectedCategories.filter(value => value !== category) : [...selectedCategories, category];
    filter({ type: null, types: next.length === COMPACT_CATEGORIES.length ? null : next.join(',') || 'none' });
  }
  function reset() { filter({ city: null, q: null, type: null, types: null }); }

  return <div>
    <div className="grid items-end gap-3 sm:grid-cols-2">
      <Field label="City"><FilterSelect aria-label="Places city" value={selectedCity} onValueChange={value => filter({ city: value || null })}><option value="">All cities</option>{[...cities].sort((a, b) => a.name.localeCompare(b.name)).map(city => <option key={city.slug} value={city.slug}>{city.name}, {city.country}</option>)}</FilterSelect></Field>
      <Field label="Search places"><input type="search" aria-label="Search nomad places" placeholder="Name or address" className={inputStyle} value={q} onChange={event => filter({ q: event.target.value || null })} /></Field>
    </div>
    <div className="my-4">
      <p className="text-sm text-muted-foreground" aria-live="polite">{loading ? 'Loading directory…' : `${filtered.length.toLocaleString('en-US')} places${city ? ` in ${city.name}` : ''}`}{city && <Link href={cityPath(city.slug)} prefetch={false} className="ml-3 font-medium text-primary hover:underline">City guide ↗</Link>}</p>
    </div>
    <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="group" aria-label="Place categories">
      {COMPACT_CATEGORIES.map(category => {
        const Icon = categoryIcons[category], active = selectedCategories.includes(category);
        return <button key={category} type="button" data-place-category={category} aria-pressed={active} onClick={() => toggleCategory(category)} className={cn('inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-full border px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-1.5 sm:px-3 sm:text-sm', category === 'coworking' && 'col-span-2', active ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background text-muted-foreground hover:bg-muted')}><Icon className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />{PLACE_CATEGORIES[category]}<span className="tabular-nums opacity-60">({counts[category].toLocaleString('en-US')})</span></button>;
      })}
      {selectedCategories.length !== COMPACT_CATEGORIES.length && <button className="min-h-11 px-2 text-xs font-medium underline underline-offset-4" onClick={() => filter({ type: null, types: null })}>Show all types</button>}
    </div>
    {error ? <div role="alert" className="rounded-lg border p-8 text-center"><p>We couldn’t load the places directory.</p><button className={cn(buttonStyle, 'mt-4')} onClick={retry}>Try again</button></div> : loading ? <div className="h-72 animate-pulse rounded-lg bg-muted" /> : <>
      <div ref={mapContainer} className="mb-5 scroll-mt-28"><PlacesMap places={filtered} cities={cities} selectedCity={selectedCity} focused={filtered.find(place => place.id === focused?.id)} focusRequest={focused?.request} /></div>
      {filtered.length ? <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.slice(0, limit).map(place => <li key={place.id} className="min-w-0"><PlaceCard place={place} cityName={cities.find(city => city.slug === place.citySlug)?.name} onLocate={() => {
        update({ city: place.citySlug, view: null });
        setFocused(previous => ({ id: place.id, request: (previous?.request || 0) + 1 }));
        requestAnimationFrame(() => mapContainer.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }} /></li>)}</ul> : <EmptyResults onReset={reset}>No places match these filters.</EmptyResults>}
      {limit < filtered.length && <div className="mt-6 text-center"><button className={buttonStyle} onClick={() => setLimit(value => value + 30)}>Show more places</button></div>}
    </>}
    <SourceNote>Opening hours, availability and facilities can change; the provider’s website has the current details.</SourceNote>
  </div>;
}
