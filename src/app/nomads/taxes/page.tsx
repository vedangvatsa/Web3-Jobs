import { NomadShell } from '@/components/nomads/shell';
import { TaxPlanning } from '@/components/nomads/taxes';
import { getNomadTaxes } from '@/lib/nomads/server';
import { nomadMetadata } from '@/lib/nomads/metadata';
export const dynamic = 'force-static';
export const revalidate = 86400;
export const metadata = nomadMetadata('/nomads/taxes');
export default function TaxesPage() { return <NomadShell title="Tax planning references" eyebrow="Tax planning"><TaxPlanning countries={getNomadTaxes()} /></NomadShell>; }
