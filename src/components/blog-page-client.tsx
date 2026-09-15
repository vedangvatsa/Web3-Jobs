'use client';

import { useState, useMemo, useTransition } from 'react';
import type { Article } from '@/types';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ArticleCard, ArticleCardSkeleton } from '@/components/article-card';
import { CtaBanner } from '@/components/cta-banner';
import { PageHeader } from '@/components/page-header';
import { ListingEmptyState, ListingToolbar } from '@/components/listing-toolbar';

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

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  const [inputValue, setInputValue] = useState(searchQuery);
  const [isPending, startTransition] = useTransition();

  const categoryOptions = categories;

  const updateParams = (mutate: (params: URLSearchParams) => void) => {
    startTransition(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      mutate(current);
      const search = current.toString();
      router.push(search ? `${pathname}?${search}` : pathname);
    });
  };

  const handleCategoryChange = (category: string) => {
    updateParams((current) => {
      if (!category) current.delete('category');
      else current.set('category', category);
    });
  };

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    updateParams((current) => {
      if (value) current.set('search', value);
      else current.delete('search');
    });
  };

  const filteredArticles = useMemo(() => {
    let articles = allArticles;

    if (selectedCategory) {
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

  const isFiltering = Boolean(searchQuery) || Boolean(selectedCategory);

  return (
    <>
      <PageHeader title="The Web3 Playbook" />

      <ListingToolbar
        searchValue={inputValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search articles..."
        searchAriaLabel="Search articles"
        selects={[
          {
            value: selectedCategory,
            onChange: handleCategoryChange,
            label: 'Filter by category',
            placeholder: 'Categories',
            options: categoryOptions.map((category) => ({ value: category, label: category })),
            className: 'md:max-w-[180px]',
          },
        ]}
        resultCount={isFiltering ? filteredArticles.length : null}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[600px]">
        {isPending
          ? [...Array(12)].map((_, i) => <ArticleCardSkeleton key={i} />)
          : filteredArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
      </div>

      {!isPending && filteredArticles.length === 0 && (
        <ListingEmptyState
          title="No articles found"
          onClear={
            isFiltering
              ? () => {
                  setInputValue('');
                  startTransition(() => router.push(pathname));
                }
              : undefined
          }
        />
      )}

      <CtaBanner
        variant="jobs"
        title="Looking for a Web3 Job?"
        className="col-span-full mt-12"
      />
    </>
  );
}
