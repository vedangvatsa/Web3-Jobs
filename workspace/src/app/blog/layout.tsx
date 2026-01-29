
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Web3 Playbook',
  description: 'Your complete guide to the world of Web3. Explore in-depth articles on careers, technology, and industry insights to navigate the decentralized economy.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'The Web3 Playbook',
    description: 'Explore in-depth articles on careers, technology, and industry insights to navigate the decentralized economy.',
    url: 'https://hashtagweb3.com/blog',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-blog.png',
        width: 1200,
        height: 630,
        alt: 'The Web3 Playbook',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Web3 Playbook',
    description: 'Your complete guide to the world of Web3. In-depth articles on careers, technology, and industry insights.',
    images: ['https://hashtagweb3.com/og-image-blog.png'],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
