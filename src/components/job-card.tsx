
'use client';

import type { Job } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function JobCard({ job }: { job: Job }) {
 return (
  <Card className="flex flex-col h-full rounded-lg shadow-sm hover:shadow-sm border-transparent hover:border-border/60 bg-card ">
   <CardHeader className="pb-2 pt-4 px-4">
    <CardTitle className="text-base leading-snug font-semibold">{job.title}</CardTitle>
   </CardHeader>
   <CardContent className="flex-grow pt-0 pb-3 px-4">
    <p className="text-sm text-muted-foreground">{job.company}</p>
   </CardContent>
  </Card>
 );
}
