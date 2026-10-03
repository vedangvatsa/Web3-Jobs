import { Suspense } from 'react';
import { NomadShell } from '@/components/nomads/shell';
import { CityExplorer } from '@/components/nomads/city-explorer';
import { getNomadExplorerCities, nomadSources } from '@/lib/nomads/server';
import { nomadMetadata } from '@/lib/nomads/metadata';
import './print.css';

export const dynamic = 'force-static';
export const revalidate = 86400;
export const metadata = nomadMetadata('/nomads');

export default function NomadsPage() {
  return <NomadShell title="Digital Nomad Resources">
    <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" aria-label="Loading destinations" />}><CityExplorer cities={getNomadExplorerCities()} date={new Date().toISOString().slice(0, 10)} referencePeriod={nomadSources.referencePeriod} /></Suspense>
  </NomadShell>;
}
