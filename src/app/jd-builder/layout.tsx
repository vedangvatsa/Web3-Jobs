
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Web3 Job Description Builder | Free Tool',
 description: 'Easily create professional job descriptions for Web3 roles. Our free builder helps you outline responsibilities to attract top crypto talent.',
 alternates: {
  canonical: '/jd-builder',
 },
 openGraph: {
  title: 'Web3 Job Description Builder | Free Tool',
  description: 'Craft the perfect job description to attract top Web3 talent with our free and easy-to-use builder. Outline roles and responsibilities.',
  url: 'https://hashtagweb3.com/jd-builder',
  images: [
   {
    url: 'https://hashtagweb3.com/og-image-tools.png',
    width: 1200,
    height: 630,
    alt: 'Web3 Job Description Builder',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 Job Description Builder | Free Tool',
  description: 'Create professional job descriptions for Web3 roles with our free builder. Outline responsibilities, qualifications, and benefits to attract top crypto talent to your team.',
  images: ['https://hashtagweb3.com/og-image-tools.png'],
 },
};

const webAppSchema = {
 '@context': 'https://schema.org',
 '@type': 'WebApplication',
 name: 'Job Description Builder',
 description: 'Create professional job descriptions for Web3 and blockchain roles.',
 url: 'https://hashtagweb3.com/jd-builder',
 applicationCategory: 'BusinessApplication',
 operatingSystem: 'Any',
 offers: {
  '@type': 'Offer',
  price: '0',
  priceCurrency: 'USD',
 },
};

export default function JobDescriptionBuilderLayout({
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
