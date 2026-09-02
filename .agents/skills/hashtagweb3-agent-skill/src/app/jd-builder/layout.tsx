
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Web3 Job Description Builder | Free Tool',
 description: 'Easily create professional job descriptions for Web3 roles. Our free builder helps you outline responsibilities to attract top crypto talent.',
 alternates: {
  canonical: 'https://hashtagweb3.com/jd-builder',
 },
 openGraph: {
  type: 'website',
  title: 'Web3 Job Description Builder | Free Tool',
  description: 'Craft the perfect job description to attract top Web3 talent with our free and easy-to-use builder. Outline roles and responsibilities.',
  url: 'https://hashtagweb3.com/jd-builder',
  images: [
   {
    url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Job%20Description%20Builder',
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
  images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Job%20Description%20Builder'],
 },
};

export default function JobDescriptionBuilderLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
