'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, GitCompare, X } from 'lucide-react';
import { type CitySummary, money } from '@/lib/nomads/types';
import { CityCard } from './city-card';
import { useNomadQuery } from './hooks';
import { buttonStyle, primaryButtonStyle, inputStyle, Field, FilterSelect, EmptyResults } from './ui';
import { cn } from '@/lib/utils';

export function CityExplorer({ cities }: { cities: CitySummary[] }) {
  const { params, update } = useNomadQuery();
  const [limit, setLimit] = useState(12);
  const q = params.get('q') || '', continent = params.get('region') || '', budget = params.get('budget') || '', speed = params.get('internet') || '', sort = params.get('sort') || 'score';
  const compared = [...new Set((params.get('compare') || '').split(',').filter(slug => cities.some(city => city.slug === slug)))].slice(0, 2);
  const filtered = cities.filter(city => (!q || `${city.name} ${city.country}`.toLowerCase().includes(q.toLowerCase().trim())) && (!continent || city.continent === continent) && (!budget || city.monthlyCost <= Number(budget)) && (!speed || (city.internetMbps !== null && city.internetMbps >= Number(speed)))).sort((a, b) => sort === 'cost' ? a.monthlyCost - b.monthlyCost : sort === 'internet' ? (b.internetMbps ?? -1) - (a.internetMbps ?? -1) : sort === 'name' ? a.name.localeCompare(b.name) : (b.score ?? -1) - (a.score ?? -1));
  function filter(values: Record<string, string | null>) { setLimit(12); update(values); }
  function toggle(slug: string) { const next = compared.includes(slug) ? compared.filter(value => value !== slug) : [...compared, slug].slice(0, 2); update({ compare: next.join(',') || null }); }
  return <section aria-label="Explore cities" className={cn(compared.length && 'pb-28')}>
    <div className="mb-5 grid items-end gap-3 min-[375px]:grid-cols-2 lg:grid-cols-4">
      <Field label="Find a city"><input className={inputStyle} aria-label="Search nomad cities" placeholder="City or country" value={q} onChange={event => filter({ q: event.target.value || null })} type="search" /></Field>
      <Field label="Region"><FilterSelect aria-label="Filter cities by region" value={continent} onValueChange={value => filter({ region: value || null })}><option value="">All regions</option>{[...new Set(cities.map(city => city.continent))].sort().map(region => <option key={region}>{region}</option>)}</FilterSelect></Field>
      <Field label="Monthly budget"><FilterSelect aria-label="Monthly city budget" value={budget} onValueChange={value => filter({ budget: value || null })}><option value="">Any budget</option>{[1000, 1500, 2000, 3000, 4000].map(amount => <option key={amount} value={amount}>Up to {money(amount)}</option>)}</FilterSelect></Field>
      <Field label="Internet benchmark"><FilterSelect aria-label="Minimum internet speed" value={speed} onValueChange={value => filter({ internet: value || null })}><option value="">Any speed</option>{[25, 50, 100, 200].map(value => <option value={value} key={value}>{value}+ Mbps</option>)}</FilterSelect></Field>
    </div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p aria-live="polite" className="text-sm text-muted-foreground"><strong className="text-foreground">{filtered.length}</strong> of {cities.length} cities</p><div className="flex items-center gap-3">{(q || continent || budget || speed) && <button onClick={() => filter({ q: null, region: null, budget: null, internet: null })} className="min-h-11 text-sm underline underline-offset-4">Clear filters</button>}<FilterSelect aria-label="Sort cities" className="w-40" value={sort} onValueChange={value => filter({ sort: value })}><option value="score">Nomad score</option><option value="cost">Lowest cost</option><option value="internet">Fastest internet</option><option value="name">City name</option></FilterSelect></div></div>
    {filtered.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.slice(0, limit).map(city => <CityCard key={city.slug} city={city}>
      <button aria-label={`${compared.includes(city.slug) ? 'Remove' : 'Add'} ${city.name} ${compared.includes(city.slug) ? 'from' : 'to'} comparison`} aria-pressed={compared.includes(city.slug)} disabled={compared.length === 2 && !compared.includes(city.slug)} className={cn(buttonStyle, 'w-full text-xs', compared.includes(city.slug) && 'border-primary text-primary')} onClick={() => toggle(city.slug)}><GitCompare className="h-3.5 w-3.5" aria-hidden />{compared.includes(city.slug) ? 'Selected for comparison' : 'Compare city'}</button>
    </CityCard>)}</div> : <EmptyResults onReset={() => filter({ q: null, region: null, budget: null, internet: null })} />}
    {filtered.length > limit && <div className="mt-8 text-center"><button onClick={() => setLimit(value => value + 12)} className={buttonStyle}>Show more cities <ArrowRight className="h-4 w-4" aria-hidden /></button></div>}
    {compared.length > 0 && <aside aria-label="Selected cities to compare" className="fixed inset-x-3 bottom-4 z-30 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-3 shadow-lg"><div className="flex flex-wrap gap-2">{compared.map(slug => <button key={slug} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-muted px-3 text-sm" onClick={() => toggle(slug)} aria-label={`Remove ${cities.find(city => city.slug === slug)?.name} from comparison`}>{cities.find(city => city.slug === slug)?.name}<X className="h-3.5 w-3.5" aria-hidden /></button>)}{compared.length === 1 && <span className="self-center text-xs text-muted-foreground">Choose one more city</span>}</div>{compared.length === 2 && <Link href={`/nomads/compare?a=${compared[0]}&b=${compared[1]}`} prefetch={false} className={primaryButtonStyle}>Compare <ArrowRight className="h-4 w-4" aria-hidden /></Link>}</aside>}
  </section>;
}
