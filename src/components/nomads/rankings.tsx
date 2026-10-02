'use client';
import type { CitySummary, NomadCity } from '@/lib/nomads/types';
import { metric } from '@/lib/nomads/types';
import { CityIdentity } from './city-identity';
import { useNomadQuery } from './hooks';
import { Field, inputStyle, TableFrame, tableStyle, buttonStyle, primaryButtonStyle, EmptyResults } from './ui';

export type RankingCity = CitySummary & { internet: NomadCity['internet'] };
export function CityRankings({ cities }: { cities: RankingCity[] }) {
  const { params, update } = useNomadQuery();
  const tab = ['safety', 'walkability'].includes(params.get('tab') || '') ? params.get('tab')! : 'internet';
  const q = params.get('q') || '';
  const value = (city: RankingCity) => tab === 'internet' ? city.internet?.download_mbps : tab === 'safety' ? city.safety : city.walkability?.walk;
  const filtered = cities.filter(city => !q || `${city.name} ${city.country}`.toLowerCase().includes(q.toLowerCase().trim())).sort((a, b) => (value(b) ?? -1) - (value(a) ?? -1));
  const known = filtered.filter(city => value(city) != null);
  return <div><div className="mb-6 flex flex-wrap gap-2" aria-label="Ranking metric">{[['internet', 'Internet'], ['safety', 'Safety'], ['walkability', 'Walkability']].map(([key, label]) => <button key={key} className={tab === key ? primaryButtonStyle : buttonStyle} aria-pressed={tab === key} onClick={() => update({ tab: key })}>{label}</button>)}</div>
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="w-full sm:max-w-sm"><Field label="Search rankings"><input className={inputStyle} type="search" value={q} placeholder="City or country" onChange={event => update({ q: event.target.value || null })} /></Field></div><p className="text-sm text-muted-foreground" aria-live="polite">{known.length} of {filtered.length} cities have {tab === 'internet' ? 'internet benchmarks' : 'reference scores'}.</p></div>
    {filtered.length ? <TableFrame label={`${tab} city rankings`}><table className={tableStyle}><caption className="sr-only">Cities ranked by {tab}</caption><thead><tr><th scope="col">Rank</th><th scope="col">City</th>{(tab === 'internet' ? ['Download', 'Upload', 'Latency', 'Tests', 'Period'] : tab === 'safety' ? ['Reference score'] : ['Walkability', 'Transit', 'Cycling', 'Car-free living']).map(label => <th key={label} scope="col" className="text-right">{label}</th>)}</tr></thead><tbody>{filtered.map((city, index) => <tr key={city.slug}>
      <td className="text-muted-foreground">{value(city) == null ? '—' : index + 1}</td><td><CityIdentity city={city} /></td>
      {tab === 'internet' ? <><td className="whitespace-nowrap text-right font-medium tabular-nums">{metric(city.internet?.download_mbps, ' Mbps')}</td><td className="whitespace-nowrap text-right tabular-nums">{metric(city.internet?.upload_mbps, ' Mbps')}</td><td className="whitespace-nowrap text-right tabular-nums">{metric(city.internet?.latency_ms, ' ms')}</td><td className="text-right tabular-nums">{city.internet?.test_count?.toLocaleString('en-US') || '—'}</td><td className="whitespace-nowrap text-right text-xs text-muted-foreground">{city.internet?.quarter || '—'}</td></> : tab === 'safety' ? <td className="text-right font-medium tabular-nums">{metric(city.safety, ' / 10')}</td> : <><td className="text-right">{metric(city.walkability?.walk, ' / 10')}</td><td className="text-right">{metric(city.walkability?.transit, ' / 10')}</td><td className="text-right">{metric(city.walkability?.bike, ' / 10')}</td><td className="text-right">{city.walkability?.carFree || 'Not available'}</td></>}
    </tr>)}</tbody></table></TableFrame> : <EmptyResults onReset={() => update({ q: null })} />}
  </div>;
}
