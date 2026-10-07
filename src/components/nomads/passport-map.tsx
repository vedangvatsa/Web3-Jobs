'use client';

import WorldMap, { regions, type ISOCode } from 'react-svg-worldmap';
import { Card } from '@/components/ui/card';
import { ENTRY_RULES, entryRuleLabel, matchesEntryCategory } from '@/lib/nomads/entry-rules';
import type { EntryRule, PassportRules } from '@/lib/nomads/types';

const supported = new Set(regions.map(region => region.code.toUpperCase()));

export default function PassportMap({ rules, home }: { rules: PassportRules; home: string | null }) {
  const data = rules.destinations.filter(item => item.iso && supported.has(item.iso.toUpperCase())).map(item => ({
    country: item.iso!.toLowerCase() as ISOCode,
    value: item.iso === home ? 'home' : item.rule.t,
  }));
  if (home && supported.has(home.toUpperCase()) && !data.some(item => item.country === home.toLowerCase())) data.push({ country: home.toLowerCase() as ISOCode, value: 'home' });
  const label = (value?: string) => value === 'home' ? 'Passport country' : ENTRY_RULES[value as EntryRule['t']]?.label || ENTRY_RULES.unknown.label;
  const destinations = rules.destinations.filter(item => item.name !== rules.passport);
  const byCountry = new Map(destinations.map(item => [item.iso?.toUpperCase(), item.rule]));
  return <Card className="min-w-0 overflow-hidden border-border/70 p-3 shadow-none sm:p-5">
    <div className="mx-auto max-w-3xl">
      <WorldMap data={data} size="xl" title={`Entry reference map for ${rules.passport} passport holders`} backgroundColor="transparent" borderColor="#e4e4e7" strokeOpacity={1} richInteraction
        containerClassName="[&_figure]:m-0 [&_figure]:flex [&_figure]:justify-center [&_figcaption]:sr-only [&_svg]:block [&_svg]:max-w-full [&_svg]:focus:outline-none [&_svg:focus-visible]:ring-2 [&_svg:focus-visible]:ring-ring"
        styleFunction={({ countryValue }) => ({ fill: countryValue === 'home' ? '#334155' : ENTRY_RULES[countryValue as EntryRule['t']]?.color || ENTRY_RULES.unknown.color, stroke: '#e4e4e7', strokeWidth: 0.5 })}
        tooltipTextFunction={({ countryName, countryCode, countryValue }) => `${countryName}: ${countryValue !== 'home' && byCountry.has(countryCode.toUpperCase()) ? entryRuleLabel(byCountry.get(countryCode.toUpperCase())!) : label(countryValue)}`} />
    </div>
    <ul aria-label="Entry categories" className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/60 pt-4 text-xs text-muted-foreground sm:flex sm:flex-wrap sm:justify-center">
      {Object.entries(ENTRY_RULES).map(([type, entry]) => <li key={type} className="flex min-w-0 items-center gap-1.5"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden /><span>{type === 'eta' ? 'eTA / registration' : type === 'fm' ? 'Free movement' : entry.label}</span><span className="ml-auto font-medium tabular-nums text-foreground sm:ml-0">{destinations.filter(item => matchesEntryCategory(item.rule, type)).length}</span></li>)}
      <li className="col-span-2 flex items-center justify-center gap-1.5"><span className="h-2 w-2 shrink-0 rounded-full bg-slate-700" aria-hidden />Passport country</li>
    </ul>
    {destinations.some(item => item.rule.a) && <p className="mt-3 text-center text-xs text-muted-foreground">Destinations with multiple entry options appear in both category counts.</p>}
  </Card>;
}
