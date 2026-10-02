'use client';
import type { MonthlyClimate } from '@/lib/nomads/types';
import { metric } from '@/lib/nomads/types';
import { CityIdentity, type CityIdentityData } from './city-identity';
import { useNomadQuery } from './hooks';
import { Field, FilterSelect, inputStyle, TableFrame, tableStyle, EmptyResults, SourceNote } from './ui';

export type ClimateCity = CityIdentityData & { monthly: MonthlyClimate[] };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function ClimateFinder({ cities, initialMonth }: { cities: ClimateCity[]; initialMonth: number }) {
  const { params, update } = useNomadQuery();
  const rawMonth = params.get('month');
  const month = rawMonth !== null && /^\d+$/.test(rawMonth) && Number(rawMonth) < 12 ? Number(rawMonth) : initialMonth;
  const min = params.get('min') || '', max = params.get('max') || '', humidity = params.get('humidity') || '', rain = params.get('rain') || '';
  const invalidRange = min !== '' && max !== '' && Number(min) > Number(max);
  const filtered = invalidRange ? [] : cities.flatMap(city => {
    const weather = city.monthly[month];
    if (!weather) return [];
    if (min !== '' && (weather.temp === null || weather.temp < Number(min))) return [];
    if (max !== '' && (weather.temp === null || weather.temp > Number(max))) return [];
    if (humidity && (weather.humidity === null || (humidity === 'low' ? weather.humidity >= 40 : humidity === 'medium' ? weather.humidity < 40 || weather.humidity > 65 : weather.humidity <= 65))) return [];
    if (rain && (weather.rain === null || (rain === 'dry' ? weather.rain > 50 : rain === 'moderate' ? weather.rain <= 50 || weather.rain > 200 : weather.rain <= 200))) return [];
    return [{ ...city, weather }];
  }).sort((a, b) => (a.weather.temp ?? Infinity) - (b.weather.temp ?? Infinity));
  return <div><div className="mb-5 grid items-end gap-3 min-[375px]:grid-cols-2 lg:grid-cols-5">
    <Field label="Month" className="min-[375px]:col-span-2 lg:col-span-1"><FilterSelect value={month} onValueChange={value => update({ month: value })}>{MONTHS.map((name, index) => <option key={name} value={index}>{name}</option>)}</FilterSelect></Field>
    <Field label="Minimum temperature (°C)"><input className={inputStyle} type="number" min="-60" max="60" value={min} placeholder="Any" onChange={event => update({ min: event.target.value || null })} /></Field>
    <Field label="Maximum temperature (°C)"><input className={inputStyle} type="number" min="-60" max="60" value={max} placeholder="Any" onChange={event => update({ max: event.target.value || null })} /></Field>
    <Field label="Humidity"><FilterSelect value={humidity} onValueChange={value => update({ humidity: value || null })}><option value="">Any humidity</option><option value="low">Under 40%</option><option value="medium">40–65%</option><option value="high">Above 65%</option></FilterSelect></Field>
    <Field label="Rainfall"><FilterSelect value={rain} onValueChange={value => update({ rain: value || null })}><option value="">Any rainfall</option><option value="dry">Up to 50 mm</option><option value="moderate">50–200 mm</option><option value="rainy">Above 200 mm</option></FilterSelect></Field>
  </div>
    {invalidRange && <p role="alert" className="mb-4 text-sm text-destructive">Minimum temperature must not exceed maximum temperature.</p>}<p className="mb-4 text-sm text-muted-foreground" aria-live="polite">{filtered.length} cities match your preferences for {MONTHS[month]}.</p>
    {filtered.length ? <TableFrame label="Monthly climate comparison"><table className={tableStyle}><caption className="sr-only">Historical {MONTHS[month]} climate averages</caption><thead><tr><th scope="col">City</th><th scope="col" className="text-right">Temperature</th><th scope="col" className="text-right">Humidity</th><th scope="col" className="text-right">Rainfall</th></tr></thead><tbody>{filtered.map(city => <tr key={city.slug}><td><CityIdentity city={city} /></td><td className="text-right tabular-nums">{metric(city.weather.temp, '°C')}</td><td className="text-right tabular-nums">{metric(city.weather.humidity, '%')}</td><td className="text-right tabular-nums">{metric(city.weather.rain, ' mm')}</td></tr>)}</tbody></table></TableFrame> : <EmptyResults onReset={() => update({ min: null, max: null, humidity: null, rain: null })} />}
    <SourceNote>Monthly averages from the imported climate dataset. These describe historical patterns, not the forecast for your travel dates.</SourceNote>
  </div>;
}
