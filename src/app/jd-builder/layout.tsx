
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Job Description Builder',
  description: 'Easily create professional job descriptions for Web3 roles. Our free builder helps you outline responsibilities, qualifications, and more to attract top talent.',
  openGraph: {
    title: 'Web3 Job Description Builder',
    description: 'Craft the perfect job description to attract top Web3 talent with our free and easy-to-use builder.',
    images: [
      {
        url: 'https://hashtagweb3.com/logo/previews/Hashtag%20Web3%20Community.jpeg',
        width: 1200,
        height: 630,
        alt: 'Web3 Job Description Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Job Description Builder | Hashtag Web3',
    description: 'Craft the perfect job description to attract top Web3 talent.',
    images: ['https://hashtagweb3.com/logo/previews/Hashtag%20Web3%20Community.jpeg'],
  },
};

export default function JobDescriptionBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
