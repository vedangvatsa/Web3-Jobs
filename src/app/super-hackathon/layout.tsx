
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Super Hackathon | Build, Scale, & Get Noticed',
  description: 'Join the Super Hackathon on opBNB. Build your dApp, earn up to $20,000 USDT, and gain visibility among leading Web3 investors and partners.',
  alternates: {
    canonical: '/super-hackathon',
  },
  openGraph: {
    title: 'Super Hackathon | Build, Scale, & Get Noticed',
    description: 'Build your dApp, earn up to $20,000 USDT, and gain visibility among leading Web3 investors and partners like BNB Chain and Google Cloud.',
    url: 'https://hashtagweb3.com/super-hackathon',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Super Hackathon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Super Hackathon | Build, Scale, & Get Noticed',
    description: 'Join the Super Hackathon on opBNB and compete for a $20,000 prize pool.',
    images: ['https://hashtagweb3.com/og-image.png'],
  },
};

export default function SuperHackathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
