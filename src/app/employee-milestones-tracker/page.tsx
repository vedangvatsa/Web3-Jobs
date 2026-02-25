
'use client';

import { Header } from '@/components/header';
import { EmployeeMilestonesForm } from '@/components/employee-milestones-form';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';

export default function EmployeeMilestonesTrackerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <ToolUsageTracker toolName="Employee Milestones Tracker" />
        <EmployeeMilestonesForm />
      </main>
    </div>
  );
}
