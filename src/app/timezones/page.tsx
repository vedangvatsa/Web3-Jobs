import { Suspense } from 'react';
import { NomadShell } from '@/components/nomads/shell';
import { TimezonePlanner } from '@/components/nomads/timezones';
import { getNomadCities } from '@/lib/nomads/server';
import { nomadMetadata } from '@/lib/nomads/metadata';
export const dynamic = 'force-static';
export const revalidate = 86400;
export const metadata = nomadMetadata('/timezones');
export default function TimezonesPage() {
  const cities = getNomadCities().map(({ slug, name, country, timezone }) => ({ slug, name, country, timezone }));
  const extras = [
    { slug: 'new-york', name: 'New York', country: 'United States', timezone: 'America/New_York' },
    { slug: 'los-angeles', name: 'Los Angeles', country: 'United States', timezone: 'America/Los_Angeles' },
    { slug: 'vancouver', name: 'Vancouver', country: 'Canada', timezone: 'America/Vancouver' },
    { slug: 'mumbai', name: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata' },
    { slug: 'cairo', name: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo' },
    { slug: 'sydney', name: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
    { slug: 'auckland', name: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland' },
  ];
  return <NomadShell title="Timezone planner"><Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}><TimezonePlanner cities={[...cities, ...extras.filter(extra => !cities.some(city => city.slug === extra.slug))]} today={new Date().toISOString().slice(0, 10)} /></Suspense></NomadShell>;
}
