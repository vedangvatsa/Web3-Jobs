'use client';

import type { Job } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { JobPosting } from 'schema-dts';

export function JobCard({ job }: { job: Job }) {
  return (
    <a href={job.link} target="_blank" rel="noopener noreferrer" className="block transform transition-all duration-300 hover:-translate-y-1.5">
      <Card className="flex flex-col h-full rounded-xl shadow-lg hover:shadow-xl border-transparent hover:border-border/80">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-lg leading-snug font-bold">{job.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow pt-0 pb-5 px-5">
          <p className="text-base text-muted-foreground">{job.company}</p>
        </CardContent>
      </Card>
    </a>
  );
}
