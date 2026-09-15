'use client';

import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const LISTING_SELECT_CLASS =
  'h-10 min-w-0 flex-1 truncate rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer md:flex-none';

export type ListingSelectFilter = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  className?: string;
};

export type ListingToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchAriaLabel: string;
  selects?: ListingSelectFilter[];
  trailing?: ReactNode;
  resultCount?: number | null;
  searchEndAdornment?: ReactNode;
  searchWrapperProps?: Record<string, string>;
  inputProps?: Record<string, string>;
};

export function ListingToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
  selects = [],
  trailing,
  resultCount,
  searchEndAdornment,
  searchWrapperProps,
  inputProps,
}: ListingToolbarProps) {
  const hasSideControls = selects.length > 0 || Boolean(trailing);

  return (
    <div className="mb-6 space-y-2">
      <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
        <div
          className="relative flex-1 min-w-0"
          role="search"
          {...searchWrapperProps}
        >
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn('h-10 w-full rounded-md pl-9 text-sm', searchEndAdornment ? 'pr-9' : 'pr-3')}
            aria-label={searchAriaLabel}
            {...inputProps}
          />
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          {searchEndAdornment ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">{searchEndAdornment}</div>
          ) : null}
        </div>

        {hasSideControls ? (
          <div className="flex w-full items-center gap-2 md:w-auto md:shrink-0">
            {selects.map((select) => (
              <select
                key={select.label}
                value={select.value}
                onChange={(e) => select.onChange(e.target.value)}
                className={cn(LISTING_SELECT_CLASS, select.className)}
                aria-label={select.label}
              >
                <option value="">{select.placeholder}</option>
                {select.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
            {trailing}
          </div>
        ) : null}
      </div>

      {typeof resultCount === 'number' ? (
        <p className="text-xs text-muted-foreground pt-1" aria-live="polite">
          Showing {resultCount} result{resultCount === 1 ? '' : 's'}
        </p>
      ) : null}
    </div>
  );
}

export function ListingEmptyState({
  title,
  description = 'Try adjusting your search or filters.',
  onClear,
  clearLabel = 'Clear all filters',
}: {
  title: string;
  description?: string;
  onClear?: () => void;
  clearLabel?: string;
}) {
  return (
    <div className="text-center py-16">
      <p className="text-lg font-medium text-foreground">{title}</p>
      <p className="text-muted-foreground mt-2">{description}</p>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 text-sm text-primary underline-offset-4 hover:underline"
        >
          {clearLabel}
        </button>
      ) : null}
    </div>
  );
}
