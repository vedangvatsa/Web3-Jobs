
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Jobs | The #1 Job Board for Crypto & Blockchain Roles',
  description: 'The best job board for Web3, crypto, and blockchain roles. Discover exclusive opportunities at leading Web3 companies, DAOs, and crypto startups.',
  alternates: {
    canonical: '/jobs',
  },
  openGraph: {
    title: 'Web3 Jobs | The #1 Job Board for Crypto & Blockchain Roles',
    description: 'The best job board for Web3, crypto, and blockchain roles. Discover exclusive opportunities at leading Web3 companies, DAOs, and crypto startups.',
    url: 'https://hashtagweb3.com/jobs',
    images: [
      {
        url: 'https://hashtagweb3.com/logo/previews/Hashtag%20Web3%20Community.jpeg',
        width: 1200,
        height: 630,
        alt: 'Web3 Job Board',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Jobs | The #1 Job Board for Crypto & Blockchain Roles',
    description: 'The best job board for Web3, crypto, and blockchain roles. Discover exclusive opportunities at leading Web3 companies, DAOs, and crypto startups.',
    images: ['https://hashtagweb3.com/logo/previews/Hashtag%20Web3%20Community.jpeg'],
  },
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
