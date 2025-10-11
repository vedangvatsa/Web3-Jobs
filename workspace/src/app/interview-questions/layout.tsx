
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Interview Question Bank',
  description: 'The ultimate resource for Web3 interview preparation. Explore hundreds of real questions for roles in Solidity, DeFi, Product Management, and more.',
  alternates: {
    canonical: '/interview-questions',
  },
  openGraph: {
    title: 'Web3 Interview Question Bank',
    description: 'Ace your next Web3 interview. Our question bank covers everything from Solidity to DeFi, for technical and non-technical roles.',
    url: 'https://hashtagweb3.com/interview-questions',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-interview.png',
        width: 1200,
        height: 630,
        alt: 'Web3 Interview Question Bank',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Interview Question Bank',
    description: 'Ace your next Web3 interview with our comprehensive question bank.',
    images: ['https://hashtagweb3.com/og-image-interview.png'],
  },
};

export default function InterviewQuestionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
