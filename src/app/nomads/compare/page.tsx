import { Suspense } from 'react';
import { NomadShell } from '@/components/nomads/shell';
import { CompareCities } from '@/components/nomads/compare';
import { getNomadSummaries } from '@/lib/nomads/server';
import { nomadMetadata } from '@/lib/nomads/metadata';
export const dynamic = 'force-static';
export const revalidate = 86400;
export const metadata = nomadMetadata('/nomads/compare');
export default function ComparePage() { return <NomadShell title="Compare two cities" eyebrow="Compare"><Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}><CompareCities cities={getNomadSummaries()} date={new Date().toISOString().slice(0, 10)} /></Suspense></NomadShell>; }
