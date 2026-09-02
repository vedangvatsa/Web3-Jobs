import { RemoteWorkChecklistClient } from '@/components/remote-work-checklist-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Remote Work Checklist',
 description: 'Optimize your remote workspace setup for peak productivity, strong digital security, and physical well-being. Includes a downloadable PDF checklist.',
 alternates: {
  canonical: 'https://hashtagweb3.com/remote-work-checklist',
 },
 openGraph: {
  type: 'website',
  title: 'Remote Work Checklist | Hashtag Web3',
  description: 'Optimize your remote workspace setup for peak productivity, strong digital security, and physical well-being. Includes a downloadable PDF checklist.',
  url: 'https://hashtagweb3.com/remote-work-checklist',
  images: [{
   url: 'https://hashtagweb3.com/api/og?type=default&title=Remote%20Work%20Checklist',
   width: 1200,
   height: 630,
   alt: 'Remote Work Checklist Tool',
  }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Remote Work Checklist | Hashtag Web3',
  description: 'Optimize your remote workspace setup for peak productivity, strong digital security, and physical well-being. Includes a downloadable PDF checklist.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Remote%20Work%20Checklist'],
 },
};

export default function RemoteWorkChecklistPage() {
 return (
  <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
    <div className="container mx-auto px-4 page-section">
     <RemoteWorkChecklistClient />
    </div>
   </main>
  </div>
 );
}
