'use client';

import type { Job } from '@/types';
import { useState, useMemo, useEffect, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JobCard } from './job-card';
import { Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

function JobBoardSkeleton() {
    return (
        <div>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <Skeleton className="h-10 w-full md:flex-1" />
                <Skeleton className="h-10 w-full md:w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
            </div>
        </div>
    );
}

export function JobBoard({ jobs }: { jobs: Job[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date-desc');
  const [isMounted, setIsMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    startTransition(() => {
        setSearchQuery(e.target.value);
    });
  };
  
  const handleSortChange = (value: string) => {
    startTransition(() => {
        setSortOption(value);
    });
  };

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs;
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(lowercasedQuery) ||
          job.company.toLowerCase().includes(lowercasedQuery)
      );
    }

    const [sortBy, sortOrder] = sortOption.split('-');

    return [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      
      const valA = sortBy === 'title' ? a.title : a.company;
      const valB = sortBy === 'title' ? b.title : b.company;

      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [jobs, searchQuery, sortOption]);

  if (!isMounted) {
    return <JobBoardSkeleton />;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-[64px] bg-background/95 backdrop-blur-sm z-20 py-4 -mx-4 px-4 border-b">
        <div className="relative w-full md:flex-1">
            <Input
            placeholder="Search by title, company, or keyword..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full text-base pl-10"
            />
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
        </div>
        
        <Select value={sortOption} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest</SelectItem>
            <SelectItem value="date-asc">Oldest</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            <SelectItem value="company-asc">Company (A-Z)</SelectItem>
            <SelectItem value="company-desc">Company (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
        <div className="transition-opacity duration-300">
            <div className="flex justify-between items-center mb-4">
                <p className="text-muted-foreground">
                    {isPending ? <Loader2 className="h-5 w-5 animate-spin inline-block mr-2"/> : ''}
                    Showing {filteredAndSortedJobs.length} of {jobs.length} jobs
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>

            {!isPending && filteredAndSortedJobs.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-lg col-span-full">
                    <h3 className="text-xl font-semibold">No Jobs Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search query.</p>
                </div>
            )}
        </div>
    </div>
  );
}
