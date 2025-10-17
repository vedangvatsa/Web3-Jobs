
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employee Exit Survey Tool | Free Template',
  description: 'Generate a comprehensive employee exit survey with our free tool. Gather valuable feedback from departing team members to improve retention and company culture.',
  alternates: {
    canonical: '/employee-exit-survey',
  },
  openGraph: {
    title: 'Employee Exit Survey Tool | Free Template',
    description: 'Understand why employees leave and how you can improve. Create a professional exit survey with our free tool.',
    url: 'https://hashtagweb3.com/employee-exit-survey',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-tools.png',
        width: 1200,
        height: 630,
        alt: 'Employee Exit Survey Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Employee Exit Survey Tool | Free Template',
    description: 'Create professional employee exit surveys in seconds.',
    images: ['https://hashtagweb3.com/og-image-tools.png'],
  },
};

export default function EmployeeExitSurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
