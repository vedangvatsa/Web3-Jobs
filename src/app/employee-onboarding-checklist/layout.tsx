
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Employee Onboarding Checklist',
  description: 'A comprehensive checklist for successfully onboarding new hires into a Web3 company, covering culture, security, and role-specific training.',
  openGraph: {
    title: 'Web3 Employee Onboarding Checklist | Hashtag Web3',
    description: 'Ensure a smooth onboarding for your new Web3 hires with our comprehensive checklist.',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-onboarding-checklist.png',
        width: 1200,
        height: 630,
        alt: 'Web3 Employee Onboarding Checklist',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Employee Onboarding Checklist | Hashtag Web3',
    description: 'The ultimate checklist for onboarding new talent in the Web3 space.',
    images: ['https://hashtagweb3.com/og-image-onboarding-checklist.png'],
  },
};

export default function EmployeeOnboardingChecklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
