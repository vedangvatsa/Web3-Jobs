'use client';
import { useState } from 'react';
import type { CitySummary, CityCosts } from '@/lib/nomads/types';
import { money } from '@/lib/nomads/types';
import { CityIdentity } from './city-identity';
import { useNomadQuery } from './hooks';
import { Field, FilterSelect, inputStyle, TableFrame, tableStyle, EmptyResults, SourceNote } from './ui';

export type CostCity = CitySummary & { costs: CityCosts };
export function LivingCosts({ cities }: { cities: CostCity[] }) {
  const { params, update } = useNomadQuery();
  const [income, setIncome] = useState('');
  const q = params.get('q') || '', region = params.get('region') || '', budget = params.get('budget') || '';
  const sort = ['monthly_total', 'rent', 'food', 'coworking', 'transport'].includes(params.get('sort') || '') ? params.get('sort')! : 'monthly_total';
  const filtered = cities.filter(city => (!q || `${city.name} ${city.country}`.toLowerCase().includes(q.trim().toLowerCase())) && (!region || city.continent === region) && (!budget || city.monthlyCost <= Number(budget))).sort((a, b) => a.costs[sort as keyof CityCosts] - b.costs[sort as keyof CityCosts]);
  const annualIncome = income !== '' && Number.isFinite(Number(income)) && Number(income) >= 0 ? Number(income) : null;
  return <div>
    <div className="mb-5 grid items-end gap-3 min-[375px]:grid-cols-2 lg:grid-cols-4">
      <Field label="Search cities"><input className={inputStyle} type="search" value={q} placeholder="City or country" onChange={event => update({ q: event.target.value || null })} /></Field>
      <Field label="Region"><FilterSelect value={region} onValueChange={value => update({ region: value || null })}><option value="">All regions</option>{[...new Set(cities.map(city => city.continent))].sort().map(value => <option key={value}>{value}</option>)}</FilterSelect></Field>
      <Field label="Maximum monthly cost (USD)"><input className={inputStyle} type="number" min="0" step="100" placeholder="Any budget" value={budget} onChange={event => update({ budget: event.target.value || null })} /></Field>
      <Field label="Monthly take-home income (USD)"><input className={inputStyle} type="number" min="0" step="100" placeholder="After tax (optional)" value={income} onChange={event => setIncome(event.target.value)} /></Field>
    </div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground" aria-live="polite">{filtered.length} cities{annualIncome !== null ? ` · ${filtered.filter(city => city.monthlyCost <= annualIncome).length} within your income` : ''}</p><FilterSelect aria-label="Sort by" className="w-48" value={sort} onValueChange={value => update({ sort: value })}>{[['monthly_total', 'Total monthly cost'], ['rent', 'Rent'], ['food', 'Food'], ['coworking', 'Workspace'], ['transport', 'Transport']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</FilterSelect></div>
    {filtered.length ? <TableFrame label="City living costs"><table className={tableStyle}><caption className="sr-only">Monthly living-cost estimates in USD</caption><thead><tr>{['City', 'Total / month', 'Rent', 'Food', 'Transport', 'Workspace', 'Other', ...(annualIncome !== null ? ['After living costs'] : [])].map((label, index) => <th key={label} scope="col" className={index ? 'text-right' : ''}>{label}</th>)}</tr></thead><tbody>{filtered.map(city => <tr key={city.slug}>
      <td><CityIdentity city={city} /></td>
      {(['monthly_total', 'rent', 'food', 'transport', 'coworking', 'other'] as const).map(key => <td key={key} className={`whitespace-nowrap text-right tabular-nums ${key === 'monthly_total' ? 'font-semibold' : 'text-muted-foreground'}`}>{money(city.costs[key])}</td>)}
      {annualIncome !== null && <td className={`whitespace-nowrap text-right font-medium tabular-nums ${annualIncome < city.monthlyCost ? 'text-destructive' : ''}`}>{money(annualIncome - city.monthlyCost)}</td>}
    </tr>)}</tbody></table></TableFrame> : <EmptyResults onReset={() => update({ q: null, region: null, budget: null })} />}
    <SourceNote>All amounts are monthly USD reference estimates. The remaining-income column subtracts estimated living costs from the take-home income you enter.</SourceNote>
  </div>;
}
