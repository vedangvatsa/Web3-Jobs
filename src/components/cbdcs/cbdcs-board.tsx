'use client';

import * as React from 'react';
import type { CbdcProfile } from '@/types';
import { CbdcCard } from './cbdc-card';
import { ListingEmptyState, ListingToolbar } from '@/components/listing-toolbar';

const PAGE_SIZE = 36;

export function CbdcsBoard({
  initialCbdcs,
  statusOptions,
  typeOptions,
  techOptions,
}: {
  initialCbdcs: CbdcProfile[];
  statusOptions: string[];
  typeOptions: string[];
  techOptions: string[];
}) {
  const [inputValue, setInputValue] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('All');
  const [selectedType, setSelectedType] = React.useState('All');
  const [selectedTech, setSelectedTech] = React.useState('All');
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(inputValue.trim().toLowerCase());
      setVisibleCount(PAGE_SIZE);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [inputValue]);

  const filteredCbdcs = React.useMemo(() => {
    return initialCbdcs.filter((c) => {
      if (selectedStatus !== 'All' && c.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }
      if (selectedType !== 'All' && c.type !== selectedType) {
        return false;
      }
      if (selectedTech !== 'All' && c.dlt !== selectedTech) {
        return false;
      }

      if (!searchQuery) {
        return true;
      }

      const countryMatch = c.country.toLowerCase().includes(searchQuery);
      const nameMatch = c.digitalCurrency.toLowerCase().includes(searchQuery);
      const bankMatch = c.centralBank.toLowerCase().includes(searchQuery);
      const goalsMatch = c.goals.toLowerCase().includes(searchQuery);
      return countryMatch || nameMatch || bankMatch || goalsMatch;
    });
  }, [initialCbdcs, searchQuery, selectedStatus, selectedType, selectedTech]);

  const visibleCbdcs = filteredCbdcs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCbdcs.length;

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredCbdcs.length));
        }
      },
      { rootMargin: '600px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, filteredCbdcs.length]);

  const isFiltered =
    Boolean(searchQuery) ||
    selectedStatus !== 'All' ||
    selectedType !== 'All' ||
    selectedTech !== 'All';

  const selects = [
    {
      value: selectedStatus === 'All' ? '' : selectedStatus,
      onChange: (val: string) => {
        setSelectedStatus(val || 'All');
        setVisibleCount(PAGE_SIZE);
      },
      label: 'Status',
      placeholder: 'All Statuses',
      options: statusOptions
        .filter((s) => s !== 'All')
        .map((s) => ({ value: s, label: s })),
    },
    {
      value: selectedType === 'All' ? '' : selectedType,
      onChange: (val: string) => {
        setSelectedType(val || 'All');
        setVisibleCount(PAGE_SIZE);
      },
      label: 'Type',
      placeholder: 'All Types',
      options: typeOptions
        .filter((t) => t !== 'All')
        .map((t) => ({ value: t, label: t })),
    },
    {
      value: selectedTech === 'All' ? '' : selectedTech,
      onChange: (val: string) => {
        setSelectedTech(val || 'All');
        setVisibleCount(PAGE_SIZE);
      },
      label: 'Technology',
      placeholder: 'All Architectures',
      options: techOptions
        .filter((t) => t !== 'All')
        .map((t) => ({ value: t, label: t })),
    },
  ];

  return (
    <div className="space-y-6">
      <ListingToolbar
        searchValue={inputValue}
        onSearchChange={setInputValue}
        searchPlaceholder="Search country, currency, or central bank"
        searchAriaLabel="Search CBDCs"
        selects={selects}
        resultCount={filteredCbdcs.length}
      />

      {visibleCbdcs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCbdcs.map((cbdc) => (
            <CbdcCard key={cbdc.id} cbdc={cbdc} />
          ))}
        </div>
      ) : (
        <ListingEmptyState
          title="No CBDC projects found"
          description={
            isFiltered
              ? 'Try clearing your search query or changing filters to see more results.'
              : 'There are currently no central bank digital currencies matching this view.'
          }
          onClear={
            isFiltered
              ? () => {
                  setInputValue('');
                  setSearchQuery('');
                  setSelectedStatus('All');
                  setSelectedType('All');
                  setSelectedTech('All');
                  setVisibleCount(PAGE_SIZE);
                }
              : undefined
          }
        />
      )}

      {hasMore && (
        <div ref={sentinelRef} className="py-6 text-center text-sm text-muted-foreground">
          Loading more central bank digital currencies...
        </div>
      )}
    </div>
  );
}
