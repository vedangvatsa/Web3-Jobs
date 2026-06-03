
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Company Culture Guide Builder',
 description: 'A free tool to help you define and document your company culture. Create a complete guide to share your values and communication norms.',
 alternates: {
  canonical: '/company-culture-guide',
 },
 openGraph: {
  type: 'website',
  title: 'Company Culture Guide Builder',
  description: 'Define and share your company culture. Our free tool helps you create a professional culture guide to align your team and attract talent.',
  url: 'https://hashtagweb3.com/company-culture-guide',
  images: [
   {
    url: '/api/og?type=default&title=Company%20Culture%20Guide%20Builder',
    width: 1200,
    height: 630,
    alt: 'Company Culture Guide Builder',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Company Culture Guide Builder',
  description: 'Define and document your company culture with our free builder. Create a complete guide to share your values, communication norms, and team rituals to attract aligned talent.',
  images: ['/api/og?type=default&title=Company%20Culture%20Guide%20Builder'],
 },
};

export default function CompanyCultureGuideLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
