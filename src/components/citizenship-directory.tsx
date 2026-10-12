'use client';

import Link from 'next/link';
import { ListingCard, ListingCardHeader, ListingCardTitle } from '@/components/listing-card';
import { ListingToolbar } from '@/components/listing-toolbar';
import { CountryIdentity } from '@/components/nomads/city-identity';
import { useNomadQuery } from '@/components/nomads/hooks';
import { EmptyResults, ResourceLink, TableFrame, tableStyle } from '@/components/nomads/ui';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { citizenshipPath, filterPrograms, investmentAmount, selectedPrograms, sourceCheckedAt, type CitizenshipProgram } from '@/lib/citizenship';
import { cn } from '@/lib/utils';

export function CitizenshipDirectory({ programs }: { programs: CitizenshipProgram[] }) {
  const { params, update } = useNomadQuery();
  const selected = selectedPrograms(programs, params.get('compare'));
  const filtered = filterPrograms(programs, params);
  const reset = () => update({ q: null, kind: null, region: null, sort: null });
  const toggle = (slug: string) => update({ compare: selected.some(program => program.slug === slug) ? selected.filter(program => program.slug !== slug).map(program => program.slug).join(',') : selected.length < 3 ? [...selected.map(program => program.slug), slug].join(',') : params.get('compare') });
  return <>
    <ListingToolbar searchValue={params.get('q') || ''} onSearchChange={q => update({ q })} searchPlaceholder="Search countries or routes..." searchAriaLabel="Search citizenship programs" inputProps={{ type: 'search' }} resultCount={filtered.length} selects={[
      { label: 'Region', placeholder: 'All regions', value: params.get('region') || '', onChange: region => update({ region }), options: [...new Set(programs.map(program => program.region))].map(value => ({ value, label: value })) },
      { label: 'Investment route', placeholder: 'All routes', value: params.get('kind') || '', onChange: kind => update({ kind }), options: ['Contribution', 'Property'].map(value => ({ value, label: value })) },
      { label: 'Sort programs', placeholder: 'Country A to Z', value: params.get('sort') || '', onChange: sort => update({ sort }), options: [{ value: 'amount', label: 'Threshold: low to high (USD)' }] },
    ]} />
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Single applicant. Thresholds exclude fees. Select up to three countries.</p>{['q', 'kind', 'region', 'sort'].some(key => params.get(key)) && <Button variant="ghost" className="min-h-11" onClick={reset}>Clear filters</Button>}</div>
    {filtered.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map(program => {
      const checked = selected.some(item => item.slug === program.slug);
      const routes = program.routes.filter(route => !params.get('kind') || route.kind === params.get('kind'));
      const officialUrl = program.sources.find(source => source.id === routes[0]?.source)?.url || program.officialUrl;
      return <ListingCard key={program.slug} className={cn(checked && 'border-foreground/40 bg-muted/20')} role="article" aria-label={program.country}>
        <ListingCardHeader>
          <ListingCardTitle as="h2" className="line-clamp-none"><Link href={citizenshipPath(program.slug)} prefetch={false} className="inline-flex min-h-11 items-center rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><CountryIdentity name={program.country} code={program.code} /></Link></ListingCardTitle>
          <p className="text-xs text-muted-foreground">{program.status} · {program.region} · Investment citizenship</p>
        </ListingCardHeader>
        <CardContent className="flex flex-1 flex-col px-4 pb-4 pt-0">
        <p className="text-sm leading-relaxed">{program.summary}</p>
        <dl className="my-4 space-y-3">{routes.map(route => <div key={route.name}><dt className="text-sm text-muted-foreground">{route.name}</dt><dd className="text-xl font-semibold tabular-nums">{investmentAmount(route)}<span className="block text-xs font-normal text-muted-foreground">plus additional fees</span></dd></div>)}</dl>
        <p className="mt-auto text-xs text-muted-foreground">Sources checked <time dateTime={sourceCheckedAt(program)}>{sourceCheckedAt(program)}</time></p>
        <div className="mt-4 flex flex-wrap gap-2"><Button asChild className="h-auto min-h-11 whitespace-normal"><a href={officialUrl}>Official program</a></Button><Button asChild variant="outline" className="h-auto min-h-11 whitespace-normal"><Link href={citizenshipPath(program.slug)} prefetch={false}>Route details</Link></Button></div>
        <label htmlFor={`compare-${program.slug}`} className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm"><Checkbox id={`compare-${program.slug}`} checked={checked} disabled={!checked && selected.length === 3} onCheckedChange={() => toggle(program.slug)} />Compare {program.country}</label>
        </CardContent>
      </ListingCard>;
    })}</div> : <EmptyResults onReset={reset}>No citizenship programs match these filters.</EmptyResults>}
    <section className="mt-10" aria-labelledby="citizenship-comparison">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="citizenship-comparison" className="text-2xl font-semibold">Compare countries</h2>{selected.length > 0 && <Button variant="outline" className="h-auto min-h-11 whitespace-normal" onClick={() => update({ compare: null })}>Clear comparison</Button>}</div>
      <p className="mb-4 text-sm text-muted-foreground" role="status">{selected.length} of 3 selected. {selected.length < 2 ? 'Select at least two countries to compare.' : 'Your selection is saved in this page URL.'}</p>
      {selected.length > 0 && <div className="mb-4 flex flex-wrap gap-2">{selected.map(program => <Button key={program.slug} variant="outline" className="h-auto min-h-11 whitespace-normal" onClick={() => toggle(program.slug)}>Remove {program.country}</Button>)}</div>}
      {selected.length >= 2 && <TableFrame label="Citizenship program comparison"><table className={`${tableStyle} min-w-[640px]`}><caption className="sr-only">Single-applicant citizenship routes, excluding additional fees</caption><thead><tr><th scope="col">Compare</th>{selected.map(program => <th scope="col" key={program.slug}>{program.country}</th>)}</tr></thead><tbody>
        {[
          { label: 'Listed routes and thresholds', value: (program: CitizenshipProgram) => program.routes.map(route => `${route.name}: ${investmentAmount(route)} plus fees`).join('; ') },
          { label: 'Contribution or holding conditions', value: (program: CitizenshipProgram) => program.routes.map(route => `${route.name}: ${route.capital}`).join(' ') },
          { label: 'Additional fees', value: (program: CitizenshipProgram) => program.routes.map(route => `${route.name}: ${route.fees}`).join(' ') },
          { label: 'Presence', value: (program: CitizenshipProgram) => program.presence || 'Not verified in reviewed sources' },
          { label: 'Processing time', value: (program: CitizenshipProgram) => program.processing || 'Not verified in reviewed sources' },
          { label: 'Family', value: (program: CitizenshipProgram) => program.family || 'Not verified in reviewed sources' },
          { label: 'Sources checked', value: sourceCheckedAt },
        ].map(row => <tr key={row.label}><th scope="row">{row.label}</th>{selected.map(program => <td key={program.slug} className="min-w-56 max-w-sm align-top leading-relaxed">{row.value(program)}</td>)}</tr>)}
        <tr><th scope="row">Sources and details</th>{selected.map(program => <td key={program.slug}><div className="flex flex-wrap gap-x-4"><ResourceLink href={citizenshipPath(program.slug)}>Review {program.country}</ResourceLink><ResourceLink href={program.officialUrl}>Official program</ResourceLink></div></td>)}</tr>
      </tbody></table></TableFrame>}
    </section>
  </>;
}
