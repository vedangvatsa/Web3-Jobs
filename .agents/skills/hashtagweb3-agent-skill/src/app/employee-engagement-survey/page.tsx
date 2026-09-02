
'use client';

import { EmployeeEngagementSurveyForm } from '@/components/employee-engagement-survey-form';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';

export default function EmployeeEngagementSurveyPage() {
 return (
  <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
    <h1 className="sr-only">Employee Engagement Survey</h1>
    <ToolUsageTracker toolName="Employee Engagement Survey" />
    <EmployeeEngagementSurveyForm />
   </main>
  </div>
 );
}
