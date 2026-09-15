'use client';

import * as React from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trackNewsClick, trackCTAClick } from '@/lib/posthog';
import type { NewsItem } from '@/types';
import { ListingEmptyState, ListingToolbar } from '@/components/listing-toolbar';

export function NewsPageClient({ initialNewsItems }: { initialNewsItems: NewsItem[] }) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredNews = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return initialNewsItems;
    return initialNewsItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        (item.contentSnippet || '').toLowerCase().includes(q)
    );
  }, [initialNewsItems, searchQuery]);

  return (
    <div>
      <ListingToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search headlines..."
        searchAriaLabel="Search news"
        resultCount={searchQuery ? filteredNews.length : null}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredNews.map((item, index) => (
          <a
            key={`${item.link}-${index}`}
            href={item.link}
            target={item.link.startsWith('http') ? '_blank' : undefined}
            rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
            onClick={() => trackNewsClick(item.title, item.link, item.source)}
            className="group block h-full"
          >
            <Card className="flex h-full flex-col border-border/70 bg-card p-4 shadow-none transition-colors hover:border-foreground/25">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge
                  variant={
                    item.source === 'Decrypt'
                      ? 'destructive'
                      : item.source === 'Cointelegraph'
                        ? 'secondary'
                        : item.source === 'Coindesk'
                          ? 'default'
                          : 'outline'
                  }
                  className="text-[10px] font-semibold uppercase"
                >
                  {item.source}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.pubDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <CardTitle className="text-base font-semibold leading-snug transition-colors group-hover:text-primary">
                {item.title}
              </CardTitle>
            </Card>
          </a>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <ListingEmptyState
          title="No news found"
          description="Try a different headline or source."
          onClear={searchQuery ? () => setSearchQuery('') : undefined}
          clearLabel="Clear search"
        />
      )}

      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
        <div>
          <h3 className="mb-1 font-semibold text-foreground">Stay Ahead with Our News Feed</h3>
          <p className="text-sm text-muted-foreground">
            Get the latest Web3 updates delivered directly to your Telegram.
          </p>
        </div>
        <a
          href="https://t.me/web3newsfeed"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCTAClick('join_news_feed', 'https://t.me/web3newsfeed')}
          className="flex-shrink-0"
        >
          <span className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            Join Telegram
          </span>
        </a>
      </div>
    </div>
  );
}
