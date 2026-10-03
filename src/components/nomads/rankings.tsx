'use client';
import type { CitySummary, NomadCity } from '@/lib/nomads/types';
import { metric } from '@/lib/nomads/types';
import { CityIdentity } from './city-identity';
import { useNomadQuery } from './hooks';
import { inputStyle, TableFrame, tableStyle, EmptyResults } from './ui';
import { ListingToolbar } from '@/components/listing-toolbar';
import { ListingViewTabs } from '@/components/listing-view-tabs';
import { Tabs, TabsContent } from '@/components/ui/tabs';

export type RankingCity = CitySummary & { internet: NomadCity['internet'] };
export function CityRankings({ cities }: { cities: RankingCity[] }) {
  const { params, update } = useNomadQuery();
  const tab = ['safety', 'walkability'].includes(params.get('tab') || '') ? params.get('tab')! : 'internet';
  const q = params.get('q') || '';
  const value = (city: RankingCity) => tab === 'internet' ? city.internet?.download_mbps : tab === 'safety' ? city.safety : city.walkability?.walk;
  const filtered = cities.filter(city => !q || `${city.name} ${city.country}`.toLowerCase().includes(q.toLowerCase().trim())).sort((a, b) => (value(b) ?? -1) - (value(a) ?? -1));
  const known = filtered.filter(city => value(city) != null);
  return <Tabs value={tab} onValueChange={value => update({ tab: value === 'internet' ? null : value })}>
    <ListingToolbar leading={<ListingViewTabs label="Ranking metric" options={[{ value: 'internet', label: 'Internet' }, { value: 'safety', label: 'Safety' }, { value: 'walkability', label: 'Walkability' }]} />} searchValue={q} onSearchChange={value => update({ q: value })} searchPlaceholder="City or country" searchAriaLabel="Search rankings" inputProps={{ type: 'search', className: `${inputStyle} pl-9` }} />
    <TabsContent value={tab} className="mt-0">
    <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">{known.length} of {filtered.length} cities have {tab === 'internet' ? 'internet benchmarks' : 'reference scores'}.</p>
    {filtered.length ? <TableFrame label={`${tab} city rankings`}><table className={tableStyle}><caption className="sr-only">Cities ranked by {tab}</caption><thead><tr><th scope="col">Rank</th><th scope="col">City</th>{(tab === 'internet' ? ['Download', 'Upload', 'Latency', 'Tests', 'Period'] : tab === 'safety' ? ['Reference score'] : ['Walkability', 'Transit', 'Cycling', 'Car-free living']).map(label => <th key={label} scope="col" className="text-right">{label}</th>)}</tr></thead><tbody>{filtered.map((city, index) => <tr key={city.slug}>
      <td className="text-muted-foreground">{value(city) == null ? '—' : index + 1}</td><td><CityIdentity city={city} /></td>
      {tab === 'internet' ? <><td className="whitespace-nowrap text-right font-medium tabular-nums">{metric(city.internet?.download_mbps, ' Mbps')}</td><td className="whitespace-nowrap text-right tabular-nums">{metric(city.internet?.upload_mbps, ' Mbps')}</td><td className="whitespace-nowrap text-right tabular-nums">{metric(city.internet?.latency_ms, ' ms')}</td><td className="text-right tabular-nums">{city.internet?.test_count?.toLocaleString('en-US') || '—'}</td><td className="whitespace-nowrap text-right text-xs text-muted-foreground">{city.internet?.quarter || '—'}</td></> : tab === 'safety' ? <td className="text-right font-medium tabular-nums">{metric(city.safety, ' / 10')}</td> : <><td className="text-right">{metric(city.walkability?.walk, ' / 10')}</td><td className="text-right">{metric(city.walkability?.transit, ' / 10')}</td><td className="text-right">{metric(city.walkability?.bike, ' / 10')}</td><td className="text-right">{city.walkability?.carFree || 'Not available'}</td></>}
    </tr>)}</tbody></table></TableFrame> : <EmptyResults onReset={() => update({ q: null })} />}
    </TabsContent>
  </Tabs>;
}
