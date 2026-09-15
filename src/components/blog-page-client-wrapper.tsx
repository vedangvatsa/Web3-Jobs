'use client';

import { Suspense, useEffect, useState } from 'react';
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
  const [articleIndex, setArticleIndex] = useState(allArticles);

  useEffect(() => {
    const loadArticles = () => {
      void fetch('/api/articles?limit=1000', { headers: { Accept: 'application/json' } })
        .then((response) => response.ok ? response.json() : null)
        .then((result: { data?: Omit<Article, 'content'>[] } | null) => {
          if (result?.data) {
            setArticleIndex(result.data.filter((article) => article.category !== 'News'));
          }
        })
        .catch(() => undefined);
    };

    if (document.readyState === 'complete') {
      loadArticles();
      return;
    }

    window.addEventListener('load', loadArticles, { once: true });
    return () => window.removeEventListener('load', loadArticles);
  }, []);

  return (
    <Suspense fallback={<BlogPageClientSkeleton />}>
      <BlogPageClient allArticles={articleIndex} categories={categories} />
    </Suspense>
  );
}
