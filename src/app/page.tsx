
import { Header } from '@/components/header';
import { getAllArticles } from '@/lib/articles';
import { getJobs } from '@/lib/jobs';
import { getNewsFeed } from '@/lib/news';
import type { Article, NewsItem } from '@/types';
import type { WebPage } from 'schema-dts';
import { CommunityPageContent } from '@/components/community-page-content';

export const revalidate = 43200; // Revalidate every 12 hours

export default async function Page() {
  const latestJobs = (await getJobs());
  const latestArticles = (await getAllArticles()).slice(0, 6);
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
        <div className="flex flex-col min-h-screen bg-background">
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
