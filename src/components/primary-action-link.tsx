import type { AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** Shared primary CTA styles (height, colors, focus). Width is set per surface. */
const primaryActionBase =
  'inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

/** Fixed width — header “Post a Job” etc. */
export const primaryActionClassName = cn(primaryActionBase, 'w-36 shrink-0');

/** Full width on small screens — job Apply, event/popup Details in page headers. */
export const detailPagePrimaryActionClassName = cn(primaryActionBase, 'w-full shrink-0 lg:w-36');

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

export function DetailPrimaryActionLink({
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn(detailPagePrimaryActionClassName, className)} {...props}>
      {children}
    </a>
  );
}
