'use client';

import type { Job } from '@/types';
import { useState, useMemo, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { JobCard } from './job-card';
import { Loader2, Search } from 'lucide-react';

export function JobBoard({ initialJobs }: { initialJobs: Job[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    startTransition(() => {
        setSearchQuery(e.target.value);
    });
  };

  const filteredJobs = useMemo(() => {
    if (!searchQuery) {
      return initialJobs;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return initialJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(lowercasedQuery) ||
        job.company.toLowerCase().includes(lowercasedQuery)
    );
  }, [initialJobs, searchQuery]);


  return (
    <div>
      <div className="mb-12">
        <div className="relative">
            <Input
            placeholder="Search by role, company, keyword..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full text-base pl-12 h-14 rounded-full shadow-lg focus-visible:ring-offset-4"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
        </div>
      </div>
      
        <div className="transition-opacity duration-300">
            {isPending && (
                <div className="flex justify-center items-center mb-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>

            {!isPending && filteredJobs.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-lg col-span-full">
                    <h3 className="text-xl font-semibold">No Jobs Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search query.</p>
                </div>
            )}
        </div>
    </div>
  );
}
