
'use client';

import { Header } from '@/components/header';
import { ResumeForm } from '@/components/resume-form';
import type { Metadata } from 'next';

export default function ResumeBuilderPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <ResumeForm />
      </main>
    </div>
  );
}
