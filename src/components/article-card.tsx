import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Article } from '@/types';
import { cn } from '@/lib/utils';

export interface ArticleCardProps {
  article: Omit<Article, 'content'>;
  variant?: 'default' | 'compact' | 'related';
  showDescription?: boolean;
  className?: string;
}

export function ArticleCard({
  article,
  variant = 'default',
  showDescription = variant === 'default',
  className,
}: ArticleCardProps) {
  const imageHeightClass =
    variant === 'compact' ? 'h-40' : variant === 'related' ? 'h-36' : 'h-48';
  const titleSizeClass =
    variant === 'compact'
      ? 'text-lg leading-tight'
      : variant === 'related'
      ? 'text-sm leading-snug line-clamp-2'
      : 'text-xl';
  const headerPadding = variant === 'related' ? 'p-3' : 'p-6';

  return (
    <Card
      className={cn(
        'flex flex-col transform transition-all duration-200 hover:-translate-y-1 hover:shadow-sm h-full bg-background border',
        className
      )}
    >
      <Link href={`/${article.slug}`} className="block h-full flex flex-col">
        <div className={cn('relative w-full overflow-hidden rounded-t-lg', imageHeightClass)}>
          <Image
            src={article.image}
            alt={`${article.title} - Hashtag Web3`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint={article['data-ai-hint'] || ''}
          />
        </div>
        <CardHeader className={cn('flex-grow', headerPadding)}>
          {article.category && (
            <p className="text-xs md:text-sm font-medium text-primary mb-1">{article.category}</p>
          )}
          <CardTitle className={titleSizeClass}>{article.title}</CardTitle>
          {showDescription && article.description && (
            <CardDescription className="pt-2 line-clamp-3">
              {article.description}
            </CardDescription>
          )}
        </CardHeader>
      </Link>
    </Card>
  );
}

export function ArticleCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'related' }) {
  const imageHeightClass =
    variant === 'compact' ? 'h-40' : variant === 'related' ? 'h-36' : 'h-48';

  return (
    <Card className="flex flex-col h-full">
      <Skeleton className={cn('w-full rounded-t-lg', imageHeightClass)} />
      <CardHeader className="p-4 space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-6 w-full" />
        {variant === 'default' && <Skeleton className="h-4 w-3/4 mt-2" />}
      </CardHeader>
    </Card>
  );
}
