'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getHeaderCta } from '@/lib/header-cta';
import { trackCTAClick } from '@/lib/posthog';

const POSTING_URL = 'https://t.me/web3jobs_rep';

export function PostNavCta() {
  const cta = getHeaderCta(usePathname());
  if (!cta) return null;

  return (
    <Button asChild size="sm" className="h-11 w-full font-semibold" data-header-cta={cta}>
      <a
        href={POSTING_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackCTAClick(cta === 'job' ? 'post_a_job' : 'post_an_event', POSTING_URL)}
      >
        {cta === 'job' ? 'Post a Job' : 'Post an Event'}
      </a>
    </Button>
  );
}
