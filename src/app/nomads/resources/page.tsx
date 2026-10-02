import { NomadShell } from '@/components/nomads/shell';
import { NomadServices } from '@/components/nomads/services';
import { getNomadServices } from '@/lib/nomads/server';
import { nomadMetadata } from '@/lib/nomads/metadata';
export const dynamic = 'force-static';
export const revalidate = 86400;
export const metadata = nomadMetadata('/nomads/resources');
export default function ResourcesPage() { return <NomadShell title="Useful services for a remote stay" eyebrow="Services"><NomadServices categories={getNomadServices()} /></NomadShell>; }
