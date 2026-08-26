
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Exit Survey',
 description: 'Generate an employee exit survey with our free tool. Gather valuable feedback from departing team members to improve retention and culture.',
 alternates: {
  canonical: '/employee-exit-survey',
 },
 openGraph: {
  type: 'website',
  title: 'Exit Survey | Hashtag Web3',
  description: 'Understand why employees leave and how you can improve. Create a professional exit survey with our free tool.',
  url: 'https://hashtagweb3.com/employee-exit-survey',
  images: [
   {
    url: 'https://hashtagweb3.com/api/og?type=default&title=Employee%20Exit%20Survey%20Tool',
    width: 1200,
    height: 630,
    alt: 'Employee Exit Survey Tool',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Exit Survey | Hashtag Web3',
  description: 'Generate professional exit surveys to gather valuable feedback from departing employees. Understand why team members leave and identify areas to improve retention and culture.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Employee%20Exit%20Survey%20Tool'],
 },
};

export default function EmployeeExitSurveyLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
