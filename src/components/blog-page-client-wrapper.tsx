'use client';

import { Suspense } from 'react';
import { BlogPageClient } from './blog-page-client';
import type { Article } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function BlogPageClientSkeleton() {
  return (
    <div>
      <Skeleton className="mx-auto mb-8 h-10 w-64" />
      <Skeleton className="mb-6 h-10 w-full rounded-md" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function BlogPageClientWrapper({ allArticles, categories }: { allArticles: Omit<Article, 'content'>[], categories: string[] }) {
  const articleIndex = allArticles;

  return (
    <Suspense fallback={<BlogPageClientSkeleton />}>
      <BlogPageClient allArticles={articleIndex} categories={categories} />
    </Suspense>
  );
}
