import type { Metadata } from 'next';
import DevelopersPage from '@/app/developers/page';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Hashtag Web3 API Docs & Developer Portal',
  description: 'Official Hashtag Web3 API documentation, OpenAPI 3.1 specifications, REST endpoint reference, authentication guide, and MCP server integrations.',
  alternates: {
    canonical: 'https://hashtagweb3.com/api-docs',
  },
  openGraph: {
    title: 'Hashtag Web3 API Docs & Developer Portal',
    description: 'Official Hashtag Web3 API documentation, OpenAPI 3.1 specifications, REST endpoint reference, authentication guide, and MCP server integrations.',
    url: 'https://hashtagweb3.com/api-docs',
  },
};

export default function ApiDocsPage() {
  return <DevelopersPage />;
}
