
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Work-Life Balance Survey Builder',
  description: 'A free tool to generate a survey to assess work-life balance within your team. Understand workload, stress levels, and identify areas to prevent burnout.',
  alternates: {
    canonical: '/work-life-balance-survey',
  },
  openGraph: {
    title: 'Work-Life Balance Survey Builder',
    description: 'Help your team avoid burnout. Generate a work-life balance survey with our free tool.',
    url: 'https://hashtagweb3.com/work-life-balance-survey',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-tools.png',
        width: 1200,
        height: 630,
        alt: 'Work-Life Balance Survey Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work-Life Balance Survey Builder | Hashtag Web3',
    description: 'Create a survey to assess and improve your team\'s work-life balance.',
    images: ['https://hashtagweb3.com/og-image-tools.png'],
  },
};

export default function WorkLifeBalanceSurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
