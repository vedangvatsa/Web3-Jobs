'use client';

import { useEffect, useState } from 'react';
import { MAX_JOB_AGE_DAYS, parseJobPostingDate, type JobAgeInput } from '@/lib/job-age-policy.mjs';

export function useJobAgeClock(jobs: JobAgeInput[]): number {
  const [now, setNow] = useState(Date.now);
  const nextExpiry = Math.min(...jobs.map(job => parseJobPostingDate(job.date) + MAX_JOB_AGE_DAYS * 86400000 + 1).filter(time => time > now));
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = Number.isFinite(nextExpiry) ? window.setTimeout(update, Math.min(Math.max(0, nextExpiry - Date.now()), 2147483647)) : undefined;
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [nextExpiry, now]);
  return now;
}
