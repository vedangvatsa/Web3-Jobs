
'use client';

import { Header } from '@/components/header';
import { CompanyCultureGuideForm } from '@/components/company-culture-guide-form';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';

export default function CompanyCultureGuidePage() {
 return (
  <div className="flex flex-col min-h-screen bg-background">
   <Header />
   <main className="flex-1">
    <h1 className="sr-only">Company Culture Guide</h1>
    <ToolUsageTracker toolName="Company Culture Guide" />
    <CompanyCultureGuideForm />
   </main>
  </div>
 );
}
