
'use client';

import { EmployeeMilestonesForm } from '@/components/employee-milestones-form';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { ToolPageFrame } from '@/components/page-shell';

export default function EmployeeMilestonesTrackerPage() {
 return (
  <ToolPageFrame>
    <h1 className="sr-only">Employee Milestones Tracker</h1>
    <ToolUsageTracker toolName="Employee Milestones Tracker" />
    <EmployeeMilestonesForm />
  </ToolPageFrame>
 );
}
