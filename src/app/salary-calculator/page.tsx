
'use client';

import { Header } from '@/components/header';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';

const SalaryCalculatorForm = dynamic(
 () => import('@/components/salary-calculator-form').then(m => ({ default: m.SalaryCalculatorForm })),
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
 name: 'Web3 Salary Calculator',
 url: 'https://hashtagweb3.com/salary-calculator',
 description: 'Free tool to estimate Web3 and blockchain developer salaries by role, experience, and location. Compare DeFi, Solidity, and crypto job salary ranges.',
 applicationCategory: 'BusinessApplication',
 operatingSystem: 'Web',
 offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
 publisher: { '@type': 'Organization', name: 'Hashtag Web3', url: 'https://hashtagweb3.com' },
});

export default function SalaryCalculatorPage() {
 return (
  <div className="flex flex-col min-h-screen bg-background">
   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJson }} />
   <Header />
   <main className="flex-1">
    <ToolUsageTracker toolName="Salary Calculator" />
    <SalaryCalculatorForm />
   </main>
  </div>
 );
}
