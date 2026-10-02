import { Suspense } from 'react';
import { NomadVisas } from '@/components/nomads/visas';
import { NomadShell } from '@/components/nomads/shell';
import { getNomadVisas, getPassportCountries } from '@/lib/nomads/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Visas for Digital Nomads',
 description: 'Compare digital-nomad and remote-stay program references by income and continent, and explore passport entry requirements.',
 alternates: {
  canonical: 'https://hashtagweb3.com/digital-nomad-visas',
 },
 openGraph: {
  type: 'website',
  title: 'Visas for Digital Nomads',
   description: 'Compare digital-nomad and remote-stay program references by income and continent, and explore passport entry requirements.',
  url: 'https://hashtagweb3.com/digital-nomad-visas',
  images: [{
   url: 'https://hashtagweb3.com/og-image-tools.png',
   width: 1200,
   height: 630,
   alt: 'Visas for Digital Nomads Tool',
  }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Visas for Digital Nomads',
   description: 'Compare digital-nomad and remote-stay program references by income and continent, and explore passport entry requirements.',
  images: ['https://hashtagweb3.com/og-image-tools.png'],
 },
};

export default function DigitalNomadVisasPage() {
 return (
   <NomadShell title="Visas for Digital Nomads" eyebrow="Visas & entry">
        <Suspense fallback={<div className="text-center py-16 text-muted-foreground">Loading database...</div>}>
           <NomadVisas programs={getNomadVisas()} countries={getPassportCountries()} />
        </Suspense>
   </NomadShell>
 );
}
