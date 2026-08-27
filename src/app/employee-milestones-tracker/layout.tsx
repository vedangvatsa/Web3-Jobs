
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Milestones Tracker',
 description: 'Create a structured 30-60-90 day plan for new hires. Track employee milestones and align on goals to support career progression with our free tool.',
 alternates: {
  canonical: 'https://hashtagweb3.com/employee-milestones-tracker',
 },
 openGraph: {
  type: 'website',
  title: 'Milestones Tracker | Hashtag Web3',
  description: 'Plan and track employee growth with our free milestones tracker template. Align on goals for new hires in their first 30-60-90 days.',
  url: 'https://hashtagweb3.com/employee-milestones-tracker',
  images: [
   {
    url: 'https://hashtagweb3.com/api/og?type=default&title=Employee%20Milestones%20Tracker',
    width: 1200,
    height: 630,
    alt: 'Employee Milestones Tracker',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Milestones Tracker | Hashtag Web3',
  description: 'Create structured 30-60-90 day plans for new hires. Track employee milestones, align on goals, and support career progression with our free milestone tracking tool.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Employee%20Milestones%20Tracker'],
 },
};

export default function EmployeeMilestonesTrackerLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
