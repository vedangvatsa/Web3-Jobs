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
    variant === 'compact' ? 'h-36' : variant === 'related' ? 'h-32' : 'h-44';
  const titleSizeClass =
    variant === 'compact'
      ? 'text-base font-semibold leading-snug line-clamp-2'
      : variant === 'related'
      ? 'text-sm font-semibold leading-snug line-clamp-2'
      : 'text-lg font-bold leading-snug line-clamp-2';
  const headerPadding = variant === 'related' ? 'p-3' : 'p-4 sm:p-5';

  return (
    <Card
      className={cn(
        'group flex flex-col h-full bg-card border-border/70 shadow-none hover:border-foreground/25 transition-colors overflow-hidden',
        className
      )}
    >
      <Link href={`/${article.slug}`} className="flex flex-col h-full">
        {article.image && (
          <div className={cn('relative w-full aspect-[16/9] overflow-hidden bg-muted/40 shrink-0 border-b border-border/50')}>
            <Image
              src={article.image}
              alt={`${article.title} - Hashtag Web3`}
              fill
              className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              data-ai-hint={article['data-ai-hint'] || ''}
            />
          </div>
        )}
        <CardHeader className={cn('flex-grow flex flex-col justify-between', headerPadding)}>
          <div>
            {article.category && (
              <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1.5 line-clamp-1">
                {article.category}
              </p>
            )}
            <CardTitle className={cn(titleSizeClass, "group-hover:text-primary transition-colors")}>
              {article.title}
            </CardTitle>
            {showDescription && article.description && (
              <CardDescription className="pt-2 line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {article.description}
              </CardDescription>
            )}
          </div>
        </CardHeader>
      </Link>
    </Card>
  );
}

export function ArticleCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'related' }) {
  const imageHeightClass =
    variant === 'compact' ? 'h-36' : variant === 'related' ? 'h-32' : 'h-44';

  return (
    <Card className="flex flex-col h-full border-border/70 bg-card shadow-none overflow-hidden">
      <Skeleton className={cn('w-full', imageHeightClass)} />
      <CardHeader className="p-4 space-y-2">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-5 w-full" />
        {variant === 'default' && <Skeleton className="h-4 w-3/4 mt-2" />}
      </CardHeader>
    </Card>
  );
}
