
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Work-Life Balance Survey Builder | Free Template',
 description: 'Generate a free survey to assess work-life balance on your team. Understand workload and stress levels to prevent burnout and build a healthier culture.',
 alternates: {
  canonical: '/work-life-balance-survey',
 },
 openGraph: {
  type: 'website',
  title: 'Work-Life Balance Survey Builder | Free Template',
  description: 'Help your team avoid burnout. Generate a work-life balance survey with our free tool to assess workload, stress, and team well-being.',
  url: 'https://hashtagweb3.com/work-life-balance-survey',
  images: [
   {
    url: '/api/og?type=default&title=Work-Life%20Balance%20Survey%20Builder',
    width: 1200,
    height: 630,
    alt: 'Work-Life Balance Survey Builder',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Work-Life Balance Survey Builder | Free Template',
  description:"Create a survey to assess and improve your team's work-life balance.",
  images: ['/api/og?type=default&title=Work-Life%20Balance%20Survey%20Builder'],
 },
};

export default function WorkLifeBalanceSurveyLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
