
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Digital Nomad Visa List | Work From Anywhere',
 description: 'A searchable list of digital nomad visas for Web3 professionals. Find details for over 50 crypto-friendly countries to work from anywhere.',
 alternates: {
  canonical: '/digital-nomad-visas',
 },
  openGraph: {
  type: 'website',
  title: 'Digital Nomad Visa List | Work From Anywhere',
  description: 'Browse digital nomad visa options with country-level details for Web3 professionals.',
  url: 'https://hashtagweb3.com/digital-nomad-visas',
  images: [
   {
    url: '/api/og?type=default&title=Digital%20Nomad%20Visa%20List',
    width: 1200,
    height: 630,
    alt: 'Digital Nomad Visa List',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Digital Nomad Visa List | Work From Anywhere',
  description: 'Compare digital nomad visa options and eligibility details for remote Web3 work.',
  images: ['/api/og?type=default&title=Digital%20Nomad%20Visa%20List'],
 },
};

export default function DigitalNomadVisasLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
