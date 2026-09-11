import { getNewsFeed } from '@/lib/news';
import { getAllArticles } from '@/lib/articles';
import { NewsPageClient } from '@/components/news-page-client';
import type { Metadata } from 'next';
import type { WebPage, WithContext } from 'schema-dts';
import { PageHeader } from "@/components/page-header";
import { PageShell } from '@/components/page-shell';

export const revalidate = 300; // Revalidate every 5 minutes (ISR)

export const metadata: Metadata = {
 title: 'Web3 News',
 description: 'Stay ahead in the Web3 job market. Read daily crypto news, funding announcements, protocol launches, and corporate updates across blockchain, DeFi, DAOs, and NFTs.',
 alternates: {
  canonical: 'https://hashtagweb3.com/news',
 },
 openGraph: {
  type: 'website',
  title: 'Web3 News | Hashtag Web3',
  description: 'Stay ahead in the Web3 job market. Read daily crypto news, funding announcements, and protocol launches updated in real-time.',
  url: 'https://hashtagweb3.com/news',
  images: [{
   url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Daily%20News',
   width: 1200,
   height: 630,
   alt: 'Hashtag Web3 Daily News Feed',
  }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Web3 News | Hashtag Web3',
  description: 'Stay ahead in the Web3 job market. Read daily crypto news, funding announcements, and protocol launches updated in real-time.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Daily%20News'],
 },
};

export default async function NewsPage() {
 const [feedItems, articles] = await Promise.all([getNewsFeed(), getAllArticles()]);
 const nativeNews = articles
  .filter((article) => article.category === 'News')
  .map((article) => ({
   title: article.title,
   link: `/${article.slug}`,
   pubDate: article.publishedDate || article.lastUpdated || new Date().toISOString(),
   creator: 'Hashtag Web3',
   contentSnippet: article.description,
   source: 'Hashtag Web3',
  }));
 const newsItems = [...nativeNews, ...feedItems]
  .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
 const siteUrl = 'https://hashtagweb3.com';

 const pageSchema: WithContext<WebPage> = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  url: `${siteUrl}/news`,
  name:"Web3 News | Daily Crypto & Blockchain Career Updates",
  isPartOf: {
   '@type': 'WebSite',
   url: siteUrl,
   name: 'Hashtag Web3'
  },
  description:"Stay updated with Web3 news: new job openings, company funding, protocol launches, and career opportunities in crypto, DeFi, NFTs, and blockchain. Updated daily.",
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
        <PageHeader title="Web3 News" />
       <NewsPageClient initialNewsItems={newsItems} />
     </PageShell>
    </main>
   </div>
  </>
 );
}
