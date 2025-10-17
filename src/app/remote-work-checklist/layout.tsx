
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remote Work Readiness Checklist | Free Template',
  description: 'A comprehensive checklist to optimize your remote work setup. Ensure you have the right ergonomic, security, and productivity tools for a successful career in Web3.',
  alternates: {
    canonical: '/remote-work-checklist',
  },
  openGraph: {
    title: 'Remote Work Readiness Checklist | Free Template',
    description: 'Optimize your remote setup. Our checklist covers everything from ergonomics to security for Web3 professionals.',
    url: 'https://hashtagweb3.com/remote-work-checklist',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-tools.png',
        width: 1200,
        height: 630,
        alt: 'Remote Work Checklist',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remote Work Readiness Checklist | Free Template',
    description: 'Optimize your remote setup for a successful Web3 career.',
    images: ['https://hashtagweb3.com/og-image-tools.png'],
  },
};

export default function RemoteWorkChecklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
