
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company Culture Guide Builder',
  description: 'A free tool to help you define and document your company culture. Create a comprehensive guide to share your values, communication norms, and team rituals.',
  openGraph: {
    title: 'Company Culture Guide Builder | Hashtag Web3',
    description: 'Define and share your company culture. Our free tool helps you create a professional culture guide.',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-culture-guide.png',
        width: 1200,
        height: 630,
        alt: 'Company Culture Guide Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Company Culture Guide Builder | Hashtag Web3',
    description: 'Create a professional company culture guide in seconds.',
    images: ['https://hashtagweb3.com/og-image-culture-guide.png'],
  },
};

export default function CompanyCultureGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
