
'use client';

import { CompanyCultureGuideForm } from '@/components/company-culture-guide-form';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { ToolPageFrame } from '@/components/page-shell';

export default function CompanyCultureGuidePage() {
 return (
  <ToolPageFrame>
    <h1 className="sr-only">Company Culture Guide</h1>
    <ToolUsageTracker toolName="Company Culture Guide" />
    <CompanyCultureGuideForm />
  </ToolPageFrame>
 );
}
