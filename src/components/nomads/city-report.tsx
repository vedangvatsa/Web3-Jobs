'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { ExplorerCity } from '@/lib/nomads/types';
import { cityPath, money, metric } from '@/lib/nomads/types';
import { CityIdentity, CountryIdentity } from './city-identity';
import { CityThumbnail } from './city-thumbnail';
import { MetricCard, TableFrame, tableStyle } from './ui';

export default function CityReport({ cities, referencePeriod, ranking, onReady }: { cities: ExplorerCity[]; referencePeriod: string; ranking: string; onReady: () => void }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    const images = Array.from(container.current?.querySelectorAll('img') || []);
    images.forEach(image => { image.loading = 'eager'; });
    Promise.all([document.fonts.ready, ...images.map(image => image.decode().catch(() => {}))]).then(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => { if (!cancelled) onReady(); }));
    });
    return () => { cancelled = true; };
  }, [onReady]);
  const average = cities.reduce((sum, city) => sum + city.cost.monthly_total, 0) / cities.length;
  return <div ref={container} className="nomad-report space-y-6">
    <h1 className="text-3xl font-bold">City report</h1>
    <p className="text-xs text-muted-foreground">{ranking} · {referencePeriod} · USD / month</p>
    <dl className="grid grid-cols-3 gap-3"><MetricCard label="Cities" value={cities.length} /><MetricCard label="Average monthly estimate" value={money(average)} /><MetricCard label="Countries" value={new Set(cities.map(city => city.countryCode)).size} /></dl>
    <TableFrame label="City report comparison"><table className={tableStyle}><thead><tr>{['City', 'Country', 'Monthly estimate', 'Fixed broadband', 'Average temperature', 'Places'].map((label, index) => <th key={label} scope="col" className={index > 1 ? 'text-right' : ''}>{label}</th>)}</tr></thead><tbody>{cities.map(city => <tr key={city.slug}><td><CityIdentity city={city} showCountry={false} /></td><td><CountryIdentity name={city.country} code={city.countryCode} /></td><td className="text-right">{money(city.cost.monthly_total)}</td><td className="text-right">{metric(city.internet?.download_mbps, ' Mbps')}</td><td className="text-right">{metric(city.weather.avg_temp, '°C')}</td><td className="text-right">{city.spaces.total}</td></tr>)}</tbody></table></TableFrame>
    <section><h2 className="mb-4 text-xl font-semibold">City reference sheets</h2><div className="grid grid-cols-2 gap-4">{cities.map(city => <article key={city.slug} className="nomad-report-city rounded-lg border p-4">
      <div className="flex items-center gap-3"><CityThumbnail src={city.thumbnail} /><div><h3 className="font-semibold">{city.name}</h3><CountryIdentity name={city.country} code={city.countryCode} /></div></div>
      <p className="mt-3 text-sm font-semibold">{money(city.cost.monthly_total)} / month</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">{[['Rent', money(city.cost.rent)], ['Food', money(city.cost.food)], ['Transport', money(city.cost.transport)], ['Workspace', money(city.cost.coworking)], ['Average temperature', metric(city.weather.avg_temp, '°C')], ['Annual rainfall', metric(city.weather.annual_rain, ' mm')], ['Download', metric(city.internet?.download_mbps, ' Mbps')], ['Timezone', city.timezone.replace(/_/g, ' ')]].map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd>{value}</dd></div>)}</dl>
      <p className="mt-3 text-xs">{city.spaces.coworking} coworking · {city.spaces.coliving} coliving · {city.spaces.total} places</p>
      <Link href={cityPath(city.slug)} prefetch={false} className="mt-3 inline-block text-xs">hashtagweb3.com{cityPath(city.slug)}</Link>
    </article>)}</div></section>
  </div>;
}
