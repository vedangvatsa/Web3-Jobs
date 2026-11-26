'use client';

import * as React from 'react';
import type { FreeCryptoApiCategory, FreeCryptoApiListing } from '@/types';
import { FreeCryptoApiCard } from './free-crypto-api-card';
import { ListingEmptyState, ListingToolbar } from '@/components/listing-toolbar';

const PAGE_SIZE = 48;

const PRIMARY_CATEGORIES = [
  { value: 'rpc', label: 'RPC & Nodes' },
  { value: 'market', label: 'Market & Prices' },
  { value: 'execution', label: 'Swaps & Execution' },
  { value: 'analytics', label: 'Analytics & Indexing' },
  { value: 'identity', label: 'Identity & Social' },
  { value: 'wallet', label: 'Wallets & Accounts' },
  { value: 'explorer', label: 'Explorers & Data' },
];

export function FreeCryptoApisBoard({
  initialListings,
  categories,
}: {
  initialListings: FreeCryptoApiListing[];
  categories: FreeCryptoApiCategory[];
}) {
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

  const filtered = React.useMemo(() => {
    return initialListings.filter((listing) => {
      if (selectedCategory !== 'All' && listing.category !== selectedCategory) {
        return false;
      }

      if (!searchQuery) return true;

      const haystack = [
        listing.name,
        listing.categoryLabel,
        listing.freeTier,
        listing.chains,
        listing.notes,
        ...(listing.alsoServes || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(searchQuery);
    });
  }, [initialListings, searchQuery, selectedCategory]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: '600px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, filtered.length]);

  const isFiltered = Boolean(searchQuery) || selectedCategory !== 'All';

  return (
    <div className="space-y-6">
      <ListingToolbar
        searchValue={inputValue}
        onSearchChange={setInputValue}
        searchPlaceholder="Search APIs, chains, or providers"
        searchAriaLabel="Search crypto APIs"
        resultCount={isFiltered ? filtered.length : null}
        selects={[
          {
            value: selectedCategory === 'All' ? '' : selectedCategory,
            onChange: (val) => {
              setSelectedCategory(val || 'All');
              setVisibleCount(PAGE_SIZE);
            },
            label: 'Filter APIs by category',
            placeholder: 'Categories',
            options: PRIMARY_CATEGORIES,
            className: 'md:w-52',
          },
        ]}
      />

      {visible.length > 0 ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
          {visible.map((listing) => (
            <div key={listing.slug} className="h-full">
              <FreeCryptoApiCard listing={listing} />
            </div>
          ))}
        </div>
      ) : (
        <ListingEmptyState
          title="No APIs found"
          description="Try searching with a different keyword, provider, or category."
          onClear={() => {
            setInputValue('');
            setSearchQuery('');
            setSelectedCategory('All');
          }}
          clearLabel="Clear search"
        />
      )}

      {hasMore && <div ref={sentinelRef} className="h-12 w-full" aria-hidden="true" />}
    </div>
  );
}
