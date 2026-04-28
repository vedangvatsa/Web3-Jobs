
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Web3 Interview Question Bank | 200+ Questions',
 description: 'Web3 interview question bank with 200+ real questions for Solidity, DeFi, Product Management, Security, and related roles.',
 alternates: {
  canonical: '/interview-questions',
 },
 openGraph: {
  title: 'Web3 Interview Question Bank | 200+ Questions',
  description: 'Ace your next Web3 interview. Our question bank covers 200+ questions for Solidity, DeFi, PM, and non-technical roles.',
  url: 'https://hashtagweb3.com/interview-questions',
  images: [
   {
    url: 'https://hashtagweb3.com/og-image.png',
    width: 1200,
    height: 630,
    alt: 'Web3 Interview Question Bank',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 Interview Question Bank | 200+ Questions',
  description: 'Prepare for Web3 interviews with a structured bank of 200+ role-based questions.',
  images: ['https://hashtagweb3.com/og-image.png'],
 },
};

const faqSchema = {
 '@context': 'https://schema.org',
 '@type': 'FAQPage',
 mainEntity: [
  {
   '@type': 'Question',
   name: 'What types of Web3 roles are covered in this question bank?',
   acceptedAnswer: {
    '@type': 'Answer',
    text: 'The question bank covers Solidity Developer, DeFi Protocol Designer, Product Manager, Security Auditor, and Community Manager roles with 200+ questions across different difficulty levels.',
   },
  },
  {
   '@type': 'Question',
   name: 'How are the interview questions categorized?',
   acceptedAnswer: {
    '@type': 'Answer',
    text: 'Questions are categorized by difficulty (Foundation, Intermediate, Advanced, Expert) and type (Knowledge, Practical, Debugging, Problem-Solving).',
   },
  },
  {
   '@type': 'Question',
   name: 'Are answers and explanations provided?',
   acceptedAnswer: {
    '@type': 'Answer',
    text: 'Yes, each question includes detailed answers, follow-up questions, common pitfalls, and red flags to watch for during interviews.',
   },
  },
 ],
};

export default function InterviewQuestionsLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <>
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
   />
   {children}
  </>
 );
}
