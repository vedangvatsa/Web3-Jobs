'use client';
import { useState } from 'react';
import type { TaxReference } from '@/lib/nomads/types';
import { money } from '@/lib/nomads/types';
import { taxScenario } from '@/lib/nomads/calculations';
import { CountryIdentity } from './city-identity';
import { Field, inputStyle, MetricCard, NomadPanel, TableFrame, tableStyle, SourceNote } from './ui';

export function TaxPlanning({ countries }: { countries: TaxReference[] }) {
  const [q, setQuery] = useState(''), [income, setIncome] = useState('60000'), [rate, setRate] = useState('');
  const scenario = income !== '' && rate !== '' ? taxScenario(Number(income), Number(rate)) : null;
  const rows = countries.filter(country => `${country.country} ${country.notes}`.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => a.rate - b.rate);
  return <div><NomadPanel className="mb-8" role="group" aria-label="Tax estimate"><div className="grid items-end gap-4 sm:grid-cols-2"><Field label="Annual income (USD)"><input className={inputStyle} type="number" min="0" value={income} onChange={event => setIncome(event.target.value)} /></Field><Field label="Assumed effective tax rate (%)"><input className={inputStyle} type="number" min="0" max="100" step="0.1" placeholder="Enter your assumption" value={rate} onChange={event => setRate(event.target.value)} /></Field></div><dl className="mt-5 grid grid-cols-2 gap-3"><MetricCard label="Modeled annual tax" value={scenario ? money(scenario.tax) : '—'} /><MetricCard label="After modeled tax" value={scenario ? money(scenario.remaining) : '—'} /></dl>{rate !== '' && !scenario && <p role="alert" className="mt-3 text-sm text-destructive">Use a non-negative income and a rate between 0% and 100%.</p>}</NomadPanel>
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><h2 className="text-xl font-semibold">Country reference notes</h2><div className="w-full sm:max-w-xs"><Field label="Search tax references"><input className={inputStyle} type="search" value={q} onChange={event => setQuery(event.target.value)} placeholder="Country or condition" /></Field></div></div>
    <TableFrame label="Country tax reference notes"><table className={tableStyle}><caption className="sr-only">Imported tax references and eligibility conditions</caption><thead><tr><th scope="col">Country</th><th scope="col" className="text-right">Source reference</th><th scope="col">Conditions and context</th><th scope="col">Authority</th></tr></thead><tbody>{rows.map(country => <tr key={country.country}><td className="whitespace-nowrap font-medium"><CountryIdentity name={country.country} emoji={country.emoji} /></td><td className="whitespace-nowrap text-right tabular-nums">{country.rate}%</td><td className="min-w-64 max-w-xl text-sm leading-relaxed text-muted-foreground">{country.notes}</td><td><a href={`https://${country.source}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center whitespace-nowrap font-medium text-primary">Source ↗</a></td></tr>)}</tbody></table></TableFrame>
    <SourceNote>Country references are dated June 2026 and may have eligibility conditions. Estimates use the income and effective rate you enter.</SourceNote>
  </div>;
}
