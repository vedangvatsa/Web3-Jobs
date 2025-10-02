
'use client';

import { Header } from '@/components/header';
import { EmployeeEngagementSurveyForm } from '@/components/employee-engagement-survey-form';

export default function EmployeeEngagementSurveyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <EmployeeEngagementSurveyForm />
      </main>
    </div>
  );
}
