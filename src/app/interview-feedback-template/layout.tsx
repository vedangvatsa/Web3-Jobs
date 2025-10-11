
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interview Feedback Template',
  description: 'A free tool to generate standardized interview feedback forms. Help your hiring team make better, less biased decisions with a structured template.',
  alternates: {
    canonical: '/interview-feedback-template',
  },
  openGraph: {
    title: 'Interview Feedback Template',
    description: 'Standardize your hiring process and reduce bias with our free interview feedback template.',
    url: 'https://hashtagweb3.com/interview-feedback-template',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-tools.png',
        width: 1200,
        height: 630,
        alt: 'Interview Feedback Template',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interview Feedback Template',
    description: 'Create structured interview feedback forms in seconds.',
    images: ['https://hashtagweb3.com/og-image-tools.png'],
  },
};

export default function InterviewFeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
