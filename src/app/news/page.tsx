
'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { ExternalLink, Rss, Newspaper, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TransitioningHeadline } from '@/components/transitioning-headline';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { NewsItem } from '@/types';
import type { WebPage, NewsArticle, WithContext } from 'schema-dts';

function NewsCardSkeleton() {
  return (
    <Card className="bg-background/60 backdrop-blur-lg border border-white/10">
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
        const response = await fetch('/api/news', { cache: 'no-store' });
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

  const headlines = [
      "Web3 News Feed",
      "The Latest in Crypto",
      "Your Daily Briefing",
      "Stay Ahead of the Curve"
  ];
  
  const siteUrl = 'https://hashtagweb3.com';
  
  const pageSchema: WithContext<WebPage> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${siteUrl}/news`,
    name: "Web3 News Feed | Hashtag Web3",
    isPartOf: {
      '@type': 'WebSite',
      url: siteUrl,
      name: 'Hashtag Web3'
    },
    description: "The latest news and headlines from the world of Web3, cryptocurrency, and blockchain technology, aggregated from top industry sources.",
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
          <div className="container mx-auto px-4 py-8 md:py-16">
            <section className="text-center mb-12 max-w-4xl mx-auto">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <Newspaper className="h-10 w-10 text-primary" />
              </div>
              <TransitioningHeadline phrases={headlines} />
              <p className="text-muted-foreground mt-4">
                Aggregated news from top crypto sources. Updated frequently.
              </p>
            </section>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {loading ? (
                  [...Array(10)].map((_, i) => <NewsCardSkeleton key={i} />)
                ) : (
                  newsItems.map((item, index) => (
                    <Card key={index} className="transition-all duration-300 hover:shadow-lg bg-background/60 backdrop-blur-lg border border-white/10">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge variant={
                            item.source === 'Decrypt' ? 'destructive' :
                            item.source === 'Cointelegraph' ? 'secondary' :
                            item.source === 'Coindesk' ? 'default' :
                            'outline'
                          }>
                            {item.source}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                            {item.title}
                          </a>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm">{item.contentSnippet}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground font-medium">{item.creator}</p>
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-primary font-semibold hover:underline">
                          Read More <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>

              <Card className="mt-12 col-span-full bg-primary/5 border-primary/20 backdrop-blur-lg">
                  <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                      <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full hidden md:block">
                          <Rss className="h-8 w-8 text-primary"/>
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-primary mb-1">Stay Ahead with Our News Feed</h3>
                          <p className="text-muted-foreground">Get the latest updates, trends, and insights from the Web3 space, delivered directly to your Telegram.</p>
                      </div>
                      <a href="https://t.me/web3newsfeed" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-4 md:mt-0">
                          <Button size="lg">
                              Join News Feed <ArrowRight className="ml-2 h-4 w-4"/>
                          </Button>
                      </a>
                  </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
