
'use client';

import { Header } from '@/components/header';
import { CompanyCultureGuideForm } from '@/components/company-culture-guide-form';

export default function CompanyCultureGuidePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <CompanyCultureGuideForm />
      </main>
    </div>
  );
}
