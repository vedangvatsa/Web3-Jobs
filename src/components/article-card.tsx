import * as React from 'react';
import Link from 'next/link';
import { ListingCard, ListingCardHeader, ListingCardTitle } from '@/components/listing-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Article } from '@/types';

export interface ArticleCardProps {
  article: Omit<Article, 'content'>;
  /** Kept for callers; listing cards now share one event-style layout. */
  variant?: 'default' | 'compact' | 'related';
  showDescription?: boolean;
  className?: string;
}

export function ArticleCard({
  article,
  className,
}: ArticleCardProps) {
  return (
    <Link href={`/${article.slug}`} className="block h-full">
      <ListingCard className={className}>
        <ListingCardHeader>
          <div className="min-w-0">
            <ListingCardTitle
              title={article.title}
            >
              {article.title}
            </ListingCardTitle>
            {article.category && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground" title={article.category}>
                {article.category}
              </p>
            )}
          </div>
        </ListingCardHeader>
      </ListingCard>
    </Link>
  );
}

export function ArticleCardSkeleton({
  variant: _variant = 'default',
}: {
  variant?: 'default' | 'compact' | 'related';
}) {
  return (
    <ListingCard>
      <ListingCardHeader className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-3 w-1/3" />
      </ListingCardHeader>
    </ListingCard>
  );
}
