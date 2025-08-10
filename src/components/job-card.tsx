'use client';

import type { Job } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function JobCard({ job }: { job: Job }) {
  return (
    <a href={job.link} target="_blank" rel="noopener noreferrer" className="block transform transition-all duration-300 hover:-translate-y-1">
      <Card className="flex flex-col h-full rounded-xl shadow-sm hover:shadow-md border-transparent hover:border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base leading-tight font-semibold">{job.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow pt-2">
          <p className="text-sm text-muted-foreground">{job.company}</p>
        </CardContent>
      </Card>
    </a>
  );
}
