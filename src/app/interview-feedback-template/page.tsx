'use client';

import { Header } from '@/components/header';
import { InterviewFeedbackForm } from '@/components/interview-feedback-form';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';

export default function InterviewFeedbackTemplatePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <ToolUsageTracker toolName="Interview Feedback Template" />
        <InterviewFeedbackForm />
      </main>
    </div>
  );
}
