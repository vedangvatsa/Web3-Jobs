import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer Portal & Public API Docs | Hashtag Web3',
  description: 'Public REST API, OpenAPI 3.1 schema, and MCP server documentation for Hashtag Web3. Programmatically access Web3 job listings, crypto news, blockchain events, and glossary definitions.',
  alternates: {
    canonical: 'https://hashtagweb3.com/developers',
  },
  openGraph: {
    title: 'Developer Portal & Public API Docs | Hashtag Web3',
    description: 'Explore the Hashtag Web3 Public API, OpenAPI 3.1 specs, and developer tools.',
    url: 'https://hashtagweb3.com/developers',
    images: [{ url: 'https://hashtagweb3.com/api/og?type=default&title=Developer%20API%20%26%20OpenAPI', width: 1200, height: 630 }],
  },
};

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
