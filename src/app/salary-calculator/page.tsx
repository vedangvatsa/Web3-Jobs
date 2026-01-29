
'use client';

import { Header } from '@/components/header';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function SalaryCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <SalaryCalculatorForm />
      </main>
    </div>
  );
}
