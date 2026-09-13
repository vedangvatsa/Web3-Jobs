'use client';

import { useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function PostJobNavCta() {
  const pathname = usePathname();
  const isJobsIndex = pathname === '/' || pathname === '/jobs';
  const [isJobDetail, setIsJobDetail] = useState(false);

  useLayoutEffect(() => {
    setIsJobDetail(!isJobsIndex && document.querySelector('[data-job-page]') !== null);
  }, [isJobsIndex, pathname]);

  if (!isJobsIndex && !isJobDetail) return null;

  return (
    <a className="post-job-nav-cta" href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
      <Button size="sm" variant="default" className="shadow-sm font-semibold">
        Post a Job
      </Button>
    </a>
  );
}
