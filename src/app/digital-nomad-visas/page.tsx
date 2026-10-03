import { Suspense } from 'react';
import Link from 'next/link';
import { buttonStyle } from '@/components/nomads/ui';
import { NomadVisas } from '@/components/nomads/visas';
import { NomadShell } from '@/components/nomads/shell';
import { getNomadVisas, getPassportCountries } from '@/lib/nomads/server';
import { nomadMetadata } from '@/lib/nomads/metadata';

export const metadata = nomadMetadata('/digital-nomad-visas');

export default function DigitalNomadVisasPage() {
 return (
   <NomadShell title="Visas for Digital Nomads" actions={<Link href="/nomads" prefetch={false} className={buttonStyle}>Explore destinations</Link>}>
        <Suspense fallback={<div className="text-center py-16 text-muted-foreground">Loading database...</div>}>
           <NomadVisas programs={getNomadVisas()} countries={getPassportCountries()} />
        </Suspense>
   </NomadShell>
 );
}
