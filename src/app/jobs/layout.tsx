
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Jobs and Crypto Roles | Remote and Full Time',
  description: 'Browse Web3 job listings in engineering, product, design, and marketing. Updated daily with roles from leading crypto companies and DAOs.',
  alternates: {
    canonical: '/jobs',
  },
  openGraph: {
    title: 'Web3 Jobs and Crypto Roles | Remote and Full Time',
    description: 'Find Web3 job listings across engineering, product, design, and marketing. Discover roles at leading crypto companies and DAOs.',
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
    title: 'Web3 Jobs and Crypto Roles | Remote and Full Time',
    description: 'Discover Web3 job listings across engineering, product, design, and marketing roles.',
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
