'use client';

import { useEffect } from 'react';
import { trackJobView } from '@/lib/posthog';
import type { Job } from '@/types';

export function JobViewTracker({ job }: { job: Job }) {
  useEffect(() => {
    trackJobView(job.id, job.title, job.company);
  }, [job.id, job.title, job.company]);

  return null;
}
