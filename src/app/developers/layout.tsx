import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hashtag Web3 API Docs & Developer Portal',
  description: 'Official Hashtag Web3 API documentation, REST API endpoints, OpenAPI 3.1 specifications, and Model Context Protocol (MCP) server integration.',
  alternates: {
    canonical: 'https://hashtagweb3.com/developers',
  },
  openGraph: {
    title: 'Hashtag Web3 API Docs & Developer Portal',
    description: 'Official Hashtag Web3 API documentation, REST API endpoints, OpenAPI 3.1 specifications, and Model Context Protocol (MCP) server integration.',
    url: 'https://hashtagweb3.com/developers',
    images: [{ url: 'https://hashtagweb3.com/api/og?type=default&title=Developer%20API%20%26%20OpenAPI', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hashtag Web3 API Docs & Developer Portal',
    description: 'Official Hashtag Web3 API documentation, REST API endpoints, OpenAPI 3.1 specifications, and Model Context Protocol (MCP) server integration.',
    images: ['https://hashtagweb3.com/api/og?type=default&title=Developer%20API%20%26%20OpenAPI'],
  },
};

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
