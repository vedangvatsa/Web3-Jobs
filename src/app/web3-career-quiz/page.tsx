
import { Header } from '@/components/header';
import { ArchetypeAssessment } from '@/components/archetype-assessment';

export default function Web3CareerQuizPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <ArchetypeAssessment />
      </main>
    </div>
  );
}
