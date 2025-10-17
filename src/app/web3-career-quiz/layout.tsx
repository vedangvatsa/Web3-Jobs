
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Archetype Assessment | Find Your Crypto Career Path',
  description: "What's your Web3 personality? Take our free, quick assessment to discover your professional archetype and the crypto career paths that best match your skills.",
  alternates: {
    canonical: '/web3-career-quiz',
  },
  openGraph: {
    title: 'Web3 Archetype Assessment | Find Your Crypto Career Path',
    description: "What's your Web3 personality? Take our assessment to find out which career path is right for you.",
    url: 'https://hashtagweb3.com/web3-career-quiz',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-quiz.png',
        width: 1200,
        height: 630,
        alt: 'Web3 Archetype Assessment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Archetype Assessment | Find Your Crypto Career Path',
    description: "What's your Web3 personality? Take our assessment to find out.",
    images: ['https://hashtagweb3.com/og-image-quiz.png'],
  },
};

export default function Web3CareerQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
