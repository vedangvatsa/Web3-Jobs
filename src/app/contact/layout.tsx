import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Hashtag Web3',
  description: 'Get in touch with the Hashtag Web3 team for hiring partnerships, advertising, job posting inquiries, developer API support, or feedback.',
  alternates: {
    canonical: 'https://hashtagweb3.com/contact',
  },
  openGraph: {
    title: 'Contact Us | Hashtag Web3',
    description: 'Get in touch with the Hashtag Web3 team for hiring, partnerships, or API support.',
    url: 'https://hashtagweb3.com/contact',
    images: [{ url: 'https://hashtagweb3.com/api/og?type=default&title=Contact%20Hashtag%20Web3', width: 1200, height: 630 }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
