
'use client';

import { Header } from '@/components/header';
import { WorkLifeBalanceSurveyForm } from '@/components/work-life-balance-survey-form';

export default function WorkLifeBalanceSurveyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <WorkLifeBalanceSurveyForm />
      </main>
    </div>
  );
}
