'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, BedDouble, Building2, CheckSquare2, GitCompare, Home, Hotel, Printer, SlidersHorizontal, Square, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CountryFlag } from '@/components/country-flag';
import { CLIMATE_MONTHS, RANK_CATEGORIES, compareCityRank, comparisonSlugs, isClimateCategory, matchesClimate, rankCategory, rankingLabel, rankingValue, searchText } from '@/lib/nomads/explorer';
import { type ExplorerCity, type CompactPlaces, type PlaceCategory, COMPACT_CATEGORIES, PLACE_CATEGORIES, cityPath, decodePlaces, money } from '@/lib/nomads/types';
import { CityThumbnail } from './city-thumbnail';
import { useNomadData, useNomadQuery } from './hooks';
import { buttonStyle, primaryButtonStyle, inputStyle, Field, FilterSelect, EmptyResults } from './ui';
import { cn } from '@/lib/utils';

const PlacesMap = dynamic(() => import('./places-map'), { ssr: false, loading: () => <div className="flex h-[340px] items-center justify-center rounded-lg border bg-muted/20 text-sm text-muted-foreground sm:h-[420px] lg:h-[460px]" role="status">Loading map...</div> });
const CompareCities = dynamic(() => import('./compare').then(module => module.CompareCities), { loading: () => <p role="status">Loading comparison...</p> });
const CityReport = dynamic(() => import('./city-report'), { ssr: false });
const validPlaces = (value: unknown) => !!value && typeof value === 'object' && Array.isArray((value as CompactPlaces).cities) && Array.isArray((value as CompactPlaces).rows);
const categoryIcons = { coliving: Users, hostel: BedDouble, apartment: Home, guesthouse: Hotel, coworking: Building2 };

