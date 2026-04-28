
'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { ExternalLink, Rss, Newspaper, ArrowRight } from 'lucide-react';
import { trackNewsClick, trackCTAClick } from '@/lib/posthog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { NewsItem } from '@/types';
import type { WebPage, NewsArticle, WithContext } from 'schema-dts';

function NewsCardSkeleton() {
 return (
  <Card className="bg-background border border-white/10">
   <CardHeader>
    <div className="flex items-center justify-between gap-2 mb-2">
     <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <Skeleton className="h-6 w-3/4" />
   </CardHeader>
   <CardContent>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6" />
   </CardContent>
   <CardFooter>
    <Skeleton className="h-5 w-28" />
   </CardFooter>
  </Card>
 );
}

export default function NewsPage() {
 const [newsItems, setNewsItems] = React.useState<NewsItem[]>([]);
 const [loading, setLoading] = React.useState(true);

 React.useEffect(() => {
  async function fetchNews() {
   try {
    const response = await fetch('/api/news');
    if (!response.ok) {
     throw new Error('Failed to fetch news');
    }
    const data = await response.json();
    setNewsItems(data);
   } catch (error) {
    console.error(error);
   } finally {
    setLoading(false);
   }
  }
  fetchNews();
 }, []);
 
 const siteUrl = 'https://hashtagweb3.com';
 
 const pageSchema: WithContext<WebPage> = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  url: `${siteUrl}/news`,
  name: "Web3 News 2026 | Daily Crypto & Blockchain Career Updates",
  isPartOf: {
   '@type': 'WebSite',
   url: siteUrl,
   name: 'Hashtag Web3'
  },
  description: "Stay updated with Web3 news for 2026: new job openings, company funding, protocol launches, and career opportunities in crypto, DeFi, NFTs, and blockchain. Updated daily.",
 };

 const newsArticlesSchema: WithContext<NewsArticle>[] = newsItems.map(item => ({
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: item.title,
  url: item.link,
  datePublished: new Date(item.pubDate).toISOString(),
  author: {
    '@type': 'Organization',
    name: item.source
  },
  publisher: {
    '@type': 'Organization',
    name: "Hashtag Web3",
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`
    }
  }
 }));

 return (
  <>
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
   />
   {newsItems.length > 0 && (
    <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticlesSchema) }}
    />
   )}
   <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1">
     <div className="container mx-auto px-4 py-12 md:py-16">
      <section className="mb-10 max-w-6xl mx-auto">
       <h1 className="text-3xl font-bold tracking-tight mb-3">
        Web3 News Feed
       </h1>
       <p className="text-muted-foreground text-lg">
        Aggregated news from top crypto sources. Updated frequently.
       </p>
      </section>

      <div className="max-w-6xl mx-auto">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {loading ? (
         [...Array(12)].map((_, i) => <NewsCardSkeleton key={i} />)
        ) : (
          newsItems.map((item, index) => (
           <Card key={index} className="transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-none border bg-transparent">
            <CardHeader className="pb-3">
             <div className="flex items-center justify-between gap-2 mb-1">
              <Badge variant={
               item.source === 'Decrypt' ? 'destructive' :
               item.source === 'Cointelegraph' ? 'secondary' :
               item.source === 'Coindesk' ? 'default' :
               'outline'
              } className="text-[10px] uppercase font-semibold">
               {item.source}
              </Badge>
              <span className="text-xs text-muted-foreground font-medium">{item.creator || new Date(item.pubDate).toLocaleDateString()}</span>
             </div>
             <CardTitle className="text-xl leading-tight">
              <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={() => trackNewsClick(item.title, item.link, item.source)} className="hover:text-primary hover:underline underline-offset-4 transition-colors">
               {item.title}
              </a>
             </CardTitle>
            </CardHeader>
            <CardContent>
             <p className="text-muted-foreground text-sm leading-relaxed">{item.contentSnippet}</p>
            </CardContent>
           </Card>
          ))
        )}
       </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Stay Ahead with Our News Feed</h3>
              <p className="text-sm text-muted-foreground">Get the latest Web3 updates delivered directly to your Telegram.</p>
            </div>
            <a href="https://t.me/web3newsfeed" target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('join_news_feed', 'https://t.me/web3newsfeed')} className="flex-shrink-0">
              <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                Join Telegram
              </span>
            </a>
        </div>
      </div>
     </div>
    </main>
   </div>
  </>
 );
}
