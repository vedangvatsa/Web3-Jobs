
import { Header } from '@/components/header';
import { getAllArticles } from '@/lib/articles';
import { getJobs } from '@/lib/jobs';
import { getNewsFeed } from '@/lib/news';
import { CommunityPageContent } from '@/components/community-page-content';
import { Metadata } from 'next';
import type { WebPage } from 'schema-dts';


export const revalidate = 43200; // Revalidate every 12 hours

export const metadata: Metadata = {
  title: 'Hashtag Web3 | A Global Web3 Community & Job Board',
  description: 'Join the Hashtag Web3 global community. Network with professionals, access exclusive career resources and tools, and stay ahead in the world of crypto, blockchain, and Web3 technology.',
  alternates: {
    canonical: '/',
  },
};

export default async function Page() {
  const latestJobs = await getJobs();
  const latestArticles = (await getAllArticles()).slice(0, 12);
  const latestNews = (await getNewsFeed()).slice(0, 10);
  
  const siteUrl = 'https://hashtagweb3.com';
  const pageSchema: WebPage = {
    '@type': 'WebPage',
    url: siteUrl,
    name: "Web3 Community | Hashtag Web3",
    isPartOf: {
        '@type': 'WebSite',
        url: siteUrl,
        name: 'Hashtag Web3'
    },
    description: "Join the Hashtag Web3 global community. Network with professionals, access exclusive resources, and stay ahead in the world of crypto, blockchain, and Web3 technology.",
  };

  return (
    <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
        />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <CommunityPageContent 
              latestJobs={latestJobs}
              latestArticles={latestArticles}
              latestNews={latestNews}
            />
          </main>
        </div>
    </>
  );
}
