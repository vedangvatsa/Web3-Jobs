
'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';

const InvoiceForm = dynamic(
 () => import('@/components/invoice-form').then(m => ({ default: m.InvoiceForm })),
 {
  loading: () => (
   <div className="w-full max-w-2xl mx-auto p-8 space-y-4">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-10 w-full" />
   </div>
  ),
 }
);

const schemaJson = JSON.stringify({
 '@context': 'https://schema.org',
 '@type': 'SoftwareApplication',
 name: 'Web3 Invoice Generator',
 url: 'https://hashtagweb3.com/invoice-generator',
 description: 'Free invoice generator for Web3 freelancers and contractors. Create professional invoices for crypto and blockchain consulting work with PDF export.',
 applicationCategory: 'BusinessApplication',
 operatingSystem: 'Web',
 offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
 publisher: { '@type': 'Organization', name: 'Hashtag Web3', url: 'https://hashtagweb3.com' },
});

export default function InvoiceGeneratorPage() {
 return (
  <div className="flex flex-col min-h-screen bg-background">
   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
   <Header />
   <main className="flex-1">
    <ToolUsageTracker toolName="Invoice Generator" />
    <InvoiceForm />
   </main>
  </div>
 );
}