export function CityExplorer({ cities, date, referencePeriod }: { cities: ExplorerCity[]; date: string; referencePeriod: string }) {
  const { params, update } = useNomadQuery();
  const { data, loading, error, retry } = useNomadData<CompactPlaces>('/data/nomads/places.json', validPlaces);
  const allPlaces = useMemo(() => data ? decodePlaces(data) : [], [data]);
  const [limit, setLimit] = useState(6);
  const [report, setReport] = useState<{ cities: ExplorerCity[]; ranking: string } | null>(null);
  const selectedCity = cities.find(city => city.slug === params.get('city'));
  const q = params.get('q') || selectedCity?.name || '';
  const region = params.get('region') || '', budget = params.get('budget') || '', speed = params.get('internet') || '';
  const category = rankCategory(params.get('category') || params.get('tab') || params.get('sort'));
  const definition = RANK_CATEGORIES.find(item => item.key === category)!;
  const ascending = params.has('direction') ? params.get('direction') === 'asc' : definition.ascending;
  const climate = isClimateCategory(category);
  const rawMonth = Number(params.get('month'));
  const month = params.has('month') && Number.isInteger(rawMonth) && rawMonth >= 0 && rawMonth < 12 ? rawMonth : new Date(`${date}T12:00:00Z`).getUTCMonth();
  const climateFilters = { min: params.get('min') || '', max: params.get('max') || '', humidity: params.get('humidity') || '', rain: params.get('rain') || '' };
  const invalidRange = climate && climateFilters.min !== '' && climateFilters.max !== '' && Number(climateFilters.min) > Number(climateFilters.max);
  const weatherFilterCount = Object.values(climateFilters).filter(Boolean).length;
  const needle = searchText(q);
  const namedCities = useMemo(() => new Set(cities.filter(city => !needle || searchText(`${city.name} ${city.country} ${city.slug}`).includes(needle)).map(city => city.slug)), [cities, needle]);
  const namedPlaces = useMemo(() => allPlaces.filter(place => needle && searchText(`${place.name} ${place.address}`).includes(needle)), [allPlaces, needle]);
  const placeCities = useMemo(() => new Set(namedPlaces.map(place => place.citySlug)), [namedPlaces]);
  const matchedPlaces = useMemo(() => new Set(namedPlaces.map(place => place.id)), [namedPlaces]);
  const filtered = useMemo(() => cities.filter(city =>
    (!selectedCity || city.slug === selectedCity.slug) && (!region || city.continent === region) &&
    (!budget || city.cost.monthly_total <= Number(budget)) && (!speed || (city.internet?.download_mbps ?? -1) >= Number(speed)) &&
    (!needle || namedCities.has(city.slug) || placeCities.has(city.slug)) &&
    (!climate || (!invalidRange && matchesClimate(city, month, climateFilters)))
  ).sort((a, b) => compareCityRank(a, b, category, month, ascending)), [cities, selectedCity, region, budget, speed, needle, namedCities, placeCities, climate, invalidRange, month, climateFilters.min, climateFilters.max, climateFilters.humidity, climateFilters.rain, category, ascending]);
  const visibleCityKey = filtered.map(city => city.slug).sort().join(',');
  const visibleCityIds = useMemo(() => new Set(visibleCityKey.split(',').filter(Boolean)), [visibleCityKey]);
  const basePlaces = useMemo(() => allPlaces.filter(place => visibleCityIds.has(place.citySlug) && (!needle || namedCities.has(place.citySlug) || matchedPlaces.has(place.id))), [allPlaces, visibleCityIds, needle, namedCities, matchedPlaces]);
  const categoriesParam = params.get('types') ?? params.get('type');
  const selectedCategories = useMemo(() => categoriesParam === null || categoriesParam === '' ? COMPACT_CATEGORIES : categoriesParam.split(',').filter((value): value is PlaceCategory => COMPACT_CATEGORIES.includes(value as PlaceCategory)), [categoriesParam]);
  const mapPlaces = useMemo(() => basePlaces.filter(place => selectedCategories.includes(place.category)), [basePlaces, selectedCategories]);
  const counts = useMemo(() => Object.fromEntries(COMPACT_CATEGORIES.map(type => [type, basePlaces.filter(place => place.category === type).length])) as Record<PlaceCategory, number>, [basePlaces]);
  const focus = mapPlaces.find(place => place.id === params.get('place')) || (needle && !namedCities.size && mapPlaces.length === 1 ? mapPlaces[0] : undefined);
  const compareOpen = params.get('view') === 'compare';
  const pair = comparisonSlugs(cities, params);
  const compared = compareOpen || (!params.get('compare') && (params.get('a') || params.get('b'))) ? pair : [...new Set((params.get('compare') || '').split(',').filter(slug => cities.some(city => city.slug === slug)))].slice(0, 2);
  function filter(values: Record<string, string | null>) { setLimit(6); update({ place: null, ...values }); }
  function reset() { filter({ q: null, city: null, region: null, budget: null, internet: null, min: null, max: null, humidity: null, rain: null, type: null, types: null }); }
  function toggle(slug: string) { const next = compared.includes(slug) ? compared.filter(value => value !== slug) : [...compared, slug].slice(0, 2); update({ compare: next.join(',') || null, a: null, b: null }); }
  function togglePlaceType(type: PlaceCategory) { const next = selectedCategories.includes(type) ? selectedCategories.filter(value => value !== type) : [...selectedCategories, type]; update({ types: next.length === COMPACT_CATEGORIES.length ? null : next.join(',') || 'none', type: null }); }
  const onPrintReady = useCallback(() => window.print(), []);
  useEffect(() => { const close = () => setReport(null); window.addEventListener('afterprint', close); return () => window.removeEventListener('afterprint', close); }, []);

  return <section aria-label="Explore destinations" className={cn('nomad-explorer', compared.length && 'pb-24')}>
    <div className="nomad-explorer-screen">
      <div data-explorer-controls className="mb-4 grid items-end gap-3 min-[375px]:grid-cols-2 lg:grid-cols-4">
        <Field label="Search"><input className={inputStyle} aria-label="Search cities and places" placeholder="City, country or place" value={q} onChange={event => filter({ q: event.target.value || null, city: null })} type="search" /></Field>
        <Field label="Region"><FilterSelect aria-label="Filter destinations by region" value={region} onValueChange={value => filter({ region: value || null })}><option value="">All regions</option>{[...new Set(cities.map(city => city.continent))].sort().map(value => <option key={value}>{value}</option>)}</FilterSelect></Field>
        <Field label="Monthly budget"><FilterSelect aria-label="Monthly city budget" value={budget} onValueChange={value => filter({ budget: value || null })}><option value="">Any budget</option>{[1000, 1500, 2000, 3000, 4000].map(amount => <option key={amount} value={amount}>Up to {money(amount)}</option>)}</FilterSelect></Field>
        <div className="flex min-w-0 items-end gap-2"><Field label="Rank by" className="flex-1"><FilterSelect aria-label="Rank destinations by" value={category} onValueChange={value => filter({ category: value === 'score' ? null : value, tab: null, sort: null, direction: null })}>{RANK_CATEGORIES.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}</FilterSelect></Field><Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label={ascending ? 'Switch to highest first' : 'Switch to lowest first'} title={ascending ? 'Lowest first' : 'Highest first'} onClick={() => update({ direction: ascending ? 'desc' : 'asc' })}>{ascending ? <ArrowUpWideNarrow className="h-4 w-4" /> : <ArrowDownWideNarrow className="h-4 w-4" />}</Button></div>
      </div>
      {climate && <div data-explorer-controls className="mb-4 flex flex-wrap items-end gap-2">
        <Field label="Climate month" className="w-48"><FilterSelect aria-label="Climate month" value={month} onValueChange={value => filter({ month: value })}>{CLIMATE_MONTHS.map((name, index) => <option key={name} value={index}>{name}</option>)}</FilterSelect></Field>
        <Popover><PopoverTrigger asChild><Button variant="outline" className="h-11 gap-2"><SlidersHorizontal className="h-4 w-4" aria-hidden />Weather filters{weatherFilterCount ? ` (${weatherFilterCount})` : ''}</Button></PopoverTrigger><PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)]"><div className="grid grid-cols-2 gap-3">
          <Field label="Minimum temperature (°C)"><input className={inputStyle} type="number" value={climateFilters.min} placeholder="Any" onChange={event => filter({ min: event.target.value || null })} /></Field>
          <Field label="Maximum temperature (°C)"><input className={inputStyle} type="number" value={climateFilters.max} placeholder="Any" onChange={event => filter({ max: event.target.value || null })} /></Field>
          <Field label="Humidity"><FilterSelect value={climateFilters.humidity} onValueChange={value => filter({ humidity: value || null })}><option value="">Any humidity</option><option value="low">Under 40%</option><option value="medium">40-65%</option><option value="high">Above 65%</option></FilterSelect></Field>
          <Field label="Rainfall"><FilterSelect value={climateFilters.rain} onValueChange={value => filter({ rain: value || null })}><option value="">Any rainfall</option><option value="dry">Up to 50 mm</option><option value="moderate">50-200 mm</option><option value="rainy">Above 200 mm</option></FilterSelect></Field>
        </div>{weatherFilterCount > 0 && <Button variant="ghost" className="mt-2" onClick={() => filter({ min: null, max: null, humidity: null, rain: null })}>Clear weather filters</Button>}</PopoverContent></Popover>
      </div>}
      {invalidRange && <p role="alert" className="mb-4 text-sm text-destructive">Minimum temperature must not exceed maximum temperature.</p>}
      <div data-explorer-controls className="mb-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="group" aria-label="Map place types">{COMPACT_CATEGORIES.map(type => { const Icon = categoryIcons[type]; return <button key={type} type="button" data-place-category={type} aria-pressed={selectedCategories.includes(type)} onClick={() => togglePlaceType(type)} className={cn('inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-full border px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3 sm:text-sm', type === 'coworking' && 'col-span-2', selectedCategories.includes(type) ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background text-muted-foreground')}><Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />{PLACE_CATEGORIES[type]}<span className="tabular-nums opacity-60">({counts[type].toLocaleString('en-US')})</span></button>; })}</div>
      <div id="places-map" className="mb-5 scroll-mt-20">
        {error ? <div role="alert" className="rounded-lg border p-6 text-center"><p>The map could not be loaded.</p><Button variant="outline" className="mt-3" onClick={retry}>Try again</Button></div> : loading ? <div role="status" className="flex h-[340px] items-center justify-center rounded-lg border bg-muted/20 text-sm sm:h-[420px] lg:h-[460px]">Loading places...</div> : <PlacesMap places={mapPlaces} cities={cities} selectedCity={selectedCity?.slug || (filtered.length === 1 ? filtered[0].slug : '')} viewportKey={visibleCityKey} fitFiltered={filtered.length < cities.length} focused={focus} />}
      </div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-sm text-muted-foreground">{filtered.length} cities{climate ? ` · ${CLIMATE_MONTHS[month]}` : ''}</p>
        <div data-explorer-controls className="flex flex-wrap items-center gap-2">
          {Boolean(q || region || budget || speed || weatherFilterCount) && <Button variant="ghost" onClick={reset}>Clear filters</Button>}
          <Button asChild variant="ghost"><Link href="/digital-nomad-visas" prefetch={false}>Visas & entry ↗</Link></Button>
          <Button variant="ghost" size="icon" className="h-11 w-11" disabled={!filtered.length || !!report} aria-label={report ? 'Preparing city report' : 'Print city report'} title="Print / save city report as PDF" onClick={() => setReport({ cities: filtered.slice(0, 50), ranking: `${definition.label}${climate ? ` · ${CLIMATE_MONTHS[month]}` : ''}` })}><Printer className="h-4 w-4" aria-hidden /></Button>
        </div>
      </div>
      {filtered.length ? <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-label="Ranked destinations">{filtered.slice(0, limit).map((city, index) => <li key={city.slug}>
        <Card data-nomad-city={city.slug} className={cn('flex min-w-0 items-center gap-1 border-border/70 p-2 shadow-none transition-colors hover:border-foreground/25', compared.includes(city.slug) && 'border-foreground/40 bg-muted/20')}>
          <Link href={cityPath(city.slug)} prefetch={false} className="flex min-w-0 flex-1 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="relative shrink-0"><CityThumbnail src={city.thumbnail} className="h-12 w-12" /><span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded bg-background px-1 text-[10px] font-medium tabular-nums ring-1 ring-border" aria-label={`Rank ${index + 1}`}>{rankingValue(city, category, month) === null ? '-' : index + 1}</span></span>
            <span className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold" title={city.name}>{city.name}</h2><span className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground"><CountryFlag code={city.countryCode} className="h-4 w-4 text-sm" /><span className="truncate" title={city.country}>{city.country}</span></span></span>
            <span className="shrink-0 text-right"><span className={cn('block whitespace-nowrap text-sm font-semibold tabular-nums', rankingValue(city, category, month) === null && 'text-[10px]')} aria-label={`${definition.label}: ${rankingLabel(city, category, month)}`}>{rankingLabel(city, category, month)}</span><span className="mt-1 block text-[10px] tabular-nums text-muted-foreground">{category === 'cost' ? 'USD / month' : `${money(city.cost.monthly_total)} / mo`}</span></span>
          </Link>
          <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label={`${compared.includes(city.slug) ? 'Remove' : 'Add'} ${city.name} ${compared.includes(city.slug) ? 'from' : 'to'} comparison`} aria-pressed={compared.includes(city.slug)} title="Select two cities to compare" disabled={compared.length === 2 && !compared.includes(city.slug)} onClick={() => toggle(city.slug)}>{compared.includes(city.slug) ? <CheckSquare2 className="h-4 w-4" /> : <Square className="h-4 w-4 text-muted-foreground" />}</Button>
        </Card>
      </li>)}</ol> : <EmptyResults onReset={reset} />}
      {filtered.length > limit && <div data-explorer-controls className="mt-5 text-center"><button onClick={() => setLimit(value => value + 12)} className={buttonStyle}>Show more cities</button></div>}
      {compared.length > 0 && <aside data-explorer-controls aria-label="Selected cities to compare" className="fixed inset-x-3 bottom-4 z-30 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-2 rounded-lg border bg-background p-3 shadow-sm"><div className="flex flex-wrap items-center gap-2">{compared.map(slug => <button key={slug} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-muted px-3 text-sm" onClick={() => toggle(slug)} aria-label={`Remove ${cities.find(city => city.slug === slug)?.name} from comparison`}>{cities.find(city => city.slug === slug)?.name}<X className="h-3.5 w-3.5" aria-hidden /></button>)}{compared.length === 1 && <span className="text-xs text-muted-foreground">Choose one more city</span>}</div>{compared.length === 2 && <button onClick={() => update({ view: 'compare', a: compared[0], b: compared[1] })} className={primaryButtonStyle}><GitCompare className="h-4 w-4" aria-hidden />Compare</button>}</aside>}
    </div>
    <Sheet open={compareOpen} onOpenChange={open => { if (!open) update({ view: null, compare: pair.join(',') }); }}>
      <SheetContent side="right" className="w-full overflow-y-auto p-4 sm:max-w-3xl sm:p-6 [&>button]:h-11 [&>button]:w-11 [&>button]:inline-flex [&>button]:items-center [&>button]:justify-center" onCloseAutoFocus={event => { event.preventDefault(); document.querySelector<HTMLButtonElement>('[aria-label="Selected cities to compare"] > button')?.focus(); }}>
        <SheetHeader className="mb-5 pr-12"><SheetTitle className="text-2xl">Compare cities</SheetTitle><SheetDescription className="sr-only">Choose two cities to compare their living costs, climate and connectivity.</SheetDescription></SheetHeader>
        <CompareCities cities={cities} date={date} />
      </SheetContent>
    </Sheet>
    {report && <div className="hidden print:block"><CityReport cities={report.cities} referencePeriod={referencePeriod} ranking={report.ranking} onReady={onPrintReady} /></div>}
  </section>;
}
