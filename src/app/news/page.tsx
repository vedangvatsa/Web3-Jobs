
import { getNewsFeed } from '@/lib/news';
import { Header } from '@/components/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { ExternalLink, Rss, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { TransitioningHeadline } from '@/components/transitioning-headline';

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
                      <Link href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                        {item.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{item.contentSnippet}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground font-medium">{item.creator}</p>
                    <Link href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-primary font-semibold hover:underline">
                      Read More <ExternalLink className="ml-1 h-4 w-4" />
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
