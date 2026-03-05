'use client';

import { Header } from '@/components/header';
import { EmployeeExitSurveyForm } from '@/components/employee-exit-survey-form';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';

export default function EmployeeExitSurveyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <ToolUsageTracker toolName="Employee Exit Survey" />
        <EmployeeExitSurveyForm />
      </main>
    </div>
  );
}
