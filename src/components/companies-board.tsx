'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { CompanyCard } from '@/components/company-card';
import { ListingEmptyState, ListingToolbar } from '@/components/listing-toolbar';
import type { CompanySummary } from '@/types';
import type { CompanyLogoMap } from '@/lib/job-listing';

const INITIAL_COUNT = 48;
const LOAD_MORE_COUNT = 30;

interface CompaniesBoardProps {
  initialCompanies: CompanySummary[];
  companyLogos?: CompanyLogoMap;
}

export function CompaniesBoard({ initialCompanies, companyLogos = {} }: CompaniesBoardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return initialCompanies;
    const q = searchQuery.toLowerCase().trim();
    return initialCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description?.toLowerCase() || '').includes(q) ||
        c.slug.toLowerCase().includes(q)
    );
  }, [initialCompanies, searchQuery]);

  const visibleCompanies = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, filtered.length));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, filtered.length]);

  return (
    <div>
      <ListingToolbar
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setVisibleCount(INITIAL_COUNT);
        }}
        searchPlaceholder="Search companies"
        searchAriaLabel="Search companies"
        resultCount={searchQuery ? filtered.length : null}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCompanies.map((company) => {
          const logo = companyLogos[company.slug];
          return (
            <CompanyCard
              key={company.slug}
              company={company}
              logoUrl={logo?.logo}
              faviconUrl={logo?.favicon}
            />
          );
        })}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-8" aria-hidden="true">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            Loading more companies...
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <ListingEmptyState
          title="No companies found"
          description="Try a different company name."
          onClear={searchQuery ? () => setSearchQuery('') : undefined}
          clearLabel="Clear search"
        />
      )}
    </div>
  );
}
