
'use client';

import type { Job } from '@/types';
import { useState, useMemo, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { JobCard } from './job-card';
import { Loader2, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { JobEmailCaptureDialog } from './job-email-capture-dialog';

function JobCardSkeleton() {
    return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
        </div>
    )
}

export function JobBoard({ initialJobs, captureEmail = false }: { initialJobs: Job[], captureEmail?: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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
      <div className="mb-8 max-w-6xl mx-auto">
        <div className="relative">
            <Input
            placeholder="Search by role, company, keyword..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full text-base pl-12 h-12 rounded-full shadow-lg focus-visible:ring-offset-4"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
        </div>
      </div>
      
        <div className="transition-opacity duration-300 min-h-[500px]">
            {isPending && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(9)].map((_, i) => <JobCardSkeleton key={i} />)}
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {!isPending && filteredJobs.map((job) => (
                    captureEmail ? (
                         <div key={job.id} onClick={() => setSelectedJob(job)} className="block h-full cursor-pointer transform transition-all duration-200 hover:-translate-y-1">
                            <JobCard job={job} />
                        </div>
                    ) : (
                         <a key={job.id} href={job.link} target="_blank" rel="noopener noreferrer" className="block h-full transform transition-all duration-200 hover:-translate-y-1">
                            <JobCard job={job} />
                        </a>
                    )
                ))}
            </div>

            {!isPending && filteredJobs.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-lg col-span-full mt-8">
                    <h3 className="text-xl font-semibold">No Jobs Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search query.</p>
                </div>
            )}
        </div>
        
        {captureEmail && (
            <JobEmailCaptureDialog 
                job={selectedJob} 
                open={!!selectedJob} 
                onOpenChange={(open) => !open && setSelectedJob(null)} 
            />
        )}
    </div>
  );
}
