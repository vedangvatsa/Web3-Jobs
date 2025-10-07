
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 News Feed',
  description: 'The latest news and headlines from the world of Web3, cryptocurrency, and blockchain technology, aggregated from top industry sources.',
  openGraph: {
    title: 'Web3 News Feed | Hashtag Web3',
    description: 'Stay updated with the latest in Web3. Our news feed aggregates top stories from across the crypto industry.',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-news.png',
        width: 1200,
        height: 630,
        alt: 'Web3 News Feed',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 News Feed | Hashtag Web3',
    description: 'Your daily briefing on everything happening in the world of crypto and blockchain.',
    images: ['https://hashtagweb3.com/og-image-news.png'],
  },
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
