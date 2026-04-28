'use client';

import { useEffect, useRef } from 'react';
import { trackJobView } from '@/lib/posthog';
import type { Job } from '@/types';

export function JobViewTracker({ job }: { job: Job }) {
 const hasTracked = useRef(false);

 useEffect(() => {
  if (hasTracked.current) return;
  trackJobView(job.id, job.title, job.company);
  hasTracked.current = true;
 }, [job.id, job.title, job.company]);

 return null;
}
