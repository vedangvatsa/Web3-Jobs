import { Header } from '@/components/header';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Web3 Invoice Generator | Free PDF Crypto Invoicing',
 description: 'Free online invoice generator for Web3 freelancers, consultants, and contractors. Create professional PDF invoices accepting ETH, USDC, BTC, or fiat.',
 alternates: {
  canonical: 'https://hashtagweb3.com/invoice-generator',
 },
 openGraph: {
  type: 'website',
  title: 'Web3 Invoice Generator | Free PDF Crypto Invoicing',
  description: 'Free online invoice generator for Web3 freelancers, consultants, and contractors. Create professional PDF invoices accepting ETH, USDC, BTC, or fiat.',
  url: 'https://hashtagweb3.com/invoice-generator',
  images: [{
   url: '/api/og?type=default&title=Web3%20Invoice%20Generator',
   width: 1200,
   height: 630,
   alt: 'Web3 Invoice Generator Tool',
  }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 Invoice Generator | Free PDF Crypto Invoicing',
  description: 'Free online invoice generator for Web3 freelancers, consultants, and contractors. Create professional PDF invoices accepting ETH, USDC, BTC, or fiat.',
  images: ['/api/og?type=default&title=Web3%20Invoice%20Generator'],
 },
};

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
