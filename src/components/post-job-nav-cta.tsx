'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { classifySlug } from '@/lib/slug-classifier';

export function PostJobNavCta() {
  const pathname = usePathname();
  const slug = pathname.replace(/^\//, '');

  const isJobsIndex = pathname === '/' || pathname === '/jobs';
  const isJobPage = slug ? classifySlug(slug) === 'job' : false;

  if (!isJobsIndex && !isJobPage) return null;

  return (
    <a className="post-job-nav-cta" href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
      <Button size="sm" variant="default" className="shadow-sm font-semibold">
        Post a Job
      </Button>
    </a>
  );
}
