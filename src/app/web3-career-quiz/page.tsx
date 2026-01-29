
import { Header } from '@/components/header';
import { ArchetypeAssessment } from '@/components/archetype-assessment';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Archetype Assessment',
  description: 'Take our quick assessment to discover your Web3 personality archetype and the career paths that match your skills and interests.',
  openGraph: {
    title: 'Web3 Archetype Assessment',
    description: 'What\'s your Web3 personality? Take our assessment to find out.',
    url: 'https://hashtagweb3.com/web3-career-quiz',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-quiz.png',
        width: 1200,
        height: 630,
        alt: 'Web3 Archetype Assessment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Archetype Assessment',
    description: 'What\'s your Web3 personality? Take our assessment to find out.',
    images: ['https://hashtagweb3.com/og-image-quiz.png'],
  },
};

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
