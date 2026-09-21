
'use client';

import { WorkLifeBalanceSurveyForm } from '@/components/work-life-balance-survey-form';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { ToolPageFrame } from '@/components/page-shell';

export default function WorkLifeBalanceSurveyPage() {
 return (
  <ToolPageFrame>
    <h1 className="sr-only">Work-Life Balance Survey</h1>
    <ToolUsageTracker toolName="Work-Life Balance Survey" />
    <WorkLifeBalanceSurveyForm />
  </ToolPageFrame>
 );
}
