
import type { Metadata } from 'next';

const siteUrl = 'https://hashtagweb3.com';
const ogImageUrl = `${siteUrl}/api/og?type=article&title=Web3%20Playbook&category=Career%20Guides`;

export const metadata: Metadata = {
 title: 'Web3 Career Playbook',
 description: 'Actionable Web3 guides, career playbooks, and technical deep dives for builders, operators, and job seekers.',
 alternates: {
  canonical: '/blog',
 },
 openGraph: {
  type: 'website',
  title: 'Web3 Career Playbook | Hashtag Web3',
  description: 'Explore in depth Web3 articles on careers, technology, and industry insights to help you build a successful crypto career.',
  url: 'https://hashtagweb3.com/blog',
  images: [
   {
    url: ogImageUrl,
    width: 1200,
    height: 630,
    alt: 'The Web3 Playbook',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 Career Playbook | Hashtag Web3',
  description: 'Practical Web3 career guides and technical deep dives for builders and job seekers.',
  images: [ogImageUrl],
 },
};

export default function BlogLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
