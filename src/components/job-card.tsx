'use client';

import type { Job } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function JobCard({ job }: { job: Job }) {
  return (
    <a href={job.link} target="_blank" rel="noopener noreferrer" className="block transform transition-all duration-300 hover:-translate-y-1">
      <Card className="flex flex-col h-full rounded-xl shadow-md hover:shadow-lg border-transparent hover:border-border/60">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base leading-snug font-semibold">{job.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow pt-0 pb-4 px-4">
          <p className="text-sm text-muted-foreground">{job.company}</p>
        </CardContent>
      </Card>
    </a>
  );
}
