'use client';

import { Header } from '@/components/header';
import { EmployeeExitSurveyForm } from '@/components/employee-exit-survey-form';

export default function EmployeeExitSurveyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <EmployeeExitSurveyForm />
      </main>
    </div>
  );
}
