
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Free Professional Resume Builder',
 description: 'Create a professional resume that stands out to recruiters. Our free builder helps you highlight your skills and experience to land your dream job.',
 alternates: {
  canonical: '/resume-builder',
 },
 openGraph: {
  title: 'Free Professional Resume Builder',
  description: 'Craft a resume tailored for the modern job market. Our free builder helps you highlight your unique skills and professional experience.',
  url: 'https://hashtagweb3.com/resume-builder',
  images: [
   {
    url: 'https://hashtagweb3.com/og-image-tools.png',
    width: 1200,
    height: 630,
    alt: 'Free Resume Builder',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Free Professional Resume Builder',
  description: 'Craft a professional resume tailored for the modern job market. Highlight your unique skills and experience to stand out to recruiters and land your dream role.',
  images: ['https://hashtagweb3.com/og-image-tools.png'],
 },
};

const webAppSchema = {
 '@context': 'https://schema.org',
 '@type': 'WebApplication',
 name: 'Resume Builder',
 description: 'Create professional resumes with our free online resume builder tool.',
 url: 'https://hashtagweb3.com/resume-builder',
 applicationCategory: 'BusinessApplication',
 operatingSystem: 'Any',
 offers: {
  '@type': 'Offer',
  price: '0',
  priceCurrency: 'USD',
 },
};

export default function ResumeBuilderLayout({
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
