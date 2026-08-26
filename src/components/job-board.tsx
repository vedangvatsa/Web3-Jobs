'use client';

import type { CompanyLogoMap } from '@/lib/job-listing';
import { getCompanySlug, getJobSlug } from '@/lib/job-slugs';
import type { Job } from '@/types';
import { LoaderCircle, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { JobCard } from './job-card';

const PAGE_SIZE = 50;

interface JobsApiResponse {
  data: Job[];
  companyLogos?: CompanyLogoMap;
  meta: {
    total: number;
  };
}

let trackingModule: Promise<typeof import('@/lib/posthog')> | null = null;

function loadTracking() {
  trackingModule ??= import('@/lib/posthog');
  return trackingModule;
}

function useJobViewObserver(jobs: Job[]) {
  const gridRef = useRef<HTMLDivElement>(null);
  const trackedJobs = useRef(new Set<string>());

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;
          const jobKey = element.dataset.jobKey;
          const jobId = element.dataset.jobId;
          if (!jobKey || !jobId || trackedJobs.current.has(jobKey)) return;

          trackedJobs.current.add(jobKey);
          observer.unobserve(element);
          void loadTracking().then(({ trackJobView }) => {
            trackJobView(
              jobId,
              element.dataset.jobTitle ?? '',
              element.dataset.company ?? '',
              element.dataset.source,
              element.dataset.date
            );
          });
        });
      },
      { threshold: 0.5 }
    );

    grid.querySelectorAll('[data-job-key]').forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [jobs]);

  return gridRef;
}

function mergeJobs(current: Job[], incoming: Job[]): Job[] {
  const jobsBySlug = new Map(current.map((job) => [getJobSlug(job), job]));
  incoming.forEach((job) => jobsBySlug.set(getJobSlug(job), job));
  return Array.from(jobsBySlug.values());
}

export function JobBoard({
  initialJobs,
  initialTotal = initialJobs.length,
  companyLogos = {},
}: {
  initialJobs: Job[];
  initialTotal?: number;
  companyLogos?: CompanyLogoMap;
}) {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState(initialJobs);
  const [total, setTotal] = useState(initialTotal);
  const [logoMap, setLogoMap] = useState<CompanyLogoMap>(companyLogos);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestController = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const isFirstSearchEffect = useRef(true);
  const trackedSearch = useRef('');

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(inputValue.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [inputValue]);

  const requestJobs = useCallback(async (
    query: string,
    offset: number,
    replace: boolean
  ) => {
    if (loadingRef.current) return;

    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    if (query) params.set('search', query);

    try {
      const response = await fetch(`/api/jobs?${params.toString()}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Jobs request failed with ${response.status}`);

      const result = await response.json() as JobsApiResponse;
      if (!Array.isArray(result.data) || typeof result.meta?.total !== 'number') {
        throw new Error('Jobs response was malformed');
      }

      setJobs((current) => replace ? result.data : mergeJobs(current, result.data));
      setLogoMap((current) => replace
        ? (result.companyLogos ?? {})
        : { ...current, ...(result.companyLogos ?? {}) });
      setTotal(result.meta.total);
      if (replace && query && trackedSearch.current !== query) {
        trackedSearch.current = query;
        void loadTracking().then(({ trackSearch }) => trackSearch(query, result.meta.total));
      }
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
      setError('Jobs could not be loaded. Please try again.');
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
        loadingRef.current = false;
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isFirstSearchEffect.current) {
      isFirstSearchEffect.current = false;
      return;
    }

    requestController.current?.abort();
    loadingRef.current = false;

    if (!searchQuery) {
      setJobs(initialJobs);
      setTotal(initialTotal);
      setLogoMap(companyLogos);
      setError(null);
      setIsLoading(false);
      return;
    }

    void requestJobs(searchQuery, 0, true);
  }, [companyLogos, initialJobs, initialTotal, requestJobs, searchQuery]);

  const hasMore = jobs.length < total;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingRef.current) {
          void requestJobs(searchQuery, jobs.length, false);
        }
      },
      { rootMargin: '600px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, jobs.length, requestJobs, searchQuery]);

  useEffect(() => () => {
    requestController.current?.abort();
    requestController.current = null;
    loadingRef.current = false;
  }, []);

  const gridRef = useJobViewObserver(jobs);

  return (
    <div>
      <div className="mb-6">
        <div
          className="relative"
          role="search"
          {...{ toolname: 'search_jobs', tooldescription: 'Search verified Web3 and crypto jobs by keyword or company' }}
        >
          <Input
            placeholder="Search roles or companies"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            className="h-11 w-full rounded-md pl-10 pr-10 text-base"
            aria-label="Search jobs"
            data-toolname="searchWeb3Jobs"
            data-tooldescription="Search current Web3 job listings by role or company."
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          {isLoading && (
            <LoaderCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-label="Loading jobs" />
          )}
        </div>
        {searchQuery && !isLoading && (
          <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
            {total} result{total === 1 ? '' : 's'}
          </p>
        )}
      </div>

      <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => {
          const slug = getJobSlug(job);
          const logo = logoMap[getCompanySlug(job.company)];
          return (
            <div
              key={slug}
              data-job-key={slug}
              data-job-id={job.id}
              data-job-title={job.title}
              data-company={job.company}
              data-source={job.source}
              data-date={job.date}
              className="h-full"
            >
              <JobCard job={job} logoUrl={logo?.logo} faviconUrl={logo?.favicon} />
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-8" aria-live="polite">
          {isLoading && (
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading jobs
            </span>
          )}
        </div>
      )}

      {!isLoading && jobs.length === 0 && (
        <div className="py-16 text-center">
          <h2 className="text-lg font-semibold">No jobs found</h2>
          <p className="mt-1 text-sm text-muted-foreground">Try a different role or company.</p>
        </div>
      )}

      {error && (
        <p className="py-6 text-center text-sm text-destructive" role="alert">{error}</p>
      )}
    </div>
  );
}
