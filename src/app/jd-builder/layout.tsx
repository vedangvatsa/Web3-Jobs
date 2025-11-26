
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Job Description Builder | Free Tool',
  description: 'Easily create professional job descriptions for Web3 roles. Our free builder helps you outline responsibilities to attract top crypto talent.',
  alternates: {
    canonical: '/jd-builder',
  },
  openGraph: {
    title: 'Web3 Job Description Builder | Free Tool',
    description: 'Craft the perfect job description to attract top Web3 talent with our free and easy-to-use builder.',
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
    description: 'Craft the perfect job description to attract top Web3 talent.',
    images: ['https://hashtagweb3.com/og-image-tools.png'],
  },
};

export default function JobDescriptionBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
