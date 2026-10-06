import { Suspense } from 'react';
import { NomadVisas } from '@/components/nomads/visas';
import { NomadShell } from '@/components/nomads/shell';
import { getNomadVisas, getPassportCountries } from '@/lib/nomads/server';
import { nomadMetadata } from '@/lib/nomads/metadata';

export const metadata = nomadMetadata('/visas');

export default function DigitalNomadVisasPage() {
 return (
   <NomadShell title="Visas for Digital Nomads">
        <Suspense fallback={<div className="text-center py-16 text-muted-foreground">Loading database...</div>}>
           <NomadVisas programs={getNomadVisas()} countries={getPassportCountries()} />
        </Suspense>
   </NomadShell>
 );
}
