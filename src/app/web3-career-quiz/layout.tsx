
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Web3 Archetype Assessment | Find Your Crypto Career Path',
 description:"What's your Web3 personality? Take our free assessment to discover your professional archetype and the crypto career paths that best match your skills.",
 alternates: {
  canonical: '/web3-career-quiz',
 },
 openGraph: {
  type: 'website',
  title: 'Web3 Archetype Assessment | Find Your Crypto Career Path',
  description:"What's your Web3 personality? Take our assessment to find out which career path is right for you in the crypto space.",
  url: 'https://hashtagweb3.com/web3-career-quiz',
  images: [
   {
    url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Career%20Assessment',
    width: 1200,
    height: 630,
    alt: 'Web3 Archetype Assessment',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 Archetype Assessment | Find Your Crypto Career Path',
  description:"Discover your Web3 professional archetype with our free assessment. Find out which crypto career paths best match your skills, interests, and working style in the decentralized economy.",
  images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Career%20Assessment'],
 },
};

const webAppSchema = {
 '@context': 'https://schema.org',
 '@type': 'WebApplication',
 name: 'Web3 Career Archetype Assessment',
 description: 'Discover your Web3 professional archetype and ideal career path with this interactive assessment.',
 url: 'https://hashtagweb3.com/web3-career-quiz',
 applicationCategory: 'EducationalApplication',
 operatingSystem: 'Any',
 offers: {
  '@type': 'Offer',
  price: '0',
  priceCurrency: 'USD',
 },
};

export default function Web3CareerQuizLayout({
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
