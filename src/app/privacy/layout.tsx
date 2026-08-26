import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Hashtag Web3 Privacy Policy. Learn how we handle your data, protect user privacy, and manage AI crawler indexing permissions.',
  alternates: {
    canonical: 'https://hashtagweb3.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Hashtag Web3',
    description: 'Hashtag Web3 Privacy Policy. Data protection and user rights.',
    url: 'https://hashtagweb3.com/privacy',
    images: [{ url: 'https://hashtagweb3.com/api/og?type=default&title=Privacy%20Policy', width: 1200, height: 630 }],
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
