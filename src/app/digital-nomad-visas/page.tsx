import { Header } from '@/components/header';
import { Suspense } from 'react';
import { DigitalNomadVisasContent } from '@/components/digital-nomad-visas-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Digital Nomad Visas for Web3 Builders | Global Nomad Visa List',
 description: 'Complete database of digital nomad visas for blockchain developer, crypto, and remote Web3 builders. Filter by continent, min income, and key requirements.',
 alternates: {
  canonical: 'https://hashtagweb3.com/digital-nomad-visas',
 },
 openGraph: {
  type: 'website',
  title: 'Digital Nomad Visas for Web3 Builders | Global Nomad Visa List',
  description: 'Complete database of digital nomad visas for blockchain developer, crypto, and remote Web3 builders. Filter by continent, min income, and key requirements.',
  url: 'https://hashtagweb3.com/digital-nomad-visas',
  images: [{
   url: '/api/og?type=default&title=Digital%20Nomad%20Visas',
   width: 1200,
   height: 630,
   alt: 'Digital Nomad Visas Tool',
  }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Digital Nomad Visas for Web3 Builders | Global Nomad Visa List',
  description: 'Complete database of digital nomad visas for blockchain developer, crypto, and remote Web3 builders. Filter by continent, min income, and key requirements.',
  images: ['/api/og?type=default&title=Digital%20Nomad%20Visas'],
 },
};

export default function DigitalNomadVisasPage() {
 return (
  <div className="flex flex-col min-h-screen bg-background">
   <Header />
   <main className="flex-grow">
    <div className="container mx-auto px-4 py-8 md:py-16">
     <Suspense fallback={
      <div className="max-w-7xl mx-auto text-center py-16 text-muted-foreground">
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
