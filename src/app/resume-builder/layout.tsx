
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Professional Resume Builder',
  description: 'Create a professional resume that stands out to recruiters. Our free resume builder helps you highlight your skills, experience, and proof of work.',
  alternates: {
    canonical: '/resume-builder',
  },
  openGraph: {
    title: 'Free Professional Resume Builder',
    description: 'Craft a resume tailored for the modern job market. Our free builder helps you highlight your unique experience.',
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
    description: 'Craft a resume that gets noticed in the tech space.',
    images: ['https://hashtagweb3.com/og-image-tools.png'],
  },
};

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
