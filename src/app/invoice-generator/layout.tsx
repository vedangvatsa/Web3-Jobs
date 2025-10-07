
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Invoice Generator',
  description: 'A free and simple invoice generator for freelancers and contractors. No registration required. Download your invoice as a PDF instantly.',
  openGraph: {
    title: 'Free Invoice Generator | Hashtag Web3',
    description: 'Create and download professional invoices in seconds. Perfect for freelancers and contractors in the Web3 space.',
    images: [
      {
        url: 'https://hashtagweb3.com/logo/previews/Hashtag%20Web3%20Community.jpeg',
        width: 1200,
        height: 630,
        alt: 'Free Invoice Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Invoice Generator | Hashtag Web3',
    description: 'Create and download professional invoices in seconds.',
    images: ['https://hashtagweb3.com/logo/previews/Hashtag%20Web3%20Community.jpeg'],
  },
};

export default function InvoiceGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
