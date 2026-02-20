
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Community | Industry Partners and Events',
  description: 'Connect with the Web3 community. Discover industry partners, major companies hiring, media coverage, and events shaping the future of decentralized work.',
  alternates: {
    canonical: '/community',
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
