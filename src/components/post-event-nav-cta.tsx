'use client';

import { Button } from '@/components/ui/button';

export function PostEventNavCta() {
  return (
    <a className="post-event-nav-cta hidden sm:inline-flex" href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
      <Button size="sm" variant="outline" className="shadow-xs font-semibold">Post an Event</Button>
    </a>
  );
}
