'use client';

import { EmployeeExitSurveyForm } from '@/components/employee-exit-survey-form';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { ToolPageFrame } from '@/components/page-shell';

export default function EmployeeExitSurveyPage() {
 return (
  <ToolPageFrame>
    <h1 className="sr-only">Employee Exit Survey</h1>
    <ToolUsageTracker toolName="Employee Exit Survey" />
    <EmployeeExitSurveyForm />
  </ToolPageFrame>
 );
}
