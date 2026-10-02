import { NomadShell } from '@/components/nomads/shell';
import { SchengenTracker } from '@/components/nomads/schengen';
import { nomadMetadata } from '@/lib/nomads/metadata';
export const dynamic = 'force-static';
export const revalidate = 3600;
export const metadata = nomadMetadata('/nomads/schengen');
export default function SchengenPage() { return <NomadShell title="Track your Schengen days" eyebrow="Schengen days"><SchengenTracker today={new Date().toISOString().slice(0, 10)} /></NomadShell>; }
