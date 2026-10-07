import type { ComponentProps } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function ListingCard({ className, ...props }: ComponentProps<typeof Card>) {
  return <Card className={cn('flex h-full min-w-0 flex-col border-border/70 bg-card shadow-none transition-colors hover:border-foreground/25', className)} {...props} />;
}

export function ListingCardHeader({ className, ...props }: ComponentProps<typeof CardHeader>) {
  return <CardHeader className={cn('px-4 pb-3 pt-4', className)} {...props} />;
}

export function ListingCardTitle({ as: Heading = 'h3', className, ...props }: ComponentProps<'h3'> & { as?: 'h2' | 'h3' }) {
  return <Heading className={cn('line-clamp-2 text-base font-semibold leading-snug tracking-tight', className)} {...props} />;
}
