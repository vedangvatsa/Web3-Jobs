import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Hashtag Web3',
  description: 'Learn about Hashtag Web3, the leading Web3 job board, career intelligence platform, and global blockchain community connecting 60,000+ professionals with top crypto companies.',
  alternates: {
    canonical: 'https://hashtagweb3.com/about',
  },
  openGraph: {
    title: 'About Us | Hashtag Web3',
    description: 'Learn about Hashtag Web3, the leading Web3 job board and career intelligence platform.',
    url: 'https://hashtagweb3.com/about',
    images: [{ url: 'https://hashtagweb3.com/api/og?type=default&title=About%20Hashtag%20Web3', width: 1200, height: 630 }],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
