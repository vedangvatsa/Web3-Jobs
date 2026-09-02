import { cn } from '@/lib/utils';

export function PageShell({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <div className={cn('container mx-auto page-section px-4', className)}>
      <div className={cn('site-container', containerClassName)}>{children}</div>
    </div>
  );
}
