
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Community | Industry Partners and Events',
  description: 'Connect with the Web3 community. Discover industry partners, major companies hiring, media coverage, and events shaping the future of decentralized work.',
  alternates: {
    canonical: '/community',
  },
  openGraph: {
    title: 'Web3 Community | Hashtag Web3',
    description: 'Connect with the Web3 community. Discover industry partners, major companies hiring, and events.',
    url: 'https://hashtagweb3.com/community',
    images: [{ url: 'https://hashtagweb3.com/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://hashtagweb3.com/og-image.png'],
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
