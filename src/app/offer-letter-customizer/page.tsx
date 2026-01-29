'use client';

import { Header } from '@/components/header';
import { OfferLetterForm } from '@/components/offer-letter-form';

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
