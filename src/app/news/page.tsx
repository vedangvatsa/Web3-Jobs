
'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Newspaper } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { trackNewsClick, trackCTAClick } from '@/lib/posthog';
import type { NewsItem } from '@/types';
import type { WebPage, NewsArticle, WithContext } from 'schema-dts';

function NewsCardSkeleton() {
 return (
  <Card className="flex flex-col h-full">
   <CardHeader className="pb-2 pt-4 px-4">
    <Skeleton className="h-4 w-16 rounded-full mb-2" />
    <Skeleton className="h-5 w-3/4" />
   </CardHeader>
   <CardContent className="pt-0 pb-3 px-4">
    <Skeleton className="h-4 w-full mb-1" />
    <Skeleton className="h-4 w-5/6" />
   </CardContent>
  </Card>
 );
}

export default function NewsPage() {
 const [newsItems, setNewsItems] = React.useState<NewsItem[]>([]);
 const [loading, setLoading] = React.useState(true);
 const [searchQuery, setSearchQuery] = React.useState('');

 React.useEffect(() => {
  async function fetchNews() {
   try {
    const response = await fetch('/api/news');
    if (!response.ok) throw new Error('Failed to fetch news');
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

 const filteredNews = React.useMemo(() => {
  if (!searchQuery) return newsItems;
  const q = searchQuery.toLowerCase();
  return newsItems.filter(item =>
   item.title.toLowerCase().includes(q) ||
   item.source.toLowerCase().includes(q) ||
   (item.contentSnippet || '').toLowerCase().includes(q)
  );
 }, [newsItems, searchQuery]);
 
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
     <div className="container mx-auto py-8 px-4">
       <section className="text-center mb-8">
         <div className="max-w-6xl mx-auto">
           <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">Web3 News</h1>
         </div>
       </section>
       <article className="max-w-6xl mx-auto">
        {/* Search */}
        <div className="mb-8 max-w-6xl mx-auto">
          <div className="relative">
            <Input
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-base pl-12 h-12 rounded-full shadow-sm focus-visible:ring-offset-4"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          {searchQuery && (
            <p className="text-center text-sm text-muted-foreground mt-3">
              {filteredNews.length} result{filteredNews.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
         {loading ? (
          [...Array(12)].map((_, i) => <NewsCardSkeleton key={i} />)
         ) : (
           filteredNews.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackNewsClick(item.title, item.link, item.source)}
              className="block group"
            >
             <Card className="flex flex-col h-full rounded-lg shadow-sm hover:shadow-sm border-transparent hover:border-border/60 bg-card transition-all duration-200">
              <CardHeader className="pb-2 pt-4 px-4">
               <div className="mb-1">
                <Badge variant={
                 item.source === 'Decrypt' ? 'destructive' :
                 item.source === 'Cointelegraph' ? 'secondary' :
                 item.source === 'Coindesk' ? 'default' :
                 'outline'
                } className="text-[10px] uppercase font-semibold">
                 {item.source}
                </Badge>
               </div>
               <CardTitle className="text-base leading-snug font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {item.title}
               </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow pt-0 pb-3 px-4">
               <p className="text-sm text-muted-foreground line-clamp-3">{item.contentSnippet}</p>
              </CardContent>
             </Card>
            </a>
           ))
         )}
        </div>

        {!loading && filteredNews.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-lg col-span-full mt-8">
            <Newspaper className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold">No News Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search query.</p>
          </div>
        )}

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
       </article>
     </div>
    </main>
   </div>
  </>
 );
}
