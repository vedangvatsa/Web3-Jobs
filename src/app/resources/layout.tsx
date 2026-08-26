
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Career Tools',
 description: 'Free tools for Web3 careers including a resume builder, salary calculator, interview questions, and offer letter templates.',
 alternates: {
  canonical: '/resources',
 },
 openGraph: {
  type: 'website',
  title: 'Career Tools | Hashtag Web3',
  description: 'Explore free Web3 tools for resumes, salaries, interviews, and offer letters. Built for professionals and hiring teams.',
  url: 'https://hashtagweb3.com/resources',
  images: [
   {
    url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Career%20Resources%20%26%20Tools',
    width: 1200,
    height: 630,
    alt: 'Web3 Career Resources & Tools',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Career Tools | Hashtag Web3',
  description: 'Free Web3 career tools for resumes, salaries, interviews, and offers.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Career%20Resources%20%26%20Tools'],
 },
};

export default function ResourcesLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
