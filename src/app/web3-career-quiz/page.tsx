
'use client';

import { Header } from '@/components/header';
import { ArchetypeAssessment } from '@/components/archetype-assessment';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';

export default function Web3CareerQuizPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <ToolUsageTracker toolName="Web3 Career Quiz" />
        <ArchetypeAssessment />
      </main>
    </div>
  );
}
