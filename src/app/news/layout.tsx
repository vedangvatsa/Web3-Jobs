
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Web3 News | Daily Crypto and Blockchain Headlines',
 description: 'Daily Web3, crypto, and blockchain headlines with concise summaries from top industry sources.',
 alternates: {
  canonical: '/news',
 },
 openGraph: {
  title: 'Web3 News | Daily Crypto and Blockchain Headlines',
  description: 'Stay updated with Web3 and crypto news. Top stories and brief summaries from trusted industry sources.',
  url: 'https://hashtagweb3.com/news',
  images: [
   {
    url: '/api/og?type=default&title=Web3%20News',
    width: 1200,
    height: 630,
    alt: 'Web3 News Feed',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 News | Daily Crypto and Blockchain Headlines',
  description: 'Your daily briefing on Web3, crypto, and blockchain headlines.',
  images: ['/api/og?type=default&title=Web3%20News'],
 },
};

export default function NewsLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
