'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScrollableRegion({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const region = ref.current;
    if (!region) return;
    const measure = () => setOverflows(region.scrollWidth > region.clientWidth + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(region);
    if (region.firstElementChild) observer.observe(region.firstElementChild);
    measure();
    return () => observer.disconnect();
  }, [children]);

  return <div className="min-w-0">
    {overflows && <p id={hintId} className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground print:hidden"><MoveHorizontal className="h-3.5 w-3.5" aria-hidden />Scroll sideways to see all columns</p>}
    <div ref={ref} role="region" aria-label={label} aria-describedby={overflows ? hintId : undefined} tabIndex={0} className={cn('max-w-full overflow-x-auto overscroll-x-contain rounded-lg border border-border/70 bg-card text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}>{children}</div>
  </div>;
}
