'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

function isJobRoute(pathname: string) {
  return pathname === '/' || pathname === '/jobs' || pathname.startsWith('/jobs/');
}

export function useShowPostJobCta() {
  const pathname = usePathname();
  const [showCta, setShowCta] = useState(() => isJobRoute(pathname));

  useEffect(() => {
    setShowCta(isJobRoute(pathname) || Boolean(document.querySelector('[data-job-page]')));
  }, [pathname]);

  return showCta;
}

export function PostJobNavCta() {
  const showCta = useShowPostJobCta();

  if (!showCta) return null;

  return (
    <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
      <Button size="sm" variant="default" className="shadow-sm font-semibold">
        Post a Job
      </Button>
    </a>
  );
}
