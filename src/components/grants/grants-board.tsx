'use client';

import * as React from 'react';
import type { GrantProgram } from '@/types';
import { GrantCard } from './grant-card';
import { ListingEmptyState, ListingToolbar } from '@/components/listing-toolbar';

const PAGE_SIZE = 48;

const CATEGORY_OPTIONS = [
  { value: 'Web3 Ecosystem', label: 'Web3 Ecosystem' },
  { value: 'Cloud & AI Credits', label: 'Cloud & AI Credits' },
  { value: 'Developer Infra & Tooling', label: 'Developer Infra & Tooling' },
  { value: 'Global Tech & Open Source', label: 'Global Tech & Open Source' },
];

export function GrantsBoard({ initialGrants }: { initialGrants: GrantProgram[] }) {
  const [inputValue, setInputValue] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(inputValue.trim().toLowerCase());
      setVisibleCount(PAGE_SIZE);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [inputValue]);

  const filteredGrants = React.useMemo(() => {
    return initialGrants.filter((grant) => {
      if (selectedCategory !== 'All' && grant.category !== selectedCategory) {
        return false;
      }

      if (!searchQuery) {
        return true;
      }

      const nameMatch = grant.name.toLowerCase().includes(searchQuery);
      const providerMatch = grant.provider.toLowerCase().includes(searchQuery);
      const descMatch = grant.description.toLowerCase().includes(searchQuery);
      const ecoMatch = grant.ecosystem?.toLowerCase().includes(searchQuery);
      const tagMatch = grant.tags?.some((t) => t.toLowerCase().includes(searchQuery));
      return nameMatch || providerMatch || descMatch || ecoMatch || tagMatch;
    });
  }, [initialGrants, searchQuery, selectedCategory]);

  const visibleGrants = filteredGrants.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGrants.length;

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredGrants.length));
        }
      },
      { rootMargin: '600px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, filteredGrants.length]);

  const isFiltered = Boolean(searchQuery) || selectedCategory !== 'All';

  return (
    <div className="space-y-6">
      {/* Listing Toolbar with search bar and single category dropdown filter */}
      <ListingToolbar
        searchValue={inputValue}
        onSearchChange={setInputValue}
        searchPlaceholder="Search grants, credits, or organizations"
        searchAriaLabel="Search grants"
        resultCount={isFiltered ? filteredGrants.length : null}
        selects={[
          {
            value: selectedCategory === 'All' ? '' : selectedCategory,
            onChange: (val) => {
              setSelectedCategory(val || 'All');
              setVisibleCount(PAGE_SIZE);
            },
            label: 'Filter grants by category',
            placeholder: 'All categories',
            options: CATEGORY_OPTIONS,
            className: 'md:w-56',
          },
        ]}
      />

      {/* Grants Grid */}
      {visibleGrants.length > 0 ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
          {visibleGrants.map((grant) => (
            <div key={grant.id} className="h-full">
              <GrantCard grant={grant} />
            </div>
          ))}
        </div>
      ) : (
        <ListingEmptyState
          title="No grant programs found"
          description="Try searching with a different keyword, organization, or category."
          onClear={() => {
            setInputValue('');
            setSearchQuery('');
            setSelectedCategory('All');
          }}
          clearLabel="Clear search"
        />
      )}

      {/* Infinite Scroll Sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-12 w-full" aria-hidden="true" />}
    </div>
  );
}
