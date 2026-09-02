
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Web3 Community',
 description: 'Connect with the Web3 community. Discover industry partners, major companies hiring, media coverage, and events shaping the future of decentralized work.',
 alternates: {
  canonical: 'https://hashtagweb3.com/community',
 },
 openGraph: {
  type: 'website',
  title: 'Web3 Community',
  description: 'Connect with the Web3 community. Discover industry partners, major companies hiring, and events.',
  url: 'https://hashtagweb3.com/community',
  images: [{ url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Community', width: 1200, height: 630 }],
 },
 twitter: {
  card: 'summary_large_image',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Community'],
 },
};

export default function CommunityLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
