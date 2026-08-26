
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Digital Nomad Visas',
 description: 'A searchable list of digital nomad visas for Web3 professionals. Find details for over 50 crypto-friendly countries to work from anywhere.',
 alternates: {
  canonical: '/digital-nomad-visas',
 },
  openGraph: {
  type: 'website',
  title: 'Digital Nomad Visas | Hashtag Web3',
  description: 'Browse digital nomad visa options with country-level details for Web3 professionals.',
  url: 'https://hashtagweb3.com/digital-nomad-visas',
  images: [
   {
     url: 'https://hashtagweb3.com/api/og?type=default&title=Visas%20for%20Digital%20Nomads',
    width: 1200,
    height: 630,
    alt: 'Visas for Digital Nomads',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Digital Nomad Visas | Hashtag Web3',
  description: 'Compare digital nomad visa options and eligibility details for remote Web3 work.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Visas%20for%20Digital%20Nomads'],
 },
};

export default function DigitalNomadVisasLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
