'use client';

import * as React from 'react';
import type { FreeCryptoApiCategory, FreeCryptoApiListing } from '@/types';
import { FreeCryptoApiCard } from './free-crypto-api-card';
import { ListingEmptyState, ListingToolbar } from '@/components/listing-toolbar';

const PAGE_SIZE = 48;

const FREE_PATH_OPTIONS = [
  { value: 'ongoing', label: 'Ongoing free tier' },
  { value: 'keyless', label: 'Keyless' },
  { value: 'trial', label: 'Trial only' },
  { value: 'paid', label: 'Paid only' },
  { value: 'unknown', label: 'Access unclear' },
];

const INTEGRATION_OPTIONS = [
  { value: 'mcp', label: 'MCP server' },
  { value: 'x402', label: 'x402 pay-per-call' },
  { value: 'either', label: 'MCP or x402' },
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
  const [selectedFreePath, setSelectedFreePath] = React.useState('All');
  const [selectedIntegration, setSelectedIntegration] = React.useState('All');
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
      if (selectedFreePath !== 'All' && listing.freePath !== selectedFreePath) {
        return false;
      }
      if (selectedIntegration === 'mcp' && listing.mcp?.status !== 'yes') return false;
      if (selectedIntegration === 'x402' && listing.x402?.status !== 'yes') return false;
      if (selectedIntegration === 'either' && listing.mcp?.status !== 'yes' && listing.x402?.status !== 'yes') {
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
  }, [initialListings, searchQuery, selectedCategory, selectedFreePath, selectedIntegration]);

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

  const isFiltered =
    Boolean(searchQuery) ||
    selectedCategory !== 'All' ||
    selectedFreePath !== 'All' ||
    selectedIntegration !== 'All';

  const categoryOptions = categories.map((c) => ({ value: c.slug, label: c.label }));

  return (
    <div className="space-y-6">
      <ListingToolbar
        searchValue={inputValue}
        onSearchChange={setInputValue}
        searchPlaceholder="Search APIs, chains, or free-tier limits"
        searchAriaLabel="Search free crypto APIs"
        resultCount={isFiltered ? filtered.length : null}
        selects={[
          {
            value: selectedCategory === 'All' ? '' : selectedCategory,
            onChange: (val) => {
              setSelectedCategory(val || 'All');
              setVisibleCount(PAGE_SIZE);
            },
            label: 'Filter APIs by category',
            placeholder: 'All categories',
            options: categoryOptions,
            className: 'md:w-52',
          },
          {
            value: selectedFreePath === 'All' ? '' : selectedFreePath,
            onChange: (val) => {
              setSelectedFreePath(val || 'All');
              setVisibleCount(PAGE_SIZE);
            },
            label: 'Filter by free access path',
            placeholder: 'All access types',
            options: FREE_PATH_OPTIONS,
            className: 'md:w-44',
          },
          {
            value: selectedIntegration === 'All' ? '' : selectedIntegration,
            onChange: (val) => {
              setSelectedIntegration(val || 'All');
              setVisibleCount(PAGE_SIZE);
            },
            label: 'Filter by agent integrations',
            placeholder: 'All integrations',
            options: INTEGRATION_OPTIONS,
            className: 'md:w-40',
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
          title="No APIs matched"
          description="Try another keyword, category, or filter."
          onClear={() => {
            setInputValue('');
            setSearchQuery('');
            setSelectedCategory('All');
            setSelectedFreePath('All');
            setSelectedIntegration('All');
          }}
          clearLabel="Clear filters"
        />
      )}

      {hasMore && <div ref={sentinelRef} className="h-12 w-full" aria-hidden="true" />}
    </div>
  );
}