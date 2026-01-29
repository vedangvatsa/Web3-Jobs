
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Career Resources | Free Tools for Your Crypto Career',
  description: 'Explore our suite of free tools designed to help you succeed in your Web3 career, from a resume builder to interview questions.',
  alternates: {
    canonical: '/resources',
  },
  openGraph: {
    title: 'Web3 Career Resources | Free Tools for Your Crypto Career',
    description: 'Explore our suite of free tools designed to help you succeed in your Web3 career or build a top-tier team in the crypto space.',
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
    title: 'Web3 Career Resources | Free Tools for Your Crypto Career',
    description: 'All the tools you need for your Web3 career, in one place.',
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
