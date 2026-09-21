import type { AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** 36px tall, 12px side padding, fixed width so every primary CTA is the same box. */
export const primaryActionClassName =
  'inline-flex h-9 w-36 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

export function PrimaryActionLink({
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn(primaryActionClassName, className)} {...props}>
      {children}
    </a>
  );
}
