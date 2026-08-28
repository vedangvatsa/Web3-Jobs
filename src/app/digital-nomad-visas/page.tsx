import { Suspense } from 'react';
import { DigitalNomadVisasContent } from '@/components/digital-nomad-visas-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Visas for Digital Nomads',
 description: 'Complete database of digital nomad visas for blockchain developer, crypto, and remote Web3 builders. Filter by continent, min income, and key requirements.',
 alternates: {
  canonical: 'https://hashtagweb3.com/digital-nomad-visas',
 },
 openGraph: {
  type: 'website',
  title: 'Visas for Digital Nomads | Hashtag Web3',
  description: 'Complete database of digital nomad visas for blockchain developer, crypto, and remote Web3 builders. Filter by continent, min income, and key requirements.',
  url: 'https://hashtagweb3.com/digital-nomad-visas',
  images: [{
   url: 'https://hashtagweb3.com/api/og?type=default&title=Visas%20for%20Digital%20Nomads',
   width: 1200,
   height: 630,
   alt: 'Visas for Digital Nomads Tool',
  }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Visas for Digital Nomads | Hashtag Web3',
  description: 'Complete database of digital nomad visas for blockchain developer, crypto, and remote Web3 builders. Filter by continent, min income, and key requirements.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Visas%20for%20Digital%20Nomads'],
 },
};

export default function DigitalNomadVisasPage() {
 return (
  <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow">
    <div className="container mx-auto px-4 page-section">
     <Suspense fallback={
      <div className="site-container text-center py-16 text-muted-foreground">
       Loading database...
      </div>
     }>
      <DigitalNomadVisasContent />
     </Suspense>
    </div>
   </main>
  </div>
 );
}
