
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Free Invoice Generator for Freelancers',
 description: 'A free and simple invoice generator for Web3 freelancers and contractors. Create and download a professional PDF invoice instantly.',
 alternates: {
  canonical: '/invoice-generator',
 },
 openGraph: {
  type: 'website',
  title: 'Free Invoice Generator for Freelancers',
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
  title: 'Free Invoice Generator for Freelancers',
  description: 'Create and download professional PDF invoices in seconds. Perfect for Web3 freelancers and contractors. Just fill out and download instantly.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Free%20Invoice%20Generator'],
 },
};

const webAppSchema = {
 '@context': 'https://schema.org',
 '@type': 'WebApplication',
 name: 'Invoice Generator',
 description: 'Free invoice generator for freelancers and contractors. Create professional PDF invoices instantly.',
 url: 'https://hashtagweb3.com/invoice-generator',
 applicationCategory: 'FinanceApplication',
 operatingSystem: 'Any',
 offers: {
  '@type': 'Offer',
  price: '0',
  priceCurrency: 'USD',
 },
};

export default function InvoiceGeneratorLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <>
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
   />
   {children}
  </>
 );
}
