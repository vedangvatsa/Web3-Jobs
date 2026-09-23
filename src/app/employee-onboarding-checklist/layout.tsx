
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Onboarding Checklist',
 description: 'Onboarding checklist for Web3 teams covering culture, security, role training, and first-90-day execution.',
 alternates: {
  canonical: 'https://hashtagweb3.com/employee-onboarding-checklist',
 },
 openGraph: {
  type: 'website',
  title: 'Onboarding Checklist',
  description: 'Run structured onboarding for Web3 hires with clear tasks across culture, security, and role-specific training.',
  url: 'https://hashtagweb3.com/employee-onboarding-checklist',
  images: [
   {
    url: 'https://hashtagweb3.com/og-image-tools.png',
    width: 1200,
    height: 630,
    alt: 'Web3 Employee Onboarding Checklist',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Onboarding Checklist',
  description: 'Use a practical onboarding checklist for new Web3 team members.',
  images: ['https://hashtagweb3.com/og-image-tools.png'],
 },
};

export default function EmployeeOnboardingChecklistLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
