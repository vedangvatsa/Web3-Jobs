'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';
import type { CitySummary, NomadCity } from '@/lib/nomads/types';
import { cityPath, metric, money } from '@/lib/nomads/types';
import { timezoneOffsetMinutes, formatOffset } from '@/lib/nomads/timezones';
import { useNomadData, useNomadQuery } from './hooks';
import { CitySelect, buttonStyle, NomadPanel, TableFrame, tableStyle, SourceNote } from './ui';
import { CityImage } from './city-image';
import { CountryIdentity } from './city-identity';

const validCity = (value: unknown) => !!value && typeof value === 'object' && typeof (value as NomadCity).slug === 'string' && !!(value as NomadCity).cost && Array.isArray((value as NomadCity).weather?.monthly);

export function CompareCities({ cities, date }: { cities: CitySummary[]; date: string }) {
  const { params, update } = useNomadQuery();
  const a = cities.some(city => city.slug === params.get('a')) ? params.get('a')! : 'lisbon';
  const requestedB = params.get('b');
  const b = requestedB !== a && cities.some(city => city.slug === requestedB) ? requestedB! : a === 'chiang-mai' ? 'lisbon' : 'chiang-mai';
  const first = useNomadData<NomadCity>(`/data/nomads/cities/${a}.json`, validCity), second = useNomadData<NomadCity>(`/data/nomads/cities/${b}.json`, validCity);
  const [copied, setCopied] = useState<string | null>(null), [copyError, setCopyError] = useState<string | null>(null);
  const sharePath = `/compare-cities?a=${a}&b=${b}`;
  const isCopied = copied === sharePath;
  async function copyComparison() {
    try { await navigator.clipboard.writeText(`${window.location.origin}${sharePath}`); setCopied(sharePath); setCopyError(null); }
    catch { setCopied(null); setCopyError(sharePath); }
  }
  const pair = [first.data, second.data];
  const rows: Array<{ label: string; value: (city: NomadCity) => string }> = [
    { label: 'Monthly total estimate', value: city => money(city.cost.monthly_total) },
    { label: 'Rent', value: city => money(city.cost.rent) }, { label: 'Food', value: city => money(city.cost.food) },
    { label: 'Transport', value: city => money(city.cost.transport) }, { label: 'Workspace', value: city => money(city.cost.coworking) }, { label: 'Other monthly costs', value: city => money(city.cost.other) },
    { label: 'Download benchmark', value: city => metric(city.internet?.download_mbps, ' Mbps') }, { label: 'Upload benchmark', value: city => metric(city.internet?.upload_mbps, ' Mbps') },
    { label: 'Average temperature', value: city => metric(city.weather.avg_temp, '°C') }, { label: 'Annual rainfall', value: city => metric(city.weather.annual_rain, ' mm') },
    { label: 'Listed places', value: city => String(city.spaces.total) }, { label: 'Coworking spaces', value: city => String(city.spaces.coworking) },
    { label: 'Safety reference score', value: city => metric(city.safety, ' / 10') }, { label: 'Walkability reference score', value: city => metric(city.walkability?.walk, ' / 10') },
    { label: `UTC offset on ${date}`, value: city => formatOffset(timezoneOffsetMinutes(city.timezone, new Date(`${date}T12:00:00Z`))) },
  ];
  return <div>
    <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 sm:gap-3">
      <CitySelect label="First city" cities={cities} value={a} onChange={value => update({ a: value, ...(value === b && { b: a }) })} />
      <button className={`${buttonStyle} w-11 px-0`} aria-label="Swap cities" title="Swap cities" onClick={() => update({ a: b, b: a })}><ArrowLeftRight className="h-4 w-4" aria-hidden /></button>
      <CitySelect label="Second city" cities={cities} value={b} exclude={a} onChange={value => update({ b: value })} />
    </div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Monthly reference estimates in USD.</p><button className={buttonStyle} onClick={copyComparison}>{isCopied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}{isCopied ? 'Link copied' : 'Copy comparison link'}</button></div>
    {copyError === sharePath && <p role="status" className="mb-5 text-sm text-muted-foreground">Copying was unavailable. You can copy this comparison’s URL from your browser’s address bar.</p>}
    {first.error || second.error ? <NomadPanel role="alert"><p>We couldn’t load a city’s details.</p><button className={buttonStyle} onClick={() => { first.retry(); second.retry(); }}>Try again</button></NomadPanel> : !pair[0] || !pair[1] ? <div className="h-96 animate-pulse rounded-xl bg-muted" aria-label="Loading comparison" /> : <>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-5">{pair.map(city => <Link key={city!.slug} href={cityPath(city!.slug)} prefetch={false} className="group min-w-0 overflow-hidden rounded-lg border border-border/70 bg-card transition-colors hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <CityImage name={city!.name} country={city!.country} src={city!.image} thumbnail={city!.thumbnail} sizes="(min-width: 1152px) 552px, 50vw" className="aspect-auto h-24 sm:h-40" />
        <div className="p-3 sm:p-4"><h2 className="break-words text-base font-semibold sm:text-xl">{city!.name}</h2><p className="mt-1 text-xs text-muted-foreground"><CountryIdentity name={city!.country} code={city!.countryCode} /></p><p className="mt-3 text-lg font-semibold tabular-nums sm:text-2xl">{money(city!.cost.monthly_total)}<span className="mt-0.5 block text-xs font-normal text-muted-foreground">per month est.</span></p></div>
      </Link>)}</div>
      <TableFrame label="City comparison"><table className={tableStyle}><caption className="sr-only">Compare {pair[0].name} and {pair[1].name}</caption><thead><tr><th scope="col">Measure</th>{pair.map(city => <th scope="col" className="text-right" key={city!.slug}>{city!.name}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th>{pair.map(city => <td className="text-right tabular-nums" key={city!.slug}>{row.value(city!)}</td>)}</tr>)}</tbody></table></TableFrame>
    </>}
    <SourceNote>Living-cost estimates and reference scores share the same source snapshot. Timezone offsets use IANA rules for the displayed date; they can change with daylight saving.</SourceNote>
  </div>;
}
