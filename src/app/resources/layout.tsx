
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Free Web3 Career Tools | Resume, Salary, Interviews',
 description: 'Free tools for Web3 careers including a resume builder, salary calculator, interview questions, and offer letter templates.',
 alternates: {
  canonical: '/resources',
 },
 openGraph: {
  title: 'Free Web3 Career Tools | Resume, Salary, Interviews',
  description: 'Explore free Web3 tools for resumes, salaries, interviews, and offer letters. Built for professionals and hiring teams.',
  url: 'https://hashtagweb3.com/resources',
  images: [
   {
    url: 'https://hashtagweb3.com/og-image-tools.png',
    width: 1200,
    height: 630,
    alt: 'Web3 Career Resources & Tools',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Free Web3 Career Tools | Resume, Salary, Interviews',
  description: 'Free Web3 career tools for resumes, salaries, interviews, and offers.',
  images: ['https://hashtagweb3.com/og-image-tools.png'],
 },
};

export default function ResourcesLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
