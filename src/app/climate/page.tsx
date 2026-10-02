import { Suspense } from 'react';
import { NomadShell } from '@/components/nomads/shell';
import { ClimateFinder } from '@/components/nomads/climate';
import { getNomadCities } from '@/lib/nomads/server';
import { nomadMetadata } from '@/lib/nomads/metadata';
export const dynamic = 'force-static';
export const revalidate = 86400;
export const metadata = nomadMetadata('/climate');
export default function ClimatePage() { return <NomadShell title="Climate finder"><Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}><ClimateFinder cities={getNomadCities().map(city => ({ slug: city.slug, name: city.name, country: city.country, countryCode: city.countryCode, thumbnail: city.thumbnail, monthly: city.weather.monthly }))} initialMonth={new Date().getUTCMonth()} /></Suspense></NomadShell>; }
