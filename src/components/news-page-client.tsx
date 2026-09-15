'use client';

import * as React from 'react';
import { NewsCard } from '@/components/news-card';
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
          <NewsCard key={`${item.link}-${index}`} item={item} />
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
    </div>
  );
}
