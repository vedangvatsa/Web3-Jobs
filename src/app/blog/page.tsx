
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Since we can't use top-level async in client components,
// we'll fetch data in a useEffect hook.

function ArticleCard({ article }: { article: Omit<Article, 'content'> }) {
  return (
    <Card className="flex flex-col transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/${article.slug}`} className="block h-full">
        <div className="relative w-full h-48">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
            data-ai-hint={`${article.slug.replace(/-/g, ' ')}`}
          />
        </div>
        <CardHeader className="flex-grow">
          <p className="text-sm font-medium text-primary mb-1">{article.category}</p>
          <CardTitle className="text-xl">{article.title}</CardTitle>
          <CardDescription className="pt-2">{article.description}</CardDescription>
        </CardHeader>
      </Link>
    </Card>
  );
}

function ArticleCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[200px] w-full rounded-t-xl" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

export default function BlogIndexPage() {
  const [articles, setArticles] = useState<Omit<Article, 'content'>[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This is a workaround to fetch data in a client component.
    // In a real app, you might use a library like SWR or React Query,
    // or fetch data in a parent server component.
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles');
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        const fetchedArticles: Article[] = await response.json();
        setArticles(fetchedArticles);
        const uniqueCategories = [...new Set(fetchedArticles.map(a => a.category))];
        setCategories(['All', ...uniqueCategories.sort()]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'All') {
      return articles;
    }
    return articles.filter((article) => article.category === selectedCategory);
  }, [articles, selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <section className="text-center mb-12 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
              The Web3 Playbook
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Insights, guides, and news from the world of Web3.
            </p>
          </section>

          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-2">
              {isLoading ? (
                 <>
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-28" />
                 </>
              ) : (
                categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category || (selectedCategory === null && category === 'All') ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full"
                  >
                    {category}
                  </Button>
                ))
              )}
            </div>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)
            ) : (
                filteredArticles.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
