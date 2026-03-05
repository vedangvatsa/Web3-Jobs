
'use client';

import { Header } from '@/components/header';
import { WorkLifeBalanceSurveyForm } from '@/components/work-life-balance-survey-form';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';

export default function WorkLifeBalanceSurveyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <ToolUsageTracker toolName="Work-Life Balance Survey" />
        <WorkLifeBalanceSurveyForm />
      </main>
    </div>
  );
}
