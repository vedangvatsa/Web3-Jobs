'use client';

import { forwardRef, type ComponentProps, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const LISTING_SELECT_CLASS =
  'h-11 min-h-11 min-w-0 flex-1 truncate rounded-md border border-input bg-background px-3 text-base text-foreground shadow-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer [color-scheme:light] dark:[color-scheme:dark] md:flex-none md:text-sm';

export const ListingSelect = forwardRef<HTMLSelectElement, ComponentProps<'select'>>(({ className, ...props }, ref) => (
  <select {...props} ref={ref} className={cn(LISTING_SELECT_CLASS, className)} />
));
ListingSelect.displayName = 'ListingSelect';

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
  leading?: ReactNode;
  trailing?: ReactNode;
  resultCount?: number | null;
  searchEndAdornment?: ReactNode;
  searchWrapperProps?: Record<string, string>;
  inputProps?: ComponentProps<typeof Input> & { [name: `data-${string}`]: string | number | boolean | undefined };
};

export function ListingToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
  selects = [],
  leading,
  trailing,
  resultCount,
  searchEndAdornment,
  searchWrapperProps,
  inputProps,
}: ListingToolbarProps) {
  const hasSideControls = selects.length > 0 || Boolean(trailing);
  const hasManySelects = selects.length > 2;

  return (
    <div data-listing-toolbar className="mb-6 space-y-2">
      <div className={leading ? cn('grid grid-cols-1 items-center gap-2.5', hasSideControls ? 'md:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[auto_minmax(0,1fr)_auto]' : 'lg:grid-cols-[auto_minmax(0,1fr)]') : cn('flex flex-col gap-2.5 items-stretch', hasManySelects ? 'lg:flex-row lg:items-center' : 'md:flex-row md:items-center')}>
        {leading && <div className={cn('min-w-0', hasSideControls && 'md:col-span-2 lg:col-span-1')}>{leading}</div>}
        <div
          className="relative flex-1 min-w-0"
          role="search"
          {...searchWrapperProps}
        >
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn('h-11 w-full rounded-md pl-9 text-base md:text-sm', searchEndAdornment ? 'pr-9' : 'pr-3')}
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
          <div className={cn('flex w-full min-w-0 flex-wrap items-center gap-2', hasManySelects ? 'lg:w-auto lg:shrink-0' : 'md:w-auto md:shrink-0')}>
            {selects.map((select) => (
              <ListingSelect
                key={select.label}
                value={select.value}
                onChange={(e) => select.onChange(e.target.value)}
                className={cn('basis-[calc(50%-0.25rem)] md:basis-auto', select.className)}
                aria-label={select.label}
              >
                <option value="">{select.placeholder}</option>
                {select.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </ListingSelect>
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
  title: ReactNode;
  description?: string;
  onClear?: () => void;
  clearLabel?: string;
}) {
  return (
    <div role="status" className="text-center py-16">
      <p className="text-lg font-medium text-foreground">{title}</p>
      <p className="text-muted-foreground mt-2">{description}</p>
      {onClear ? (
        <Button
          type="button"
          variant="link"
          onClick={onClear}
          className="mt-4 h-11 px-0"
        >
          {clearLabel}
        </Button>
      ) : null}
    </div>
  );
}
