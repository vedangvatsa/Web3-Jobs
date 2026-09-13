'use client';

import { Suspense, useEffect, useState } from 'react';
import { BlogPageClient } from './blog-page-client';
import type { Article } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function BlogPageClientSkeleton() {
 return (
  <div className="container mx-auto px-4 py-8">
   <section className="text-center mb-12 site-container">
    <Skeleton className="h-12 w-full mb-4" />
   </section>
   <div className="site-container">
    <Skeleton className="h-24 mb-8 rounded-lg" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
     {[...Array(12)].map((_, i) => (
      <Skeleton key={i} className="h-64 rounded-lg" />
     ))}
    </div>
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
     if (result?.data) setArticleIndex(result.data);
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
