
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Invoice Generator',
  description: 'A free and simple invoice generator for freelancers and contractors. No registration required. Download your invoice as a PDF instantly.',
  alternates: {
    canonical: '/invoice-generator',
  },
  openGraph: {
    title: 'Free Invoice Generator',
    description: 'Create and download professional invoices in seconds. Perfect for freelancers and contractors in the Web3 space.',
    url: 'https://hashtagweb3.com/invoice-generator',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Free Invoice Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Invoice Generator',
    description: 'Create and download professional invoices in seconds.',
    images: ['https://hashtagweb3.com/og-image.png'],
  },
};

export default function InvoiceGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
