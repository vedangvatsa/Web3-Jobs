
'use client';

import type { Job } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function JobCard({ job }: { job: Job }) {
  const [postedAt, setPostedAt] = useState('');

  useEffect(() => {
    // This ensures the time is calculated only on the client side, after hydration.
    setPostedAt(formatDistanceToNow(new Date(job.date), { addSuffix: true }));
  }, [job.date]);

  return (
    <a href={job.link} target="_blank" rel="noopener noreferrer" className="block transform transition-all duration-200 hover:-translate-y-1 h-full">
      <Card className="flex flex-col h-full rounded-xl shadow-md hover:shadow-lg border-transparent hover:border-border/60 bg-card/60 backdrop-blur-xl">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base leading-snug font-semibold">{job.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow pt-0 pb-3 px-4">
          <p className="text-sm text-muted-foreground">{job.company}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-0 pb-3 px-4">
          <span>{job.source}</span>
          {postedAt ? (
            <span>{postedAt}</span>
          ) : (
            <Skeleton className="h-4 w-[100px]" />
          )}
        </CardFooter>
      </Card>
    </a>
  );
}
