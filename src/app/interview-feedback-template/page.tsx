'use client';

import { InterviewFeedbackForm } from '@/components/interview-feedback-form';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { ToolPageFrame } from '@/components/page-shell';

export default function InterviewFeedbackTemplatePage() {
 return (
  <ToolPageFrame>
    <h1 className="sr-only">Interview Feedback Template</h1>
    <ToolUsageTracker toolName="Interview Feedback Template" />
    <InterviewFeedbackForm />
  </ToolPageFrame>
 );
}
