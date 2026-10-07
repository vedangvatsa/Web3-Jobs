'use client';

import dynamic from 'next/dynamic';
import { ArrowUpRight } from 'lucide-react';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { VisaCard } from '@/components/digital-nomad-visas-client';
import { ListingToolbar } from '@/components/listing-toolbar';
import { ListingViewTabs } from '@/components/listing-view-tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ENTRY_RULES, effectiveEntryRule, entryRuleLabel, matchesEntryCategory, validPassportRules } from '@/lib/nomads/entry-rules';
import { safeExternalUrl, type PassportCountry, type PassportRules, type VisaProgramListing } from '@/lib/nomads/types';
import { useNomadData, useNomadQuery } from './hooks';
import { buttonStyle, EmptyResults, FilterSelect, inputStyle, NomadPanel, TableFrame, tableStyle } from './ui';
import { CountryIdentity } from './city-identity';

const PassportMap = dynamic(() => import('./passport-map'), { ssr: false, loading: () => <div role="status" className="flex min-h-56 items-center justify-center rounded-lg border bg-muted/20 text-sm text-muted-foreground sm:min-h-96">Loading map...</div> });

function Programs({ programs }: { programs: VisaProgramListing[] }) {
  const { params, update } = useNomadQuery();
  const query = params.get('q') || '', continent = params.get('continent') || '', income = params.get('income') || '';
  const ceiling = Number(income), validIncome = income === '' || (Number.isFinite(ceiling) && ceiling >= 0);
  const filtered = programs.filter(program => (!continent || program.continent === continent) &&
    (!query || `${program.country} ${program.description} ${program.requirements.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim())) &&
    (income === '' || !validIncome || program.minIncome <= ceiling)).sort((a, b) => a.country.localeCompare(b.country));
  const reset = () => update({ q: null, continent: null, income: null });
  return <>
    {!validIncome && <p role="alert" className="mb-4 text-sm text-destructive">Enter a non-negative income amount.</p>}
    {(query || continent || income) && <div className="mb-6 flex justify-end"><button onClick={reset} className={buttonStyle}>Clear filters</button></div>}
    {filtered.length ? <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map(program => {
      const officialUrl = safeExternalUrl(program.officialUrl);
      return <article key={program.id} className="h-full">
      <VisaCard visa={program} headerAction={officialUrl ? <Button asChild variant="ghost" size="icon" className="h-11 w-11 shrink-0 text-muted-foreground"><a href={officialUrl} target="_blank" rel="noopener noreferrer" aria-label={`Official visa program website for ${program.country} (opens in a new tab)`} title={`Official program website for ${program.country}`}><ArrowUpRight className="h-4 w-4" aria-hidden /></a></Button> : undefined}>
        {(program.fee || program.taxNotes) && <details><summary className="min-h-11 cursor-pointer py-3 text-xs font-medium">Additional program details</summary>{program.fee && <p className="mt-2 text-xs leading-relaxed">Fee reference: {program.fee}</p>}{program.taxNotes && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{program.taxNotes}</p>}</details>}
      </VisaCard>
    </article>; })}</div> : <EmptyResults onReset={reset}>No programs match these filters.</EmptyResults>}
  </>;
}

function PassportChecker({ countries }: { countries: PassportCountry[] }) {
  const { params, update } = useNomadQuery();
  const selected = countries.find(country => country.id === params.get('passport'));
  const query = params.get('destination') || '', filter = params.get('entry') || '';
  const { data, error, loading, retry } = useNomadData<PassportRules>(selected ? `/data/nomads/passports/${selected.id}.json?v=3` : null, validPassportRules);
  const rules = data?.passport === selected?.name ? data : null;
  const destinations = rules?.destinations.filter(item => item.name !== selected?.name).map(item => ({ ...item, rule: effectiveEntryRule(item.rule, rules.sources) })) || [];
  const filtered = destinations.filter(item => (!query || item.name.toLowerCase().includes(query.trim().toLowerCase())) && (!filter || matchesEntryCategory(item.rule, filter))).sort((a, b) => a.name.localeCompare(b.name));
  const officialCount = destinations.filter(item => item.rule.t !== 'unknown' && item.rule.s && rules?.sources[item.rule.s]?.kind === 'government').length;
  const referenceCount = destinations.filter(item => item.rule.t !== 'unknown' && item.rule.s && rules?.sources[item.rule.s]?.kind === 'reference').length;
  return <>
    {!selected && <p className="py-6 text-sm text-muted-foreground">Choose a passport to see entry requirements.</p>}
    {loading && <p role="status" className="py-12 text-center">Loading entry references for {selected?.name}…</p>}
    {(error || (data && !rules)) && <NomadPanel role="alert"><p>Entry references could not be loaded.</p><button className={cn(buttonStyle, 'mt-4')} onClick={retry}>Try again</button></NomadPanel>}
    {rules && <>
      <div id="passport-map" className="mb-6"><PassportMap key={rules.passport} rules={{ ...rules, destinations }} home={selected?.iso || null} /></div>
      <p className="mb-2 text-sm text-muted-foreground">{rules.scope}</p>
      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">Showing {filtered.length} of {destinations.length} destinations · {officialCount} from government sources{referenceCount > 0 && ` · ${referenceCount} Passport Index references`}{destinations.length > officialCount + referenceCount && ` · ${destinations.length - officialCount - referenceCount} not yet verified`}<span className="sr-only"> for {rules.passport} passport holders</span></p>
      {filtered.length ? <TableFrame label="Passport entry references"><table className={tableStyle}><caption className="sr-only">Visitor entry for {rules.passport} passport holders</caption><thead><tr><th scope="col">Destination</th><th scope="col">Visitor entry and conditions</th><th scope="col">Stay reference</th></tr></thead><tbody>{filtered.map(item => {
        const source = item.rule.s ? rules.sources[item.rule.s] : undefined;
        const isReference = source?.kind === 'reference';
        const stay = item.rule.t === 'unknown' ? 'Not verified' : item.rule.t === 'na' ? 'Not applicable' : item.rule.stay || (item.rule.d > 0 ? `Up to ${item.rule.d} days` : isReference ? 'Not specified by source' : item.rule.t === 'fm' ? 'See residence rules' : 'See issued visa or entry pass');
        return <tr key={item.name}><th scope="row" className="!bg-transparent !text-sm !text-foreground"><CountryIdentity name={item.name} code={item.iso} /></th><td><span>{entryRuleLabel(item.rule)}</span>{source && <details className="mt-1 max-w-md"><summary className="min-h-11 cursor-pointer py-3 text-xs">{isReference ? 'Passport Index reference' : 'Conditions & sources'}</summary>{item.rule.n && <p className="text-xs leading-relaxed">{item.rule.n}</p>}<p className="mt-2 text-xs text-muted-foreground">{isReference ? 'Retrieved' : 'Checked'} {source.checkedAt}{item.rule.until && ` · Exemption ends ${item.rule.until}`}</p>{source.urls.map((url, index) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="mr-3 inline-flex min-h-11 items-center text-xs underline" aria-label={`${source.title}, source ${index + 1} for ${item.name} (opens in a new tab)`}>{isReference ? 'Passport Index' : 'Official source'}{source.urls.length > 1 ? ` ${index + 1}` : ''}</a>)}</details>}</td><td>{stay}</td></tr>;
      })}</tbody></table></TableFrame> : <EmptyResults onReset={() => update({ destination: null, entry: null })}>No destinations match these filters.</EmptyResults>}
    </>}
  </>;
}

export function NomadVisas({ programs, countries }: { programs: VisaProgramListing[]; countries: PassportCountry[] }) {
  const { params, update } = useNomadQuery();
  const checker = params.get('tab') === 'checker';
  const income = params.get('income') || '';
  const validIncome = income === '' || (Number.isFinite(Number(income)) && Number(income) >= 0);
  const passport = countries.find(country => country.id === params.get('passport'))?.id || '';
  const filterClass = 'min-w-0 flex-1 md:w-44 md:flex-none';
  return <Tabs value={checker ? 'checker' : 'programs'} onValueChange={value => update({ tab: value === 'checker' ? value : null })}>
    <ToolUsageTracker toolName="Digital Nomad Visas" />
    <ListingToolbar
      leading={<ListingViewTabs label="Visa tools" options={[{ value: 'programs', label: 'Visa programs' }, { value: 'checker', label: 'Passport checker' }]} />}
      searchValue={params.get(checker ? 'destination' : 'q') || ''}
      onSearchChange={value => update({ [checker ? 'destination' : 'q']: value })}
      searchPlaceholder={checker ? 'Search destinations...' : 'Search countries, requirements...'}
      searchAriaLabel={checker ? 'Search destinations' : 'Search visa programs'}
      inputProps={{ type: 'search', className: cn(inputStyle, 'pl-9'), disabled: checker && !passport }}
      trailing={checker ? <>
        <FilterSelect key="passport" aria-label="Your passport" className={filterClass} value={passport} onValueChange={value => update({ passport: value, destination: null, entry: null })}>
          <option value="">Your passport</option>{[...countries].sort((a, b) => a.name.localeCompare(b.name)).map(country => <option key={country.id} value={country.id}>{country.name}</option>)}
        </FilterSelect>
        <FilterSelect key="entry" aria-label="Entry category" className={filterClass} value={params.get('entry') || ''} disabled={!passport} onValueChange={value => update({ entry: value })}>
          <option value="">All entry categories</option>{Object.entries(ENTRY_RULES).map(([type, rule]) => <option key={type} value={type}>{rule.label}</option>)}
        </FilterSelect>
      </> : <>
        <FilterSelect key="continent" aria-label="Continent" className={filterClass} value={params.get('continent') || ''} onValueChange={value => update({ continent: value })}>
          <option value="">All continents</option>{[...new Set(programs.map(program => program.continent))].sort().map(value => <option key={value}>{value}</option>)}
        </FilterSelect>
        <Input key="income" aria-label="Maximum income requirement (USD / month)" title="Maximum monthly income requirement in USD" className={cn(inputStyle, filterClass)} type="number" min="0" step="100" placeholder="Max USD/mo" value={income} aria-invalid={!validIncome} onChange={event => update({ income: event.target.value })} />
      </>}
    />
    <TabsContent value="programs" className="mt-0"><Programs programs={programs} /></TabsContent>
    <TabsContent value="checker" className="mt-0"><PassportChecker countries={countries} /></TabsContent>
  </Tabs>;
}
