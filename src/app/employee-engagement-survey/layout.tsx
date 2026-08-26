
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Engagement Survey',
 description: 'A free tool to generate an employee engagement pulse survey. Measure team morale and satisfaction to build a strong company culture.',
 alternates: {
  canonical: '/employee-engagement-survey',
 },
 openGraph: {
  type: 'website',
  title: 'Engagement Survey | Hashtag Web3',
  description: 'Quickly gauge team morale and satisfaction with our free pulse survey generator. Build a strong company culture.',
  url: 'https://hashtagweb3.com/employee-engagement-survey',
  images: [
   {
    url: 'https://hashtagweb3.com/api/og?type=default&title=Employee%20Engagement%20Pulse%20Survey%20Tool',
    width: 1200,
    height: 630,
    alt: 'Employee Engagement Pulse Survey Tool',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Engagement Survey | Hashtag Web3',
  description: 'Generate quick and effective employee engagement pulse surveys. Measure team morale, satisfaction, and identify areas for improvement to build a strong company culture.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Employee%20Engagement%20Pulse%20Survey%20Tool'],
 },
};

export default function EmployeeEngagementSurveyLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
