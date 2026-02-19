
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company Culture Guide Builder',
  description: 'A free tool to help you define and document your company culture. Create a comprehensive guide to share your values and communication norms.',
  alternates: {
    canonical: '/company-culture-guide',
  },
  openGraph: {
    title: 'Company Culture Guide Builder',
    description: 'Define and share your company culture. Our free tool helps you create a professional culture guide to align your team and attract talent.',
    url: 'https://hashtagweb3.com/company-culture-guide',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-tools.png',
        width: 1200,
        height: 630,
        alt: 'Company Culture Guide Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Company Culture Guide Builder',
    description: 'Define and document your company culture with our free builder. Create a comprehensive guide to share your values, communication norms, and team rituals to attract aligned talent.',
    images: ['https://hashtagweb3.com/og-image-tools.png'],
  },
};

export default function CompanyCultureGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
