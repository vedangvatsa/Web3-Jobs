import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Hashtag Web3, our global community, career resources, hiring support, founder interviews and event collaborations.',
  alternates: {
    canonical: 'https://hashtagweb3.com/about',
  },
  openGraph: {
    title: 'About Us | Hashtag Web3',
    description: 'Meet the community behind Hashtag Web3: jobs, career resources, founder conversations and event collaborations.',
    url: 'https://hashtagweb3.com/about',
    images: [{ url: 'https://hashtagweb3.com/og/pages/about.png', width: 1200, height: 630 }],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
