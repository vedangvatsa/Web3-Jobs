
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Remote Work Readiness Checklist | Free Template',
 description: 'Remote work checklist for setup, security, collaboration, and productivity.',
 alternates: {
  canonical: '/remote-work-checklist',
 },
 openGraph: {
  type: 'website',
  title: 'Remote Work Readiness Checklist | Free Template',
  description: 'Optimize your remote setup. Our checklist covers everything from ergonomics to security for Web3 professionals.',
  url: 'https://hashtagweb3.com/remote-work-checklist',
  images: [
   {
    url: '/api/og?type=default&title=Remote%20Work%20Checklist',
    width: 1200,
    height: 630,
    alt: 'Remote Work Checklist',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Remote Work Readiness Checklist | Free Template',
  description: 'Use a practical checklist to improve your remote setup for Web3 work.',
  images: ['/api/og?type=default&title=Remote%20Work%20Checklist'],
 },
};

export default function RemoteWorkChecklistLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
