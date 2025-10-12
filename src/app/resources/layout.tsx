
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Career Resources & Tools',
  description: 'A comprehensive collection of free tools and resources for Web3 professionals and employers, including resume builders, salary calculators, and interview preparation guides.',
  alternates: {
    canonical: '/resources',
  },
  openGraph: {
    title: 'Web3 Career Resources & Tools',
    description: 'Explore our suite of free tools designed to help you succeed in your Web3 career or build a top-tier team.',
    url: 'https://hashtagweb3.com/resources',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Web3 Career Resources & Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Career Resources & Tools',
    description: 'All the tools you need for your Web3 career, in one place.',
    images: ['https://hashtagweb3.com/og-image.png'],
  },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
