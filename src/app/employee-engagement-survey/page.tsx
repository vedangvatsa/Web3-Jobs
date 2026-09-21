
'use client';

import { EmployeeEngagementSurveyForm } from '@/components/employee-engagement-survey-form';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { ToolPageFrame } from '@/components/page-shell';

export default function EmployeeEngagementSurveyPage() {
 return (
  <ToolPageFrame>
    <h1 className="sr-only">Employee Engagement Survey</h1>
    <ToolUsageTracker toolName="Employee Engagement Survey" />
    <EmployeeEngagementSurveyForm />
  </ToolPageFrame>
 );
}
