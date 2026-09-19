'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { classifySlug } from '@/lib/slug-classifier';

export function PostEventNavCta() {
  const pathname = usePathname();
  const slug = pathname.replace(/^\//, '');

  const isEventsIndex = pathname === '/events';
  const isEventPage = slug ? classifySlug(slug) === 'event' : false;

  if (!isEventsIndex && !isEventPage) return null;

  return (
    <a className="post-event-nav-cta hidden sm:inline-flex" href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
      <Button size="sm" variant="outline" className="shadow-xs font-semibold">Post an Event</Button>
    </a>
  );
}
