import { Suspense } from 'react';
import { NomadShell } from '@/components/nomads/shell';
import { RunwayCalculator } from '@/components/nomads/runway';
import { getNomadSummaries } from '@/lib/nomads/server';
import { nomadMetadata } from '@/lib/nomads/metadata';
export const dynamic = 'force-static';
export const revalidate = 86400;
export const metadata = nomadMetadata('/savings-runway');
export default function RunwayPage() { return <NomadShell title="Savings runway"><Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}><RunwayCalculator cities={getNomadSummaries()} /></Suspense></NomadShell>; }
