'use client';

import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { CommunityFeedBanner } from '@/components/community-feed-banner';
import { ListingEmptyState, ListingToolbar } from '@/components/listing-toolbar';

export type GlossaryTermItem = {
  slug: string;
  term: string;
  category: string;
  description: string;
  difficulty?: string;
  synonyms?: string[];
};

export type GlossaryCategoryItem = {
  name: string;
  slug: string;
  description: string;
  termCount?: number;
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function termCategorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-');
}

export function GlossaryPageClient({
  allTerms,
  categories,
}: {
  allTerms: GlossaryTermItem[];
  categories: GlossaryCategoryItem[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [letterFilter, setLetterFilter] = React.useState<string | null>(null);
  const [, startTransition] = React.useTransition();

  const categorySlug = searchParams.get('category')?.trim() || '';

  const categoryOptions = React.useMemo(
    () => categories.filter((cat) => cat.termCount && cat.termCount > 0),
    [categories],
  );

  const activeCategory = React.useMemo(
    () => categoryOptions.find((c) => c.slug === categorySlug),
    [categoryOptions, categorySlug],
  );

  const updateCategoryParam = (slug: string) => {
    startTransition(() => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (!slug) params.delete('category');
      else params.set('category', slug);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const filteredTerms = React.useMemo(() => {
    let terms = categorySlug
      ? allTerms.filter((term) => termCategorySlug(term.category) === categorySlug)
      : allTerms;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      terms = terms.filter(
        (term) =>
          term.term.toLowerCase().includes(q) ||
          term.description.toLowerCase().includes(q) ||
          term.category.toLowerCase().includes(q) ||
          (term.synonyms && term.synonyms.some((s) => s.toLowerCase().includes(q)))
      );
    }

    if (letterFilter) {
      terms = terms.filter((term) => (term.term[0] || '#').toUpperCase() === letterFilter);
    }

    return terms;
  }, [allTerms, categorySlug, searchQuery, letterFilter]);

  const termsByLetter = React.useMemo(() => {
    return filteredTerms.reduce((acc, term) => {
      const firstLetter = (term.term[0] || '#').toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(term);
      return acc;
    }, {} as Record<string, GlossaryTermItem[]>);
  }, [filteredTerms]);

  const availableLetters = React.useMemo(
    () => Object.keys(termsByLetter).sort(),
    [termsByLetter]
  );

  const isFiltering = searchQuery.length > 0 || Boolean(categorySlug) || Boolean(letterFilter);

  const clearFilters = () => {
    setSearchQuery('');
    setLetterFilter(null);
    if (categorySlug) updateCategoryParam('');
  };

  return (
    <>
      <section className="text-center mb-8">
        {activeCategory ? (
          <>
            <div className="mb-3">
              <Link
                href="/glossary"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                All Terms
              </Link>
            </div>
            <PageHeader
              title={activeCategory.name}
              description={`Browse all ${activeCategory.name} terms in our Web3 glossary.`}
            />
          </>
        ) : (
          <PageHeader title="Web3 Glossary" />
        )}
      </section>

      <CommunityFeedBanner variant="community" />

      <div>
        <ListingToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search terms..."
          searchAriaLabel="Search glossary terms"
          selects={[
            {
              value: categorySlug,
              onChange: updateCategoryParam,
              label: 'Filter by category',
              placeholder: 'Categories',
              options: categoryOptions.map((category) => ({
                value: category.slug,
                label: category.name,
              })),
              className: 'md:max-w-[180px]',
            },
            {
              value: letterFilter || '',
              onChange: (value) => setLetterFilter(value === '' ? null : value),
              label: 'Filter by letter',
              placeholder: 'Letters',
              options: ALPHABET.map((letter) => ({ value: letter, label: letter })),
              className: 'md:max-w-[120px]',
            },
          ]}
          resultCount={isFiltering ? filteredTerms.length : null}
        />

        {availableLetters.length === 0 ? (
          <ListingEmptyState
            title="No terms found"
            onClear={isFiltering ? clearFilters : undefined}
          />
        ) : (
          availableLetters.map((letter) => (
            <div key={letter} id={letter.toLowerCase()} className="mb-10 scroll-mt-20">
              <h2 className="text-base font-bold mb-3 pb-1 border-b border-border/60">
                {letter}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {termsByLetter[letter].map((term) => (
                  <Link key={term.slug} href={`/${term.slug}`}>
                    <Card className="group border-border/70 bg-card shadow-none hover:border-foreground/25 transition-colors h-full">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors mb-1">
                          {term.term}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {term.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
