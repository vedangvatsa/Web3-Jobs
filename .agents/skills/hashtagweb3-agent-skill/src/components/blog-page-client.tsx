'use client';

import { useState, useMemo, useTransition } from 'react';
import type { Article } from '@/types';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ArticleCard, ArticleCardSkeleton } from '@/components/article-card';
import { CtaBanner } from '@/components/cta-banner';
import { PageShell } from '@/components/page-shell';
import { PageHeader } from '@/components/page-header';

export function BlogPageClient({
  allArticles,
  categories,
}: {
  allArticles: Omit<Article, 'content'>[];
  categories: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';

  const [inputValue, setInputValue] = useState(searchQuery);
  const [isPending, startTransition] = useTransition();

  const handleCategoryClick = (category: string) => {
    startTransition(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (category === 'All') {
        current.delete('category');
      } else {
        current.set('category', category);
      }
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`${pathname}${query}`);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    startTransition(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      if (value) {
        current.set('search', value);
      } else {
        current.delete('search');
      }
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`${pathname}${query}`);
    });
  };

  const filteredArticles = useMemo(() => {
    let articles = allArticles;

    if (selectedCategory && selectedCategory !== 'All') {
      articles = articles.filter((article) => article.category === selectedCategory);
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      articles = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(lowercasedQuery) ||
          article.description.toLowerCase().includes(lowercasedQuery) ||
          article.category.toLowerCase().includes(lowercasedQuery)
      );
    }

    return articles;
  }, [allArticles, selectedCategory, searchQuery]);

  return (
    <PageShell>
      <section className="text-center mb-8">
        <div className="site-container">
          <PageHeader title="The Web3 Playbook" />
        </div>
      </section>

      <div className="site-container">
        <Card className="p-4 mb-8 sticky top-[72px] z-10 shadow-sm bg-background border-b">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Input
                placeholder="Search articles by title or keyword..."
                value={inputValue}
                onChange={handleSearchChange}
                className="w-full text-base pl-10 h-11 rounded-full shadow-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => handleCategoryClick(category)}
                  className="rounded-full text-xs h-8"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[600px]">
          {isPending
            ? [...Array(12)].map((_, i) => <ArticleCardSkeleton key={i} />)
            : filteredArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
        </div>

        {!isPending && filteredArticles.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-lg col-span-full mt-8">
            <h3 className="text-xl font-semibold">No Articles Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search query or filters.</p>
          </div>
        )}

        <CtaBanner
          variant="jobs"
          title="Looking for a Web3 Job?"
          className="col-span-full mt-12"
        />
      </div>
    </PageShell>
  );
}
