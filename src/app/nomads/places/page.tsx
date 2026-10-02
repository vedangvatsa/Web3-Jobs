import { Suspense } from 'react';
import { NomadShell } from '@/components/nomads/shell';
import { PlacesDirectory } from '@/components/nomads/places-directory';
import { getNomadSummaries } from '@/lib/nomads/server';
import { nomadMetadata } from '@/lib/nomads/metadata';
export const dynamic = 'force-static';
export const revalidate = 86400;
export const metadata = nomadMetadata('/nomads/places');
export default function PlacesPage() { return <NomadShell title="Find a place to stay or work" eyebrow="Places"><Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}><PlacesDirectory cities={getNomadSummaries()} /></Suspense></NomadShell>; }
