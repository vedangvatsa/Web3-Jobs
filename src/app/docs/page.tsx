import type { Metadata } from 'next';
import DevelopersPage from '@/app/developers/page';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Documentation & Developer Guides',
  description: 'Official documentation, API guides, authentication reference, and developer resources for Hashtag Web3.',
  alternates: {
    canonical: 'https://hashtagweb3.com/docs',
  },
  openGraph: {
    title: 'Documentation & Developer Guides',
    description: 'Official documentation, API guides, authentication reference, and developer resources for Hashtag Web3.',
    url: 'https://hashtagweb3.com/docs',
    images: [{ url: 'https://hashtagweb3.com/api/og?type=default&title=Documentation', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentation & Developer Guides',
    description: 'Official documentation, API guides, authentication reference, and developer resources for Hashtag Web3.',
    images: ['https://hashtagweb3.com/api/og?type=default&title=Documentation'],
  },
};

export default function DocsPage() {
  return <DevelopersPage />;
}
