
'use client';

import { Header } from '@/components/header';
import { JDBuilderForm } from '@/components/jd-builder-form';

export default function JobDescriptionBuilderPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <JDBuilderForm />
      </main>
    </div>
  );
}
