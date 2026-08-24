
'use client';

import type { Job } from '@/types';
import { useState, useMemo, useTransition, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { JobCard } from './job-card';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

import { JobApplicationButton } from './tracking/job-application-button';
import { SearchTracker } from './tracking/search-tracker';
import { trackJobView } from '@/lib/posthog';
import { useDebounce } from '@/hooks/use-debounce';

const INITIAL_JOBS_COUNT = 50;
const LOAD_MORE_COUNT = 50;

function JobCardSkeleton() {
 return (
  <div className="flex flex-col space-y-3">
   <Skeleton className="h-[125px] w-full rounded-lg" />
  </div>
 );
}

function useJobViewObserver(jobs: Job[]) {
 const gridRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  if (!gridRef.current) return;

  const tracked = new Set<string>();
  const observer = new IntersectionObserver(
   (entries) => {
    entries.forEach((entry) => {
     if (!entry.isIntersecting) return;
     const el = entry.target as HTMLElement;
     const jobId = el.dataset.jobId;
     if (jobId && !tracked.has(jobId)) {
      tracked.add(jobId);
      trackJobView(jobId, el.dataset.jobTitle ?? '', el.dataset.company ?? '', el.dataset.source, el.dataset.date);
     }
    });
   },
   { threshold: 0.5 }
  );

  const cards = gridRef.current.querySelectorAll('[data-job-id]');
  cards.forEach((card) => observer.observe(card));

  return () => observer.disconnect();
 }, [jobs]);

 return gridRef;
}

export function JobBoard({ initialJobs }: { initialJobs: Job[] }) {
 const [searchQuery, setSearchQuery] = useState('');
 const [isPending, startTransition] = useTransition();
 const [visibleCount, setVisibleCount] = useState(INITIAL_JOBS_COUNT);
 const sentinelRef = useRef<HTMLDivElement>(null);

 const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  startTransition(() => {
   setSearchQuery(e.target.value);
   setVisibleCount(INITIAL_JOBS_COUNT);
  });
 };

 const debouncedQuery = useDebounce(searchQuery, 200);

 const filteredJobs = useMemo(() => {
  if (!debouncedQuery) return initialJobs;
  const lowercasedQuery = debouncedQuery.toLowerCase();
  return initialJobs.filter(
   (job) =>
    job.title.toLowerCase().includes(lowercasedQuery) ||
    job.company.toLowerCase().includes(lowercasedQuery)
  );
 }, [initialJobs, debouncedQuery]);

 // When searching, show all results; otherwise paginate
 const isSearching = searchQuery.length > 0;
 const visibleJobs = isSearching ? filteredJobs : filteredJobs.slice(0, visibleCount);
 const hasMore = !isSearching && visibleCount < filteredJobs.length;
 // Infinite scroll via IntersectionObserver on sentinel div
 useEffect(() => {
  const sentinel = sentinelRef.current;
  if (!sentinel || !hasMore) return;

  const observer = new IntersectionObserver(
   (entries) => {
    if (entries[0]?.isIntersecting) {
     setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, filteredJobs.length));
    }
   },
   { rootMargin: '1200px' }
  );

  observer.observe(sentinel);
  return () => observer.disconnect();
 }, [hasMore, filteredJobs.length]);

 const gridRef = useJobViewObserver(visibleJobs);

 return (
  <div>
   <SearchTracker query={searchQuery} resultsCount={filteredJobs.length} />
   <div className="mb-8 site-container">
    <div className="relative">
     <Input
      placeholder="Search by role, company, keyword..."
      value={searchQuery}
      onChange={handleSearchChange}
      className="w-full text-base pl-12 h-12 rounded-full shadow-sm focus-visible:ring-offset-4"
      data-toolname="searchWeb3Jobs"
      data-tooldescription="Search 10,000+ Web3 job listings by role, company, or keyword. Returns jobs with title, company, location, type, and apply link."
     />
     <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
    </div>
    {isSearching && (
     <p className="text-center text-sm text-muted-foreground mt-3">
      {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''} found
     </p>
    )}
   </div>

   <div className="transition-opacity duration-300 min-h-[500px]">
    {isPending && (
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(9)].map((_, i) => <JobCardSkeleton key={i} />)}
     </div>
    )}

    <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
     {!isPending && visibleJobs.map((job, i) => (
       <div
        key={`${job.id}-${i}`}
        data-job-id={job.id}
        data-job-title={job.title}
        data-company={job.company}
        data-source={job.source}
        data-date={job.date}
       >
        <JobApplicationButton
         jobId={job.id}
         jobTitle={job.title}
         companyName={job.company}
         jobUrl={job.link}
         source={job.source}
         date={job.date}
        >
         <JobCard job={job} />
        </JobApplicationButton>
       </div>
     ))}
    </div>

    {/* Sentinel for auto infinite scroll */}
    {hasMore && (
     <div ref={sentinelRef} className="flex justify-center py-8" aria-hidden="true">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
       <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
       Loading more jobs...
      </div>
     </div>
    )}

    {!isPending && filteredJobs.length === 0 && (
     <div className="text-center py-20 border-2 border-dashed rounded-lg col-span-full mt-8">
      <h3 className="text-xl font-semibold">No Jobs Found</h3>
      <p className="text-muted-foreground mt-2">Try adjusting your search query.</p>
     </div>
    )}
   </div>


  </div>
 );
}
