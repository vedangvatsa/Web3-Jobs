
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Jobs | The #1 Crypto & Blockchain Job Board',
  description: 'The best job board for Web3, crypto, and blockchain roles. Discover exclusive opportunities at leading Web3 companies, DAOs, and crypto startups.',
  alternates: {
    canonical: '/jobs',
  },
  openGraph: {
    title: 'Web3 Jobs | The #1 Crypto & Blockchain Job Board',
    description: 'Find exclusive opportunities at leading Web3 companies, DAOs, and crypto startups on the #1 job board for the decentralized economy.',
    url: 'https://hashtagweb3.com/jobs',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-jobs.png',
        width: 1200,
        height: 630,
        alt: 'Web3 Job Board',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Jobs | The #1 Crypto & Blockchain Job Board',
    description: 'Discover exclusive opportunities at leading Web3 companies, DAOs, and crypto startups. The #1 job board for Web3.',
    images: ['https://hashtagweb3.com/og-image-jobs.png'],
  },
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
