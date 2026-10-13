'use client';

import { useEffect } from 'react';
import { ListingCard, ListingCardHeader, ListingCardTitle } from '@/components/listing-card';
import { ListingToolbar } from '@/components/listing-toolbar';
import { CountryIdentity } from '@/components/nomads/city-identity';
import { useNomadQuery } from '@/components/nomads/hooks';
import { EmptyResults, ResourceLink, TableFrame, tableStyle } from '@/components/nomads/ui';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { filterPrograms, investmentAmount, officialProgramUrl, programRoutes, selectedPrograms, startingInvestments, type CitizenshipProgram } from '@/lib/citizenship';
import { cn } from '@/lib/utils';

const disclosureStyle = 'min-h-11 cursor-pointer content-center rounded-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function CitizenshipDirectory({ programs }: { programs: CitizenshipProgram[] }) {
  const { params, update } = useNomadQuery();
  const selected = selectedPrograms(programs, params.get('compare'));
  const filtered = filterPrograms(programs, params);
  const kind = params.get('kind');
  const hasFilters = ['q', 'kind', 'region'].some(key => params.get(key));
  const reset = () => update({ q: null, kind: null, region: null, sort: null });
  const clearComparison = () => update({ compare: null });
  const toggle = (slug: string) => update({ compare: selected.some(program => program.slug === slug) ? selected.filter(program => program.slug !== slug).map(program => program.slug).join(',') : selected.length < 3 ? [...selected.map(program => program.slug), slug].join(',') : params.get('compare') });

  useEffect(() => {
    // Cards hydrate after the browser's initial fragment scroll.
    const frame = requestAnimationFrame(() => {
      const slug = window.location.hash.slice(1);
      if (programs.some(program => program.slug === slug)) document.getElementById(slug)?.scrollIntoView();
    });
    return () => cancelAnimationFrame(frame);
  }, [programs]);

  return <>
    <ListingToolbar
      searchValue={params.get('q') || ''}
      onSearchChange={q => update({ q })}
      searchPlaceholder="Search countries or routes..."
      searchAriaLabel="Search citizenship programs"
      inputProps={{ type: 'search' }}
      selects={[
        { label: 'Region', placeholder: 'All regions', value: params.get('region') || '', onChange: region => update({ region }), options: [...new Set(programs.map(program => program.region))].sort().map(value => ({ value, label: value })), className: 'md:w-40' },
        { label: 'Investment route', placeholder: 'All routes', value: kind || '', onChange: kind => update({ kind }), options: [...new Set(programs.flatMap(program => program.routes.map(route => route.kind)))].sort().map(value => ({ value, label: value })), className: 'md:w-40' },
      ]}
    />
    <p className="sr-only" role="status">{filtered.length} countries. {selected.length} of 3 selected for comparison.</p>
    {(hasFilters || selected.length >= 2) && <div className="mb-4 flex flex-wrap justify-end gap-3">
      {hasFilters && <Button variant="ghost" className="min-h-11" onClick={reset}>Clear filters</Button>}
      {selected.length >= 2 && <Button asChild variant="outline" className="min-h-11"><a href="#citizenship-comparison">Compare countries</a></Button>}
    </div>}
    {filtered.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(program => {
      const checked = selected.some(item => item.slug === program.slug);
      const disabled = !checked && selected.length === 3;
      const routes = programRoutes(program, kind);
      return <ListingCard key={program.slug} id={program.slug} className={cn('scroll-mt-24', checked && 'border-foreground/40 bg-muted/20')} role="article" aria-label={program.country}>
        <ListingCardHeader>
          <ListingCardTitle as="h2" className="flex min-h-11 items-center line-clamp-none"><CountryIdentity name={program.country} code={program.code} /></ListingCardTitle>
        </ListingCardHeader>
        <CardContent className="flex flex-1 flex-col px-4 pb-3 pt-0">
          <div className="mb-3 space-y-1">
            {startingInvestments(routes).map(route => <p key={route.currency || route.name} className="text-base font-semibold tabular-nums">{route.amount !== null && <span className="text-xs font-normal text-muted-foreground">From </span>}{program.status === 'Intake unverified' ? 'Intake unverified' : investmentAmount(route)}</p>)}
            <p className="text-xs text-muted-foreground">{[...new Set(routes.map(route => route.kind))].join(' · ')}</p>
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 border-t border-border/60 pt-2">
            <ResourceLink href={officialProgramUrl(program, kind)}>Official program</ResourceLink>
            <label htmlFor={`compare-${program.slug}`} className={cn('flex min-h-11 items-center gap-2 rounded-sm text-sm', disabled ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer')}>
              <Checkbox id={`compare-${program.slug}`} checked={checked} disabled={disabled} onCheckedChange={() => toggle(program.slug)} />
              Compare<span className="sr-only"> {program.country}</span>
            </label>
          </div>
        </CardContent>
      </ListingCard>;
    })}</div> : <EmptyResults onReset={reset}>No citizenship programs match these filters.</EmptyResults>}

    {selected.length === 1 && <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <CountryIdentity name={selected[0].country} code={selected[0].code} />
      <Button variant="ghost" className="min-h-11" onClick={clearComparison}>Clear comparison</Button>
    </div>}

    {selected.length >= 2 && <section className="mt-8" aria-labelledby="citizenship-comparison">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="citizenship-comparison" className="scroll-mt-24 text-2xl font-semibold">Compare countries</h2>
        <Button variant="ghost" className="min-h-11" onClick={clearComparison}>Clear comparison</Button>
      </div>
      <TableFrame label="Citizenship program comparison">
        <table className={cn(tableStyle, 'relative table-fixed min-w-[640px] [&_thead_th]:whitespace-normal [&_th]:align-top [&_td]:align-top', selected.length === 3 && 'min-w-[880px]')}>
          <caption className="sr-only">Citizenship routes for one applicant, plus additional fees. Amounts use each authority&apos;s published currency.</caption>
          <colgroup><col className="w-40" />{selected.map(program => <col key={program.slug} />)}</colgroup>
          <thead><tr><th scope="col">Country</th>{selected.map(program => <th scope="col" key={program.slug}>
            <span className="inline-flex min-h-11 items-center text-base text-foreground"><CountryIdentity name={program.country} code={program.code} /></span>
            <Button variant="ghost" className="flex h-auto min-h-11 min-w-11 px-0 text-xs text-muted-foreground" onClick={() => toggle(program.slug)} aria-label={`Remove ${program.country}`}>Remove</Button>
          </th>)}</tr></thead>
          <tbody>
            <tr><th scope="row">Investment</th>{selected.map(program => <td key={program.slug}>
              <dl className="space-y-4">{program.routes.map(route => <div key={route.name}>
                <dt className="text-xs text-muted-foreground">{route.name}</dt>
                <dd className="mt-1 font-semibold tabular-nums">{investmentAmount(route)}<span className="mt-0.5 block text-xs font-normal text-muted-foreground">{route.kind}</span></dd>
              </div>)}</dl>
            </td>)}</tr>
            <tr><th scope="row">Holding conditions</th>{selected.map(program => <td key={program.slug}>
              <details><summary className={disclosureStyle}>Conditions by route<span className="sr-only"> for {program.country}</span></summary>
                <dl className="mt-2 space-y-4">{program.routes.map(route => <div key={route.name}><dt className="mb-1 font-medium">{route.name}</dt><dd className="leading-relaxed text-muted-foreground">{route.capital}</dd></div>)}</dl>
              </details>
            </td>)}</tr>
            <tr><th scope="row">Additional fees</th>{selected.map(program => <td key={program.slug}>
              <details><summary className={disclosureStyle}>Fees by route<span className="sr-only"> for {program.country}</span></summary>
                <dl className="mt-2 space-y-4">{program.routes.map(route => <div key={route.name}><dt className="mb-1 font-medium">{route.name}</dt><dd className="leading-relaxed text-muted-foreground">{route.fees}</dd></div>)}</dl>
              </details>
            </td>)}</tr>
            {[
              { label: 'Presence', value: (program: CitizenshipProgram) => program.presence },
              { label: 'Processing time', value: (program: CitizenshipProgram) => program.processing },
              { label: 'Family', value: (program: CitizenshipProgram) => program.family },
            ].filter(row => selected.some(program => row.value(program))).map(row => <tr key={row.label}><th scope="row">{row.label}</th>{selected.map(program => <td key={program.slug} className="leading-relaxed text-muted-foreground">{row.value(program) || 'Not specified'}</td>)}</tr>)}
            <tr><th scope="row">Sources</th>{selected.map(program => <td key={program.slug}><ResourceLink href={program.officialUrl}>Official program</ResourceLink></td>)}</tr>
          </tbody>
        </table>
      </TableFrame>
    </section>}
  </>;
}
