import type { Metadata } from 'next';
import DevelopersPage from '@/app/developers/page';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Hashtag Web3 Documentation & Developer Guides',
  description: 'Official documentation, API guides, authentication reference, and developer resources for Hashtag Web3.',
  alternates: {
    canonical: 'https://hashtagweb3.com/docs',
  },
  openGraph: {
    title: 'Hashtag Web3 Documentation & Developer Guides',
    description: 'Official documentation, API guides, authentication reference, and developer resources for Hashtag Web3.',
    url: 'https://hashtagweb3.com/docs',
  },
};

export default function DocsPage() {
  return <DevelopersPage />;
}
