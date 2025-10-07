
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employee Milestones Tracker',
  description: 'A free tool to help you create a structured plan for tracking employee milestones and career progression. Set clear goals for 30, 60, and 90 days.',
  openGraph: {
    title: 'Employee Milestones Tracker',
    description: 'Plan and track employee growth with our free milestones tracker template.',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-milestones-tracker.png',
        width: 1200,
        height: 630,
        alt: 'Employee Milestones Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Employee Milestones Tracker | Hashtag Web3',
    description: 'Create structured 30-60-90 day plans for your employees.',
    images: ['https://hashtagweb3.com/og-image-milestones-tracker.png'],
  },
};

export default function EmployeeMilestonesTrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
