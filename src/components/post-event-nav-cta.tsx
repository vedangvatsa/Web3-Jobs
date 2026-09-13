'use client';

import { useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function PostEventNavCta() {
  const pathname = usePathname();
  const isEventsIndex = pathname === '/events';
  const [isEventDetail, setIsEventDetail] = useState(false);

  useLayoutEffect(() => {
    setIsEventDetail(!isEventsIndex && document.querySelector('[data-event-page]') !== null);
  }, [isEventsIndex, pathname]);

  if (!isEventsIndex && !isEventDetail) return null;

  return (
    <a className="post-event-nav-cta" href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
      <Button size="sm" variant="default" className="shadow-sm font-semibold">Post an Event</Button>
    </a>
  );
}
