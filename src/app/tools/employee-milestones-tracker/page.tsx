
'use client';

import { Header } from '@/components/header';
import { EmployeeMilestonesForm } from '@/components/employee-milestones-form';

export default function EmployeeMilestonesTrackerPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <EmployeeMilestonesForm />
      </main>
    </div>
  );
}
