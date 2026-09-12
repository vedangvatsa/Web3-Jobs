'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import Link from 'next/link';

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

export function GlossaryPageClient({
  allTerms,
  categories,
  selectedCategory,
}: {
  allTerms: GlossaryTermItem[];
  categories: GlossaryCategoryItem[];
  selectedCategory?: string;
}) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const categoryFilteredTerms = React.useMemo(() => {
    if (!selectedCategory) return allTerms;
    return allTerms.filter((term) => term.category === selectedCategory);
  }, [allTerms, selectedCategory]);

  const searchFilteredTerms = React.useMemo(() => {
    if (!searchQuery.trim()) return categoryFilteredTerms;
    const q = searchQuery.toLowerCase().trim();
    return categoryFilteredTerms.filter(
      (term) =>
        term.term.toLowerCase().includes(q) ||
        term.description.toLowerCase().includes(q) ||
        term.category.toLowerCase().includes(q) ||
        (term.synonyms && term.synonyms.some((s) => s.toLowerCase().includes(q)))
    );
  }, [categoryFilteredTerms, searchQuery]);

  const termsByLetter = React.useMemo(() => {
    return searchFilteredTerms.reduce((acc, term) => {
      const firstLetter = (term.term[0] || '#').toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(term);
      return acc;
    }, {} as Record<string, GlossaryTermItem[]>);
  }, [searchFilteredTerms]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const availableLetters = React.useMemo(
    () => Object.keys(termsByLetter).sort(),
    [termsByLetter]
  );

  return (
    <div className="site-container space-y-8">
      {/* Search Input matching /news design */}
      <div className="mb-6">
        <div className="relative max-w-2xl mx-auto">
          <Input
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-base pl-12 h-12 rounded-full shadow-sm focus-visible:ring-offset-4"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        {searchQuery && (
          <p className="text-center text-sm text-muted-foreground mt-3">
            {searchFilteredTerms.length} result{searchFilteredTerms.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Alphabet Navigation */}
      <div className="flex flex-wrap gap-1.5 justify-center py-2">
        {alphabet.map((letter) => {
          const isAvailable = availableLetters.includes(letter);
          return isAvailable ? (
            <Link
              key={letter}
              href={`#${letter.toLowerCase()}`}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md text-xs font-semibold bg-secondary/80 text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {letter}
            </Link>
          ) : (
            <span
              key={letter}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md text-xs font-semibold text-muted-foreground/40 select-none"
            >
              {letter}
            </span>
          );
        })}
      </div>

      {/* Categories - only show when not searching or filtering by category */}
      {!selectedCategory && !searchQuery && (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight mb-0.5">Browse by category</h2>
            <p className="text-xs text-muted-foreground">Explore terms organized by Web3 sector</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories
              .filter((cat) => cat.termCount && cat.termCount > 0)
              .map((category) => (
                <Link key={category.slug} href={`/glossary/${category.slug}`}>
                  <Card className="group border-border/70 bg-card shadow-none hover:border-foreground/25 transition-colors h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors flex items-center justify-between">
                        {category.name}
                        <Badge variant="secondary" className="text-[10px]">
                          {category.termCount}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* Terms Section */}
      <section className="pt-2">
        <div className="mb-6">
          <h2 className="text-lg font-bold tracking-tight mb-0.5">
            {selectedCategory
              ? `${selectedCategory} Terms`
              : searchQuery
              ? 'Search Results'
              : 'All terms'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {searchQuery
              ? `Showing terms matching "${searchQuery}"`
              : selectedCategory
              ? `${categoryFilteredTerms.length} terms in this category`
              : 'Complete alphabetical listing'}
          </p>
        </div>

        {availableLetters.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-xl bg-card">
            No terms found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          availableLetters.map((letter) => (
            <div key={letter} id={letter.toLowerCase()} className="mb-10 scroll-mt-20">
              <h3 className="text-base font-bold mb-3 pb-1 border-b border-border/60">
                {letter}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {termsByLetter[letter].map((term) => (
                  <Link key={term.slug} href={`/${term.slug}`}>
                    <Card className="group border-border/70 bg-card shadow-none hover:border-foreground/25 transition-colors h-full">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors mb-1">
                          {term.term}
                        </h4>
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
      </section>
    </div>
  );
}
