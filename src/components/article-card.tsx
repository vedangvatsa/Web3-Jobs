import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Article } from '@/types';
import { cn } from '@/lib/utils';

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
      <Card
        className={cn(
          'flex h-full flex-col border-border/70 bg-card shadow-none transition-colors hover:border-foreground/25',
          className
        )}
      >
        <CardHeader className="px-4 pb-3 pt-4">
          <div className="min-w-0">
            <CardTitle
              className="line-clamp-2 text-base font-semibold leading-snug"
              title={article.title}
            >
              {article.title}
            </CardTitle>
            {article.category && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground" title={article.category}>
                {article.category}
              </p>
            )}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

export function ArticleCardSkeleton({
  variant: _variant = 'default',
}: {
  variant?: 'default' | 'compact' | 'related';
}) {
  return (
    <Card className="flex h-full flex-col border-border/70 bg-card shadow-none">
      <CardHeader className="space-y-2 px-4 pb-3 pt-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-3 w-1/3" />
      </CardHeader>
    </Card>
  );
}
