import { Suspense } from 'react';
import { NomadShell } from '@/components/nomads/shell';
import { CityRankings } from '@/components/nomads/rankings';
import { getNomadCities } from '@/lib/nomads/server';
import { citySummary } from '@/lib/nomads/types';
import { nomadMetadata } from '@/lib/nomads/metadata';
export const dynamic = 'force-static';
export const revalidate = 86400;
export const metadata = nomadMetadata('/city-rankings');
export default function RankingsPage() { return <NomadShell title="City rankings"><Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}><CityRankings cities={getNomadCities().map(city => ({ ...citySummary(city), internet: city.internet }))} /></Suspense></NomadShell>; }
