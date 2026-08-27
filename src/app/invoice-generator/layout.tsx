
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Invoice Generator',
 description: 'A free and simple invoice generator for Web3 freelancers and contractors. Create and download a professional PDF invoice instantly.',
 alternates: {
  canonical: 'https://hashtagweb3.com/invoice-generator',
 },
 openGraph: {
  type: 'website',
  title: 'Invoice Generator | Hashtag Web3',
  description: 'Create and download professional invoices in seconds. Perfect for freelancers and contractors in the Web3 space.',
  url: 'https://hashtagweb3.com/invoice-generator',
  images: [
   {
    url: 'https://hashtagweb3.com/api/og?type=default&title=Free%20Invoice%20Generator',
    width: 1200,
    height: 630,
    alt: 'Free Invoice Generator',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Invoice Generator | Hashtag Web3',
  description: 'Create and download professional PDF invoices in seconds. Perfect for Web3 freelancers and contractors. Just fill out and download instantly.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Free%20Invoice%20Generator'],
 },
};

export default function InvoiceGeneratorLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
