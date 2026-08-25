'use client';

import type { Job } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { getJobSlug } from '@/lib/job-slugs';

export function JobCard({ job }: { job: Job }) {
  const slug = getJobSlug(job);
  return (
    <Link href={`/${slug}`} className="block h-full group">
      <Card className="flex flex-col h-full rounded-lg shadow-sm hover:shadow-md border-transparent hover:border-border/60 bg-card transition-all duration-200">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base leading-snug font-semibold group-hover:text-primary transition-colors" title={job.title}>
            {job.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow pt-0 pb-3 px-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{job.company}</p>
          <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View Job →
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
