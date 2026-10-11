'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { RECOVERY_SECTIONS, recoveryContext, recoveryDestinations } from '@/lib/page-recovery';

const textLink = 'inline-flex min-h-11 min-w-11 items-center rounded-sm font-medium underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export function PageRecovery() {
  const pathname = usePathname();
  const [context, setContext] = useState<ReturnType<typeof recoveryContext> | null>(null);

  useEffect(() => {
    setContext(recoveryContext(pathname || window.location.pathname));
  }, [pathname]);

  return (
    <div data-page-recovery className="mx-auto max-w-2xl text-center">
      <p className="mb-3 text-sm font-medium text-muted-foreground">404</p>
      <PageHeader
        title="Page not found"
        description="The link may be outdated or the address incorrect."
        className="mb-6"
      />
      {context?.suggestion && (
        <p className="mb-5 text-sm">
          Did you mean{' '}
          <Link href={RECOVERY_SECTIONS[context.suggestion].href} prefetch={false} className={textLink}>
            {RECOVERY_SECTIONS[context.suggestion].label}
          </Link>?
        </p>
      )}

      <nav aria-label="Recovery pages" className="mx-auto max-w-lg">
        <ul className="grid auto-rows-fr grid-cols-1 gap-3 min-[360px]:grid-cols-2">
          {recoveryDestinations(context?.section).map(id => {
            const item = RECOVERY_SECTIONS[id];
            return (
              <li key={id} className="min-w-0">
                <Link href={item.href} prefetch={false} className="group flex h-full min-h-20 flex-col items-center justify-center gap-1 break-words rounded-md border border-muted-foreground px-3 py-4 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <span className="max-w-full font-semibold group-hover:underline group-hover:underline-offset-4">{item.label}</span>
                  <span className="max-w-full text-sm text-muted-foreground">{item.description}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Button asChild size="lg" className="mt-6 h-auto min-h-11 whitespace-normal px-6 py-3">
        <Link href="/" prefetch={false}>Go to homepage</Link>
      </Button>
    </div>
  );
}
