
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Nomad Visa List',
  description: 'A comprehensive, searchable list of digital nomad visas for Web3 professionals looking to work from anywhere in the world.',
  alternates: {
    canonical: '/digital-nomad-visas',
  },
   openGraph: {
    title: 'Digital Nomad Visa List',
    description: 'Find the perfect country to work from with our comprehensive list of digital nomad visas.',
    url: 'https://hashtagweb3.com/digital-nomad-visas',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-tools.png',
        width: 1200,
        height: 630,
        alt: 'Digital Nomad Visa List',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Nomad Visa List | Hashtag Web3',
    description: 'Find the perfect country to work from with our comprehensive list of digital nomad visas.',
    images: ['https://hashtagweb3.com/og-image-tools.png'],
  },
};

export default function DigitalNomadVisasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
