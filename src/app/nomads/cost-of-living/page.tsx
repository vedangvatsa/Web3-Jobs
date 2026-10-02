import { Suspense } from 'react';
import { NomadShell } from '@/components/nomads/shell';
import { LivingCosts } from '@/components/nomads/costs';
import { getNomadCities } from '@/lib/nomads/server';
import { citySummary } from '@/lib/nomads/types';
import { nomadMetadata } from '@/lib/nomads/metadata';
export const dynamic = 'force-static';
export const revalidate = 86400;
export const metadata = nomadMetadata('/nomads/cost-of-living');
export default function CostsPage() { return <NomadShell title="Plan your monthly budget" eyebrow="Living costs"><Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}><LivingCosts cities={getNomadCities().map(city => ({ ...citySummary(city), costs: city.cost }))} /></Suspense></NomadShell>; }
