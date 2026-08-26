
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Salary Calculator',
 description: 'Estimate your salary in the Web3 industry. Get data-driven salary estimates for developer, marketing, and product manager roles in crypto.',
 alternates: {
  canonical: '/salary-calculator',
 },
 openGraph: {
  type: 'website',
  title: 'Salary Calculator | Hashtag Web3',
  description: 'Curious what you could earn in Web3? Use our calculator for a salary estimate based on your role, experience, and location.',
  url: 'https://hashtagweb3.com/salary-calculator',
  images: [
   {
    url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Salary%20Calculator',
    width: 1200,
    height: 630,
    alt: 'Web3 Salary Calculator',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Salary Calculator | Hashtag Web3',
  description: 'Get data-driven salary estimates for Web3 roles including developers, marketers, and product managers. Calculate what you could earn based on your experience and location.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Salary%20Calculator'],
 },
};

const webAppSchema = {
 '@context': 'https://schema.org',
 '@type': 'WebApplication',
 name: 'Web3 Salary Calculator',
 description: 'Calculate estimated salaries for Web3 and cryptocurrency industry roles.',
 url: 'https://hashtagweb3.com/salary-calculator',
 applicationCategory: 'FinanceApplication',
 operatingSystem: 'Any',
 offers: {
  '@type': 'Offer',
  price: '0',
  priceCurrency: 'USD',
 },
};

export default function SalaryCalculatorLayout({
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
