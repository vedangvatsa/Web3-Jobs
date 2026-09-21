import { cn } from '@/lib/utils';

/** Vertical section spacing + single `site-container` column (matches header/footer). */
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
    <div className={cn('page-section', className)}>
      <div className={cn('site-container', containerClassName)}>{children}</div>
    </div>
  );
}

/** Standard full-page wrapper for interactive tools (one container column). */
export function ToolPageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <PageShell>{children}</PageShell>
      </main>
    </div>
  );
}

/** Skeleton for dynamic tool imports (parent supplies PageShell via ToolPageFrame or form). */
export function ToolFormLoadingSkeleton() {
  return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-10 w-full rounded-md bg-muted" />
      <div className="h-32 w-full rounded-md bg-muted" />
      <div className="h-10 w-full rounded-md bg-muted" />
    </div>
  );
}
