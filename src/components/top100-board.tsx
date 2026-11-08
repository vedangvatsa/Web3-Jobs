'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanyLogo } from '@/components/company-logo';
import { ListingEmptyState, ListingToolbar } from '@/components/listing-toolbar';
import type { Top100Employer } from '@/types/top100';
import type { CompanyLogoMap } from '@/lib/job-logo-map';

const INITIAL_COUNT = 48;
const LOAD_MORE_COUNT = 30;

type SortField = 'rank' | 'jobs' | 'remote' | 'salary';

interface Top100BoardProps {
  initialEmployers: Top100Employer[];
  sectors?: Array<{ name: string; count: number }>;
  companyLogos?: CompanyLogoMap;
}

export function Top100Board({ initialEmployers, companyLogos = {} }: Top100BoardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let list = [...initialEmployers];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          emp.category.toLowerCase().includes(q) ||
          emp.headquarters.toLowerCase().includes(q) ||
          emp.slug.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortField === 'jobs') {
        return b.activeJobs - a.activeJobs || b.scores.composite - a.scores.composite;
      }
      if (sortField === 'remote') {
        return b.remotePercentage - a.remotePercentage || b.activeJobs - a.activeJobs;
      }
      if (sortField === 'salary') {
        return b.salaryTransparencyPct - a.salaryTransparencyPct || b.activeJobs - a.activeJobs;
      }
      return a.rank - b.rank;
    });

    return list;
  }, [initialEmployers, searchQuery, sortField]);

  const visibleEmployers = useMemo(() => {
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
        searchPlaceholder="Search employers"
        searchAriaLabel="Search employers"
        selects={[
          {
            value: sortField,
            onChange: (value) => {
              setSortField(value as SortField);
              setVisibleCount(INITIAL_COUNT);
            },
            label: 'Sort employers',
            placeholder: 'Sort by',
            options: [
              { value: 'rank', label: 'Overall Rank' },
              { value: 'jobs', label: 'Most Open Roles' },
              { value: 'remote', label: 'Highest Remote %' },
              { value: 'salary', label: 'Salary Transparency' },
            ],
            className: 'md:max-w-[180px]',
          },
        ]}
      />

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
        {visibleEmployers.map((emp) => {
          const logo = companyLogos[emp.slug];
          return (
            <Link key={emp.slug} href={`/${emp.slug}`} prefetch={false} className="block h-full min-w-0">
              <Card className="flex h-full min-w-0 flex-col border-border/70 bg-card shadow-none hover:border-foreground/25 transition-colors">
                <CardHeader className="px-4 pb-3 pt-4 min-w-0 flex-1">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-transparent overflow-hidden">
                      <CompanyLogo
                        logoSrc={logo?.logo ?? null}
                        faviconUrl={logo?.favicon ?? null}
                        imageVariants={logo?.imageVariants}
                        imageSize={40}
                        name={emp.name}
                        size="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <CardTitle className="text-base leading-snug font-semibold line-clamp-1" title={emp.name}>
                          {emp.name}
                        </CardTitle>
                        <span className="text-xs font-semibold tabular-nums text-muted-foreground shrink-0">
                          #{emp.rank}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {emp.category} · {emp.activeJobs} open {emp.activeJobs === 1 ? 'role' : 'roles'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-2.5 border-t border-border/60">
                    <span>Score {emp.scores.composite.toFixed(1)}/100</span>
                    <span>{emp.remotePercentage}% Remote</span>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-8" aria-hidden="true">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            Loading more employers...
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <ListingEmptyState
          title="No employers found"
          description="Try a different search term."
          onClear={() => {
            setSearchQuery('');
            setSortField('rank');
            setVisibleCount(INITIAL_COUNT);
          }}
          clearLabel="Clear search"
        />
      )}
    </div>
  );
}
