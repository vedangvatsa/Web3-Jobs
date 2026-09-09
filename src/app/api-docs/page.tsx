import type { Metadata } from 'next';
import DevelopersPage from '@/app/developers/page';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'API Docs & Developer Portal',
  description: 'Official Hashtag Web3 API documentation, OpenAPI 3.1 specifications, REST endpoint reference, authentication guide, and MCP server integrations.',
  alternates: {
    canonical: 'https://hashtagweb3.com/api-docs',
  },
  openGraph: {
    title: 'API Docs & Developer Portal',
    description: 'Official Hashtag Web3 API documentation, OpenAPI 3.1 specifications, REST endpoint reference, authentication guide, and MCP server integrations.',
    url: 'https://hashtagweb3.com/api-docs',
    images: [{ url: 'https://hashtagweb3.com/api/og?type=default&title=API%20Docs', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'API Docs & Developer Portal',
    description: 'Official Hashtag Web3 API documentation, OpenAPI 3.1 specifications, REST endpoint reference, authentication guide, and MCP server integrations.',
    images: ['https://hashtagweb3.com/api/og?type=default&title=API%20Docs'],
  },
};

export default function ApiDocsPage() {
  return <DevelopersPage />;
}
