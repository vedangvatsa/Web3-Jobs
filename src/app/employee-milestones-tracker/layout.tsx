
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employee 30-60-90 Day Plan | Free Milestones Tracker',
  description: 'Create a structured 30-60-90 day plan for new hires. Track employee milestones and align on goals to foster career progression with our free tool.',
  alternates: {
    canonical: '/employee-milestones-tracker',
  },
  openGraph: {
    title: 'Employee 30-60-90 Day Plan | Free Milestones Tracker',
    description: 'Plan and track employee growth with our free milestones tracker template. Align on goals for new hires in their first 30-60-90 days.',
    url: 'https://hashtagweb3.com/employee-milestones-tracker',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-tools.png',
        width: 1200,
        height: 630,
        alt: 'Employee Milestones Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Employee 30-60-90 Day Plan | Free Milestones Tracker',
    description: 'Create structured 30-60-90 day plans for your employees.',
    images: ['https://hashtagweb3.com/og-image-tools.png'],
  },
};

export default function EmployeeMilestonesTrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
