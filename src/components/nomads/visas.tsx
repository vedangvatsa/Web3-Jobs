'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowUpRight, Map as MapIcon } from 'lucide-react';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { VisaCard } from '@/components/digital-nomad-visas-client';
import { ListingToolbar } from '@/components/listing-toolbar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ENTRY_RULES, validPassportRules } from '@/lib/nomads/entry-rules';
import { safeExternalUrl, type PassportCountry, type PassportRules, type VisaProgramListing } from '@/lib/nomads/types';
import { useNomadData, useNomadQuery } from './hooks';
import { buttonStyle, primaryButtonStyle, EmptyResults, Field, FilterSelect, inputStyle, MetricCard, NomadPanel, SourceNote, TableFrame, tableStyle } from './ui';
import { CountryIdentity } from './city-identity';

const PassportMap = dynamic(() => import('./passport-map'), { ssr: false, loading: () => <p role="status" className="py-12 text-center text-sm text-muted-foreground">Loading map…</p> });

function Programs({ programs }: { programs: VisaProgramListing[] }) {
  const { params, update } = useNomadQuery();
  const query = params.get('q') || '', continent = params.get('continent') || '', income = params.get('income') || '';
  const ceiling = Number(income), validIncome = income === '' || (Number.isFinite(ceiling) && ceiling >= 0);
  const filtered = programs.filter(program => (!continent || program.continent === continent) &&
    (!query || `${program.country} ${program.description} ${program.requirements.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim())) &&
    (income === '' || !validIncome || program.minIncome <= ceiling)).sort((a, b) => a.country.localeCompare(b.country));
  const reset = () => update({ q: null, continent: null, income: null });
  return <>
    <ListingToolbar searchValue={query} onSearchChange={value => update({ q: value })} searchPlaceholder="Search countries, requirements…" searchAriaLabel="Search visa programs" inputProps={{ type: 'search', className: cn(inputStyle, 'pl-9') }} trailing={<>
      <FilterSelect aria-label="Continent" className="min-w-0 flex-1 md:w-44 md:flex-none" value={continent} onValueChange={value => update({ continent: value })}><option value="">All continents</option>{[...new Set(programs.map(program => program.continent))].sort().map(value => <option key={value}>{value}</option>)}</FilterSelect>
      <Input aria-label="Maximum income requirement (USD / month)" title="Maximum monthly income requirement in USD" className={cn(inputStyle, 'min-w-0 flex-1 md:w-44 md:flex-none')} type="number" min="0" step="100" placeholder="Max income (USD/mo)" value={income} aria-invalid={!validIncome} onChange={event => update({ income: event.target.value })} />
    </>} />
    {!validIncome && <p role="alert" className="mb-4 text-sm text-destructive">Enter a non-negative income amount.</p>}
    <div className="mb-5 flex items-center justify-between gap-4"><p className="text-sm text-muted-foreground" aria-live="polite">{filtered.length} program and remote-stay references</p>{(query || continent || income) && <button onClick={reset} className={buttonStyle}>Clear filters</button>}</div>
    {filtered.length ? <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map(program => <article key={program.id} className="h-full">
      <VisaCard visa={program}>
        {(program.fee || program.taxNotes) && <details><summary className="min-h-11 cursor-pointer py-3 text-xs font-medium">Additional program details</summary>{program.fee && <p className="mt-2 text-xs leading-relaxed">Fee reference: {program.fee}</p>}{program.taxNotes && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{program.taxNotes}</p>}</details>}
        {safeExternalUrl(program.officialUrl) && <a className="inline-flex min-h-11 items-center gap-2 text-xs font-medium text-primary hover:underline" href={program.officialUrl} target="_blank" rel="noopener noreferrer">Official program website<ArrowUpRight className="h-3.5 w-3.5" aria-hidden /></a>}
      </VisaCard>
    </article>)}</div> : <EmptyResults onReset={reset}>No programs match these filters.</EmptyResults>}
    <SourceNote>Approximate USD amounts are not live exchange-rate conversions. Some programs use annual income, savings or other eligibility tests; a missing monthly amount does not mean there are no financial requirements.</SourceNote>
  </>;
}

function PassportChecker({ countries }: { countries: PassportCountry[] }) {
  const { params, update } = useNomadQuery();
  const selected = countries.find(country => country.id === params.get('passport'));
  const query = params.get('destination') || '', filter = params.get('entry') || '';
  const [showMap, setShowMap] = useState(false);
  const { data, error, loading, retry } = useNomadData<PassportRules>(selected ? `/data/nomads/passports/${selected.id}.json` : null, validPassportRules);
  const rules = data?.passport === selected?.name ? data : null;
  const destinations = rules?.destinations.filter(item => item.name !== selected?.name) || [];
  const filtered = destinations.filter(item => (!query || item.name.toLowerCase().includes(query.trim().toLowerCase())) && (!filter || item.rule.t === filter)).sort((a, b) => a.name.localeCompare(b.name));
  return <>
    <NomadPanel className="mb-6"><div className="max-w-lg"><Field label="Your passport"><FilterSelect value={selected?.id || ''} onValueChange={value => update({ passport: value, destination: null, entry: null })}><option value="">Choose a passport</option>{[...countries].sort((a, b) => a.name.localeCompare(b.name)).map(country => <option key={country.id} value={country.id}>{country.name}</option>)}</FilterSelect></Field></div><p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">These references cover short-visit entry conditions for ordinary passports. Tourist entry does not automatically allow remote work or residence; use the program library for longer stays.</p></NomadPanel>
    {!selected && <div className="rounded-xl border border-dashed px-6 py-14 text-center"><h2 className="font-semibold">Where can your passport take you?</h2><p className="mt-2 text-sm text-muted-foreground">Choose a passport to browse entry references for destinations around the world.</p></div>}
    {loading && <p role="status" className="py-12 text-center">Loading entry references for {selected?.name}…</p>}
    {(error || (data && !rules)) && <NomadPanel role="alert"><p>Entry references could not be loaded.</p><button className={cn(buttonStyle, 'mt-4')} onClick={retry}>Try again</button></NomadPanel>}
    {rules && <>
      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{(['vf', 'voa', 'ev', 'vr'] as const).map(type => <MetricCard key={type} label={ENTRY_RULES[type].label} value={destinations.filter(item => item.rule.t === type).length} detail="destinations in this snapshot" />)}</dl>
      <button className={cn(buttonStyle, 'mb-5')} aria-expanded={showMap} aria-controls="passport-map" onClick={() => setShowMap(value => !value)}><MapIcon className="h-4 w-4" aria-hidden />{showMap ? 'Hide map' : 'Show entry map'}</button>
      {showMap && <div id="passport-map" className="mb-6"><PassportMap rules={rules} home={selected?.iso || null} /></div>}
      <div className="mb-5 grid gap-4 sm:grid-cols-2"><Field label="Search destinations"><input type="search" className={inputStyle} value={query} placeholder="Destination country" onChange={event => update({ destination: event.target.value })} /></Field><Field label="Entry category"><FilterSelect value={filter} onValueChange={value => update({ entry: value })}><option value="">All entry categories</option>{Object.entries(ENTRY_RULES).map(([type, rule]) => <option key={type} value={type}>{rule.label}</option>)}</FilterSelect></Field></div>
      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">{filtered.length} destinations for {rules.passport} passport holders</p>
      {filtered.length ? <TableFrame label="Passport entry references"><table className={tableStyle}><caption className="sr-only">Entry references for {rules.passport} passport holders</caption><thead><tr><th scope="col">Destination</th><th scope="col">Entry reference</th><th scope="col">Stay reference</th></tr></thead><tbody>{filtered.map(item => <tr key={item.name}><th scope="row" className="!bg-transparent !text-sm !text-foreground"><CountryIdentity name={item.name} code={item.iso} /></th><td>{ENTRY_RULES[item.rule.t].label}</td><td>{item.rule.d > 0 ? `${item.rule.d} days` : 'Not specified'}</td></tr>)}</tbody></table></TableFrame> : <EmptyResults onReset={() => update({ destination: null, entry: null })}>No destinations match these filters.</EmptyResults>}
    </>}
  </>;
}

export function NomadVisas({ programs, countries }: { programs: VisaProgramListing[]; countries: PassportCountry[] }) {
  const { params, update } = useNomadQuery();
  const checker = params.get('tab') === 'checker';
  return <div><ToolUsageTracker toolName="Digital Nomad Visas" /><div className="mb-7 flex flex-wrap gap-2" aria-label="Visa tools">{[['programs', 'Remote-stay programs'], ['checker', 'Passport checker']].map(([key, label]) => <button key={key} className={checker === (key === 'checker') ? primaryButtonStyle : buttonStyle} aria-pressed={checker === (key === 'checker')} onClick={() => update({ tab: key })}>{label}</button>)}</div>{checker ? <PassportChecker countries={countries} /> : <Programs programs={programs} />}</div>;
}
