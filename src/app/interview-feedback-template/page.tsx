'use client';

import { Header } from '@/components/header';
import { InterviewFeedbackForm } from '@/components/interview-feedback-form';

export default function InterviewFeedbackTemplatePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <InterviewFeedbackForm />
      </main>
    </div>
  );
}
