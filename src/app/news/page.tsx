
import { getNewsFeed } from '@/lib/news';
import { Header } from '@/components/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { ExternalLink, Rss, Newspaper, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { TransitioningHeadline } from '@/components/transitioning-headline';
import { Button } from '@/components/ui/button';

export const revalidate = 3600; // Revalidate every hour

export default async function NewsPage() {
  const newsItems = await getNewsFeed();

  const headlines = [
      "Web3 News Feed",
      "The Latest in Crypto",
      "Your Daily Briefing",
      "Stay Ahead of the Curve"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <section className="text-center mb-12 max-w-4xl mx-auto">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <Newspaper className="h-10 w-10 text-primary" />
            </div>
            <TransitioningHeadline phrases={headlines} />
            <p className="text-muted-foreground mt-4">
              Aggregated news from Decrypt, Cointelegraph, and Coindesk. Updated hourly.
            </p>
          </section>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {newsItems.map((item, index) => (
                <Card key={index} className="transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant={
                        item.source === 'Decrypt' ? 'destructive' :
                        item.source === 'Cointelegraph' ? 'secondary' :
                        'default'
                      }>
                        {item.source}
                      </Badge>
                      <time className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.pubDate), { addSuffix: true })}
                      </time>
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
              ))}
            </div>

            <Card className="mt-12 col-span-full bg-primary/5 border-primary/20">
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
  );
}
