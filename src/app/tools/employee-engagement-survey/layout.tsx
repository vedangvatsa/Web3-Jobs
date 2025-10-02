
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employee Engagement Pulse Survey',
  description: 'A free tool to generate a quick and effective employee engagement pulse survey. Measure team morale, satisfaction, and identify areas for improvement.',
  openGraph: {
    title: 'Employee Engagement Pulse Survey | Hashtag Web3',
    description: 'Quickly gauge team morale and satisfaction with our free pulse survey generator.',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-engagement-survey.png',
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
    images: ['https://hashtagweb3.com/og-image-engagement-survey.png'],
  },
};

export default function EmployeeEngagementSurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
