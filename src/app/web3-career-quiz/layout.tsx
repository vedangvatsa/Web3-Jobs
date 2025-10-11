
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Archetype Assessment',
  description: 'Take our quick assessment to discover your Web3 personality archetype and the career paths that match your skills and interests.',
  alternates: {
    canonical: '/web3-career-quiz',
  },
  openGraph: {
    title: 'Web3 Archetype Assessment',
    description: "What's your Web3 personality? Take our assessment to find out.",
    url: 'https://hashtagweb3.com/web3-career-quiz',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Web3 Archetype Assessment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Archetype Assessment',
    description: "What's your Web3 personality? Take our assessment to find out.",
    images: ['https://hashtagweb3.com/og-image.png'],
  },
};

export default function Web3CareerQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
