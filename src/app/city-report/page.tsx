import Link from 'next/link';
import { NomadShell } from '@/components/nomads/shell';
import { NomadPrintButton } from '@/components/nomads/print-button';
import { CityIdentity, CountryIdentity } from '@/components/nomads/city-identity';
import { CityThumbnail } from '@/components/nomads/city-thumbnail';
import { MetricCard, NomadPanel, TableFrame, tableStyle } from '@/components/nomads/ui';
import { getNomadCities, nomadSources } from '@/lib/nomads/server';
import { cityPath, money, metric } from '@/lib/nomads/types';
import { nomadMetadata } from '@/lib/nomads/metadata';
import './report.css';

export const dynamic = 'force-static';
export const revalidate = 86400;
export const metadata = nomadMetadata('/city-report');
export default function ReportPage() {
  const cities = [...getNomadCities()].sort((a, b) => (b.score ?? -1) - (a.score ?? -1)).slice(0, 50);
  const average = cities.reduce((sum, city) => sum + city.cost.monthly_total, 0) / cities.length;
  const regions = [...new Set(cities.map(city => city.continent))].sort().map(region => { const group = cities.filter(city => city.continent === region); return { region, count: group.length, average: group.reduce((sum, city) => sum + city.cost.monthly_total, 0) / group.length }; });
  return <NomadShell title="City report" actions={<NomadPrintButton />}><div className="nomad-report space-y-9"><p className="text-xs text-muted-foreground">Source reference period: {nomadSources.referencePeriod} · Dataset imported {nomadSources.importedAt}</p><dl className="grid grid-cols-2 gap-3 lg:grid-cols-3"><MetricCard label="Cities in this report" value={cities.length} /><MetricCard label="Average monthly estimate" value={money(average)} /><MetricCard label="Countries represented" value={new Set(cities.map(city => city.countryCode)).size} /></dl>
    <section><h2 className="mb-4 text-xl font-semibold">City comparison</h2><TableFrame label="Top 50 city comparison"><table className={tableStyle}><caption className="sr-only">City reference ranking</caption><thead><tr>{['City', 'Country', 'Monthly estimate', 'Fixed broadband', 'Average temperature', 'Listed places'].map((label, index) => <th key={label} scope="col" className={index > 1 ? 'text-right' : ''}>{label}</th>)}</tr></thead><tbody>{cities.map(city => <tr key={city.slug}><td><CityIdentity city={city} showCountry={false} /></td><td><CountryIdentity name={city.country} code={city.countryCode} /></td><td className="whitespace-nowrap text-right tabular-nums">{money(city.cost.monthly_total)}</td><td className="whitespace-nowrap text-right tabular-nums">{metric(city.internet?.download_mbps, ' Mbps')}</td><td className="text-right tabular-nums">{metric(city.weather.avg_temp, '°C')}</td><td className="text-right tabular-nums">{city.spaces.total}</td></tr>)}</tbody></table></TableFrame><p className="mt-3 text-xs text-muted-foreground">Sorted by the imported Nomad score. Costs are monthly USD estimates; climate figures are historical averages.</p></section>
    <section><h2 className="mb-4 text-xl font-semibold">Regional context</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{regions.map(region => <NomadPanel key={region.region}><h3 className="font-semibold">{region.region}</h3><p className="mt-2 text-sm text-muted-foreground">{region.count} {region.count === 1 ? 'city' : 'cities'} in this report · {money(region.average)} average monthly estimate</p></NomadPanel>)}</div></section>
    <section><h2 className="mb-4 text-xl font-semibold">City reference sheets</h2><div className="grid gap-4 md:grid-cols-2">{cities.map(city => <article key={city.slug} className="nomad-report-city rounded-lg border p-5">
      <div className="flex items-center gap-3"><CityThumbnail src={city.thumbnail} /><div><h3 className="text-lg font-semibold">{city.name}</h3><p className="text-xs text-muted-foreground"><CountryIdentity name={city.country} code={city.countryCode} /></p></div></div>
      <p className="mt-2 text-sm text-muted-foreground">Monthly estimate: <strong className="text-foreground">{money(city.cost.monthly_total)}</strong></p><dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 text-xs">{[['Rent', money(city.cost.rent)], ['Food', money(city.cost.food)], ['Transport', money(city.cost.transport)], ['Workspace', money(city.cost.coworking)], ['Average temperature', metric(city.weather.avg_temp, '°C')], ['Annual rainfall', metric(city.weather.annual_rain, ' mm')], ['Download', metric(city.internet?.download_mbps, ' Mbps')], ['Timezone', city.timezone.replace(/_/g, ' ')]].map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-0.5 font-medium">{value}</dd></div>)}</dl><p className="mt-4 text-xs">{city.spaces.coworking} coworking · {city.spaces.coliving} coliving · {city.spaces.total} places</p><Link href={cityPath(city.slug)} prefetch={false} className="mt-3 inline-block break-all text-xs text-primary">hashtagweb3.com{cityPath(city.slug)}</Link>
    </article>)}</div></section>
  </div></NomadShell>;
}
