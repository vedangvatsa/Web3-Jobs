
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Interview Questions',
 description: 'Web3 interview question bank with 200+ real questions for Solidity, DeFi, Product Management, Security, and related roles.',
 alternates: {
  canonical: 'https://hashtagweb3.com/interview-questions',
 },
 openGraph: {
  type: 'website',
  title: 'Interview Questions',
  description: 'Ace your next Web3 interview. Our question bank covers 200+ questions for Solidity, DeFi, PM, and non-technical roles.',
  url: 'https://hashtagweb3.com/interview-questions',
  images: [
   {
    url: 'https://hashtagweb3.com/og/pages/interview-questions.png',
    width: 1200,
    height: 630,
    alt: 'Web3 Interview Question Bank',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Interview Questions',
  description: 'Prepare for Web3 interviews with a structured bank of 200+ role-based questions.',
  images: ['https://hashtagweb3.com/og/pages/interview-questions.png'],
 },
};

export default function InterviewQuestionsLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
