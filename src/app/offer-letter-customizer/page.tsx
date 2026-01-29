'use client';

import { Header } from '@/components/header';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const OfferLetterForm = dynamic(
  () => import('@/components/offer-letter-form').then(m => ({ default: m.OfferLetterForm })),
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

export default function OfferLetterCustomizerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <OfferLetterForm />
      </main>
    </div>
  );
}
