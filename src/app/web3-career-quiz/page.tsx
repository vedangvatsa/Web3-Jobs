
'use client';

import { Header } from '@/components/header';
import { Web3CareerQuiz } from '@/components/web3-career-quiz';

export default function Web3CareerQuizPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-1 flex items-center">
        <Web3CareerQuiz />
      </main>
    </div>
  );
}
