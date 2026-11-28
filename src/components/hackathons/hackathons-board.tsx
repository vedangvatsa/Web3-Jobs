'use client';

import * as React from 'react';
import type { Hackathon } from '@/types';
import { HackathonCard } from './hackathon-card';
import { ListingEmptyState, ListingToolbar } from '@/components/listing-toolbar';

const PAGE_SIZE = 36;

export function HackathonsBoard({
  initialHackathons,
  ecosystemOptions,
  formatOptions,
}: {
  initialHackathons: Hackathon[];
  ecosystemOptions: string[];
  formatOptions: string[];
}) {
  const [inputValue, setInputValue] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedEcosystem, setSelectedEcosystem] = React.useState('All');
  const [selectedFormat, setSelectedFormat] = React.useState('All');
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(inputValue.trim().toLowerCase());
      setVisibleCount(PAGE_SIZE);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [inputValue]);

  const filteredHackathons = React.useMemo(() => {
    return initialHackathons.filter((h) => {
      if (selectedEcosystem !== 'All' && h.ecosystem !== selectedEcosystem) {
        return false;
      }
      if (selectedFormat !== 'All' && h.format !== selectedFormat) {
        return false;
      }

      if (!searchQuery) {
        return true;
      }

      const titleMatch = h.title.toLowerCase().includes(searchQuery);
      const orgMatch = h.organizer.toLowerCase().includes(searchQuery);
      const descMatch = h.description.toLowerCase().includes(searchQuery);
      const ecoMatch = h.ecosystem.toLowerCase().includes(searchQuery);
      const tagMatch = h.tags.some((t) => t.toLowerCase().includes(searchQuery));
      const locMatch = h.location.toLowerCase().includes(searchQuery);
      return titleMatch || orgMatch || descMatch || ecoMatch || tagMatch || locMatch;
    });
  }, [initialHackathons, searchQuery, selectedEcosystem, selectedFormat]);

  const visibleHackathons = filteredHackathons.slice(0, visibleCount);
  const hasMore = visibleCount < filteredHackathons.length;

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredHackathons.length));
        }
      },
      { rootMargin: '600px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, filteredHackathons.length]);

  const isFiltered = Boolean(searchQuery) || selectedEcosystem !== 'All' || selectedFormat !== 'All';

  const selects = [
    {
      value: selectedEcosystem === 'All' ? '' : selectedEcosystem,
      onChange: (val: string) => {
        setSelectedEcosystem(val || 'All');
        setVisibleCount(PAGE_SIZE);
      },
      label: 'Ecosystem',
      placeholder: 'All Ecosystems',
      options: ecosystemOptions
        .filter((eco) => eco !== 'All')
        .map((eco) => ({ value: eco, label: eco })),
    },
    {
      value: selectedFormat === 'All' ? '' : selectedFormat,
      onChange: (val: string) => {
        setSelectedFormat(val || 'All');
        setVisibleCount(PAGE_SIZE);
      },
      label: 'Format',
      placeholder: 'All Formats',
      options: formatOptions
        .filter((fmt) => fmt !== 'All')
        .map((fmt) => ({ value: fmt, label: fmt })),
    },
  ];

  return (
    <div className="space-y-6">
      <ListingToolbar
        searchValue={inputValue}
        onSearchChange={setInputValue}
        searchPlaceholder="Search hackathons, ecosystems, prizes, or organizers"
        searchAriaLabel="Search hackathons"
        selects={selects}
        resultCount={filteredHackathons.length}
      />

      {visibleHackathons.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleHackathons.map((hackathon) => (
            <HackathonCard key={hackathon.id} hackathon={hackathon} />
          ))}
        </div>
      ) : (
        <ListingEmptyState
          title="No hackathons found"
          description={
            isFiltered
              ? 'Try clearing your search query or changing filters to see more results.'
              : 'There are currently no active hackathons listed in this view.'
          }
          onClear={
            isFiltered
              ? () => {
                  setInputValue('');
                  setSearchQuery('');
                  setSelectedEcosystem('All');
                  setSelectedFormat('All');
                  setVisibleCount(PAGE_SIZE);
                }
              : undefined
          }
        />
      )}

      {hasMore && (
        <div ref={sentinelRef} className="py-6 text-center text-sm text-muted-foreground">
          Loading more hackathons...
        </div>
      )}
    </div>
  );
}
