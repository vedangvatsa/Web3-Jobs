'use client';

import type { Job } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Building2, CalendarDays } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';

export function JobCard({ job }: { job: Job }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // This needs to be in useEffect to avoid hydration mismatch
    if (job.date) {
      try {
        setFormattedDate(formatDistanceToNow(new Date(job.date), { addSuffix: true }));
      } catch (e) {
        setFormattedDate('Invalid date');
      }
    }
  }, [job.date]);
  
  return (
    <Card className="flex flex-col transform transition-all duration-300 hover:shadow-accent/20 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg leading-tight font-semibold">{job.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">{job.company}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-secondary/50 py-3 px-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="w-3.5 h-3.5" />
          <time dateTime={job.date}>{formattedDate}</time>
        </div>
        <Button asChild variant="secondary" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
          <a href={job.link} target="_blank" rel="noopener noreferrer">
            Apply
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
