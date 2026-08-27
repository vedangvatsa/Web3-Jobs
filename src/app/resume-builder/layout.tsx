
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Resume Builder',
 description: 'Create a professional resume that stands out to recruiters. Our free builder helps you highlight your skills and experience to land your dream job.',
 alternates: {
  canonical: 'https://hashtagweb3.com/resume-builder',
 },
 openGraph: {
  type: 'website',
  title: 'Resume Builder | Hashtag Web3',
  description: 'Craft a resume tailored for the modern job market. Our free builder helps you highlight your unique skills and professional experience.',
  url: 'https://hashtagweb3.com/resume-builder',
  images: [
   {
    url: 'https://hashtagweb3.com/api/og?type=default&title=Free%20Resume%20Builder',
    width: 1200,
    height: 630,
    alt: 'Free Resume Builder',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Resume Builder | Hashtag Web3',
  description: 'Craft a professional resume tailored for the modern job market. Highlight your unique skills and experience to stand out to recruiters and land your dream role.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Free%20Resume%20Builder'],
 },
};

export default function ResumeBuilderLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
