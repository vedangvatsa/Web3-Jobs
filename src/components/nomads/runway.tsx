'use client';
import { useState } from 'react';
import type { CitySummary } from '@/lib/nomads/types';
import { money } from '@/lib/nomads/types';
import { CityIdentity } from './city-identity';
import { savingsRunway } from '@/lib/nomads/calculations';
import { useNomadQuery } from './hooks';
import { Field, FilterSelect, inputStyle, MetricCard, TableFrame, tableStyle, SourceNote } from './ui';

export function RunwayCalculator({ cities }: { cities: CitySummary[] }) {
  const { params, update } = useNomadQuery();
  const [savings, setSavings] = useState('50000'), [reserve, setReserve] = useState('5000'), [income, setIncome] = useState('0'), [multiplier, setMultiplier] = useState('1');
  const selected = params.get('city') || '';
  const valid = [savings, reserve, income].every(value => value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0);
  const rows = cities.filter(city => !selected || city.slug === selected).map(city => ({ city, months: valid ? savingsRunway(Number(savings), Number(reserve), city.monthlyCost, Number(income), Number(multiplier)) : null })).sort((a, b) => (b.months ?? -1) - (a.months ?? -1));
  const formatRunway = (value: number | null) => value === null ? '—' : value === Infinity ? 'Costs covered' : `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)} months`;
  return <div><div className="mb-6 grid items-end gap-3 min-[375px]:grid-cols-2 lg:grid-cols-5">
    <Field label="Total savings (USD)"><input className={inputStyle} type="number" min="0" value={savings} onChange={event => setSavings(event.target.value)} /></Field>
    <Field label="Keep as a reserve (USD)"><input className={inputStyle} type="number" min="0" value={reserve} onChange={event => setReserve(event.target.value)} /></Field>
    <Field label="Monthly take-home income (USD)"><input className={inputStyle} type="number" min="0" value={income} onChange={event => setIncome(event.target.value)} /></Field>
    <Field label="Spending assumption"><FilterSelect value={multiplier} onValueChange={setMultiplier}><option value="0.8">20% below</option><option value="1">City estimate</option><option value="1.2">20% above</option><option value="1.5">50% above</option></FilterSelect></Field>
    <Field label="Focus on a city" className="min-[375px]:col-span-2 lg:col-span-1"><FilterSelect value={selected} onValueChange={value => update({ city: value || null })}><option value="">Compare all cities</option>{[...cities].sort((a, b) => a.name.localeCompare(b.name)).map(city => <option value={city.slug} key={city.slug}>{city.name}, {city.country}</option>)}</FilterSelect></Field>
  </div>
    {!valid && <p role="alert" className="mb-4 text-sm text-destructive">Enter non-negative amounts for savings, reserve and income.</p>}<dl className="mb-6 grid grid-cols-2 gap-3"><MetricCard label="Available after reserve" value={valid ? money(Math.max(0, Number(savings) - Number(reserve))) : '—'} /><MetricCard label="Longest modeled runway" value={<span className="text-xl">{formatRunway(rows[0]?.months ?? null)}</span>} detail={rows[0]?.city.name} /></dl>
    <TableFrame label="Savings runway by city"><table className={tableStyle}><caption className="sr-only">Savings runway using your assumptions</caption><thead><tr>{['City', 'Modeled monthly spending', 'Monthly drawdown', 'Runway'].map((label, index) => <th key={label} scope="col" className={index ? 'text-right' : ''}>{label}</th>)}</tr></thead><tbody>{rows.map(({ city, months }) => <tr key={city.slug}><td><CityIdentity city={city} /></td><td className="whitespace-nowrap text-right tabular-nums">{money(city.monthlyCost * Number(multiplier))}</td><td className="whitespace-nowrap text-right tabular-nums">{valid ? money(Math.max(0, city.monthlyCost * Number(multiplier) - Number(income))) : '—'}</td><td className="whitespace-nowrap text-right font-medium tabular-nums">{formatRunway(months)}</td></tr>)}</tbody></table></TableFrame>
    <SourceNote>This is a cash-runway model with constant costs and income. It does not project investment returns, inflation or tax. “Costs covered” means the entered income covers modeled spending, not permanent financial independence.</SourceNote>
  </div>;
}
