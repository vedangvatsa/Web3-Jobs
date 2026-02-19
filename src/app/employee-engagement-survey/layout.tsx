
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employee Engagement Pulse Survey | Free Tool',
  description: 'A free tool to generate an employee engagement pulse survey. Measure team morale and satisfaction to build a thriving company culture.',
  alternates: {
    canonical: '/employee-engagement-survey',
  },
  openGraph: {
    title: 'Employee Engagement Pulse Survey | Free Tool',
    description: 'Quickly gauge team morale and satisfaction with our free pulse survey generator. Build a thriving company culture.',
    url: 'https://hashtagweb3.com/employee-engagement-survey',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-tools.png',
        width: 1200,
        height: 630,
        alt: 'Employee Engagement Pulse Survey Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Employee Engagement Pulse Survey | Free Tool',
    description: 'Generate quick and effective employee engagement pulse surveys. Measure team morale, satisfaction, and identify areas for improvement to build a thriving company culture.',
    images: ['https://hashtagweb3.com/og-image-tools.png'],
  },
};

export default function EmployeeEngagementSurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
