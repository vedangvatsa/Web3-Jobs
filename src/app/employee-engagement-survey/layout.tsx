
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employee Engagement Pulse Survey',
  description: 'A free tool to generate a quick and effective employee engagement pulse survey. Measure team morale, satisfaction, and identify areas for improvement.',
  alternates: {
    canonical: '/employee-engagement-survey',
  },
  openGraph: {
    title: 'Employee Engagement Pulse Survey',
    description: 'Quickly gauge team morale and satisfaction with our free pulse survey generator.',
    url: 'https://hashtagweb3.com/employee-engagement-survey',
    images: [
      {
        url: 'https://hashtagweb3.com/logo/previews/Hashtag%20Web3%20Community.jpeg',
        width: 1200,
        height: 630,
        alt: 'Employee Engagement Pulse Survey Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Employee Engagement Pulse Survey | Hashtag Web3',
    description: 'Create an effective employee engagement survey in seconds.',
    images: ['https://hashtagweb3.com/logo/previews/Hashtag%20Web3%20Community.jpeg'],
  },
};

export default function EmployeeEngagementSurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
