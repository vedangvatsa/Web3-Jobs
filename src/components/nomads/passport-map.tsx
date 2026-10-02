'use client';

import WorldMap, { regions, type ISOCode } from 'react-svg-worldmap';
import { ENTRY_RULES } from '@/lib/nomads/entry-rules';
import type { EntryRule, PassportRules } from '@/lib/nomads/types';

const supported = new Set(regions.map(region => region.code.toUpperCase()));

export default function PassportMap({ rules, home }: { rules: PassportRules; home: string | null }) {
  const data = rules.destinations.filter(item => item.iso && supported.has(item.iso.toUpperCase())).map(item => ({
    country: item.iso!.toLowerCase() as ISOCode,
    value: item.iso === home ? 'home' : item.rule.t,
  }));
  const label = (value?: string) => value === 'home' ? 'Passport country' : ENTRY_RULES[value as EntryRule['t']]?.label || 'Not available';
  return <div className="overflow-hidden rounded-xl border bg-card p-3 sm:p-6">
    <div role="img" aria-label={`Entry reference map for ${rules.passport}. The searchable destination table below provides the same information.`}>
      <WorldMap data={data} size="responsive" backgroundColor="transparent" borderColor="#e4e4e7" strokeOpacity={1} richInteraction
        styleFunction={({ countryValue }) => ({ fill: countryValue === 'home' ? '#334155' : ENTRY_RULES[countryValue as EntryRule['t']]?.color || '#d4d4d8', stroke: '#e4e4e7', strokeWidth: 0.5 })}
        tooltipTextFunction={({ countryName, countryValue }) => `${countryName}: ${label(countryValue)}`} />
    </div>
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-xs">{Object.entries(ENTRY_RULES).map(([type, entry]) => <li key={type} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden />{entry.label}</li>)}</ul>
    <p className="mt-4 text-xs text-muted-foreground">Some small destinations are absent from the map; all available references are in the table.</p>
  </div>;
}
