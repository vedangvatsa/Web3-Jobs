'use client';
import { useMemo, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { timezoneOffsetMinutes, formatOffset, overlapSlots } from '@/lib/nomads/timezones';
import { calendarDay } from '@/lib/nomads/calculations';
import { useNomadQuery } from './hooks';
import { Field, FilterSelect, inputStyle, buttonStyle, MetricCard, NomadPanel, SourceNote } from './ui';
import { cn } from '@/lib/utils';

export type ZoneCity = { slug: string; name: string; country: string; timezone: string };
export function TimezonePlanner({ cities, today }: { cities: ZoneCity[]; today: string }) {
  const { params, update } = useNomadQuery();
  const raw = params.get('cities');
  const selected = [...new Set((raw || 'new-york,london,chiang-mai').split(','))].map(slug => cities.find(city => city.slug === slug)).filter((city): city is ZoneCity => !!city).slice(0, 4);
  const [date, setDate] = useState(today), [start, setStart] = useState('09:00'), [end, setEnd] = useState('18:00');
  const minutes = (value: string) => Number(value.split(':')[0]) * 60 + Number(value.split(':')[1]);
  const valid = calendarDay(date) !== null && !!start && !!end && start !== end;
  const rows = useMemo(() => valid ? overlapSlots(selected.map(city => city.timezone), date, minutes(start), minutes(end)) : [], [selected.map(city => city.slug).join(','), date, start, end, valid]);
  const shared = Array.from({ length: 96 }, (_, slot) => selected.length >= 2 && rows.length >= 2 && rows.every(row => row[slot]));
  const sharedMinutes = shared.filter(Boolean).length * 15;
  const offsets = valid ? selected.map(city => timezoneOffsetMinutes(city.timezone, new Date(`${date}T12:00:00Z`))) : [];
  const intervals: string[] = [];
  for (let index = 0; index < 96;) {
    if (!shared[index]) { index++; continue; }
    const first = index;
    while (index < 96 && shared[index]) index++;
    const label = (slot: number) => `${String(Math.floor(slot / 4)).padStart(2, '0')}:${String(slot % 4 * 15).padStart(2, '0')}`;
    intervals.push(`${label(first)}–${label(index)} UTC`);
  }
  return <div><NomadPanel className="mb-6"><div className="mb-5 flex flex-wrap gap-2">{selected.map(city => <button className={cn(buttonStyle, 'justify-between bg-muted')} key={city.slug} aria-label={`Remove ${city.name}`} onClick={() => update({ cities: selected.filter(item => item.slug !== city.slug).map(item => item.slug).join(',') || 'none' })}>{city.name}<X className="h-3.5 w-3.5" aria-hidden /></button>)}</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <Field label={`Add a city (${selected.length}/4)`}><FilterSelect aria-label="Add timezone city" disabled={selected.length >= 4} value="" onValueChange={value => { if (value) update({ cities: [...selected.map(city => city.slug), value].join(',') }); }}><option value="">Choose a city</option>{[...cities].filter(city => !selected.some(item => item.slug === city.slug)).sort((a, b) => a.name.localeCompare(b.name)).map(city => <option key={city.slug} value={city.slug}>{city.name}, {city.country}</option>)}</FilterSelect></Field>
    <Field label="Meeting date"><input className={inputStyle} type="date" value={date} onChange={event => setDate(event.target.value)} /></Field><Field label="Local workday starts"><input className={inputStyle} type="time" step="900" value={start} onChange={event => setStart(event.target.value)} /></Field><Field label="Local workday ends"><input className={inputStyle} type="time" step="900" value={end} onChange={event => setEnd(event.target.value)} /></Field>
  </div></NomadPanel>
    {!valid ? <p role="alert" className="rounded-xl border p-5 text-sm">Choose a valid date and two different workday times.</p> : selected.length < 2 ? <NomadPanel><Plus className="mb-2 h-5 w-5 text-muted-foreground" aria-hidden /><p>Add at least two cities to find shared working hours.</p></NomadPanel> : <><dl className="mb-6 grid gap-3 sm:grid-cols-2"><MetricCard label="Shared working time" value={`${Math.floor(sharedMinutes / 60)}h ${sharedMinutes % 60}m`} detail={`Across ${selected.length} cities on ${date}`} /><MetricCard label="Shared UTC windows" value={<span className="text-lg">{intervals.join(' · ') || 'No overlap'}</span>} detail="Each slot represents 15 minutes" /></dl><div role="region" aria-label="Working hours by timezone" tabIndex={0} className="overflow-x-auto rounded-xl border bg-card p-4"><div className="min-w-[700px]"><div className="mb-4 grid grid-cols-[150px_1fr] gap-4"><span className="text-xs text-muted-foreground">UTC timeline</span><div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">{[0, 3, 6, 9, 12, 15, 18, 21, 24].map(hour => <span key={hour}>{String(hour).padStart(2, '0')}:00</span>)}</div></div>{selected.map((city, cityIndex) => <div className="mb-4 grid grid-cols-[150px_1fr] items-center gap-4" key={city.slug}><div><h2 className="text-sm font-semibold">{city.name}</h2><p className="mt-1 text-xs text-muted-foreground">{formatOffset(offsets[cityIndex])}</p></div><div className="flex h-9 gap-px overflow-hidden rounded-md" aria-label={`${city.name} working hours`}>{rows[cityIndex]?.map((working, slot) => <div key={slot} className={cn('flex-1', shared[slot] ? 'bg-emerald-600' : working ? 'bg-primary/45' : 'bg-muted')} title={`${String(Math.floor(slot / 4)).padStart(2, '0')}:${String(slot % 4 * 15).padStart(2, '0')} UTC · ${working ? 'working time' : 'outside workday'}`} />)}</div></div>)}</div></div><div className="mt-3 flex flex-wrap gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-primary/45" />Working hours</span><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />Shared working hours</span></div></>}
    <SourceNote>IANA timezone rules account for daylight-saving changes on the chosen date. Workday times are local to each selected city; weekday and holiday schedules are not assumed.</SourceNote>
  </div>;
}
