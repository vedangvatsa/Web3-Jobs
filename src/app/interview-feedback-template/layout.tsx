
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Interview Feedback Template | Free Tool for Hiring Managers',
 description: 'A tool to generate standardized interview feedback forms. Help your hiring team make better, less biased decisions with a structured evaluation template.',
 alternates: {
  canonical: '/interview-feedback-template',
 },
 openGraph: {
  type: 'website',
  title: 'Interview Feedback Template | Free Tool for Hiring Managers',
  description: 'Standardize your hiring process and reduce bias with our free interview feedback template for structured candidate evaluation.',
  url: 'https://hashtagweb3.com/interview-feedback-template',
  images: [
   {
    url: 'https://hashtagweb3.com/api/og?type=default&title=Interview%20Feedback%20Template',
    width: 1200,
    height: 630,
    alt: 'Interview Feedback Template',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Interview Feedback Template | Free Tool for Hiring Managers',
  description: 'Standardize your hiring process and reduce bias with structured interview feedback forms. Help your team make better, more objective candidate evaluation decisions.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Interview%20Feedback%20Template'],
 },
};

export default function InterviewFeedbackLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
