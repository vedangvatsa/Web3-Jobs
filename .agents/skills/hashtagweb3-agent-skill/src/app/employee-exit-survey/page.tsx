'use client';

import { EmployeeExitSurveyForm } from '@/components/employee-exit-survey-form';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';

export default function EmployeeExitSurveyPage() {
 return (
  <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
    <h1 className="sr-only">Employee Exit Survey</h1>
    <ToolUsageTracker toolName="Employee Exit Survey" />
    <EmployeeExitSurveyForm />
   </main>
  </div>
 );
}
