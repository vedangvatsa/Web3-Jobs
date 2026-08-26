import { getAllArticles } from '@/lib/articles';
import { getJobs } from '@/lib/jobs';
import { getNewsFeed } from '@/lib/news';
import { CommunityPageContent } from '@/components/community-page-content';
import { Metadata } from 'next';
import type { WebPage } from 'schema-dts';
import { PageShell } from '@/components/page-shell';

export const revalidate = 43200; // Revalidate every 12 hours

export const metadata: Metadata = {
  title: 'A Global Web3 Community & Job Board',
  description: 'Your hub for Web3 careers. Explore thousands of crypto jobs, get career advice, and connect with a global community of blockchain professionals.',
  alternates: {
    canonical: '/community',
  },
  openGraph: {
    type: 'website',
    title: 'A Global Web3 Community & Job Board',
    description: 'Your hub for Web3 careers. Explore thousands of crypto jobs, get career advice, and connect with a global community of blockchain professionals.',
    url: 'https://hashtagweb3.com/community',
    images: [{
      url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Community',
      width: 1200,
      height: 630,
      alt: 'Hashtag Web3 Community',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Global Web3 Community & Job Board',
    description: 'Join 60,000+ Web3 professionals. Access exclusive jobs, career guides, salary data, and connect with the global blockchain community.',
    images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Community'],
  },
};

export default async function Page() {
  const latestJobs = await getJobs();
  const latestArticles = (await getAllArticles()).slice(0, 12);
  const latestNews = (await getNewsFeed()).slice(0, 10);
  
  const siteUrl = 'https://hashtagweb3.com';
  const pageSchema: WebPage = {
    '@type': 'WebPage',
    url: `${siteUrl}/community`,
    name: 'Web3 Community | Hashtag Web3',
    isPartOf: {
      '@type': 'WebSite',
      url: siteUrl,
      name: 'Hashtag Web3'
    },
    description: 'Your hub for Web3 careers. Explore thousands of crypto jobs, get career advice, and connect with a global community of blockchain professionals.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <PageShell>
            <CommunityPageContent 
              latestJobs={latestJobs}
              latestArticles={latestArticles}
              latestNews={latestNews}
            />
          </PageShell>
        </main>
      </div>
    </>
  );
}
