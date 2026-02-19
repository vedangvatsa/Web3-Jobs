'use client';

import { trackSearch } from '@/lib/posthog';
import { useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

export function SearchTracker({ query, resultsCount }: { query: string; resultsCount: number }) {
  const previousQuery = useRef('');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery !== previousQuery.current) {
      trackSearch(debouncedQuery, resultsCount);
      previousQuery.current = debouncedQuery;
    }
  }, [debouncedQuery, resultsCount]);

  return null;
}
