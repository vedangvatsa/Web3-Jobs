
'use client';

import { Header } from '@/components/header';
import { EmployeeEngagementSurveyForm } from '@/components/employee-engagement-survey-form';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';

export default function EmployeeEngagementSurveyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <ToolUsageTracker toolName="Employee Engagement Survey" />
        <EmployeeEngagementSurveyForm />
      </main>
    </div>
  );
}
