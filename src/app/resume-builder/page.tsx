
'use client';

import { Header } from '@/components/header';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';

const ResumeForm = dynamic(
  () => import('@/components/resume-form').then(m => ({ default: m.ResumeForm })),
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

export default function ResumeBuilderPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <ToolUsageTracker toolName="Resume Builder" />
        <ResumeForm />
      </main>
    </div>
  );
}
