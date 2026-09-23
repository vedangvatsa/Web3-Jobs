import Link from 'next/link';
import type { ReactNode } from 'react';

type Breadcrumb = {
  href: string;
  label: string;
};

export function DetailPageHeader({
  breadcrumbs,
  currentPageLabel,
  icon,
  title,
  subtitle,
  metadata,
  actions,
  footer,
}: {
  breadcrumbs: Breadcrumb[];
  /** Current page title (not linked); rendered after breadcrumb trail. */
  currentPageLabel?: string;
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
  /** Extra block below the title row (e.g. company description). */
  footer?: ReactNode;
}) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground sm:mb-8">
        {breadcrumbs.map((breadcrumb, index) => (
          <span key={breadcrumb.href} className="inline-flex min-w-0 items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            <Link href={breadcrumb.href} className="shrink-0 hover:text-foreground">
              {breadcrumb.label}
            </Link>
          </span>
        ))}
        {currentPageLabel ? (
          <span className="inline-flex min-w-0 items-center gap-2">
            <span aria-hidden="true">/</span>
            <span className="break-words text-foreground">{currentPageLabel}</span>
          </span>
        ) : null}
      </nav>

      <header className="min-w-0 border-b pb-8">
        <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:flex-wrap lg:items-start">
          <div className="flex min-w-0 flex-row items-start gap-3 lg:contents">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden">{icon}</div>
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-2xl font-bold tracking-tight lg:text-4xl">{title}</h1>
              {subtitle && <div className="mt-1 min-w-0">{subtitle}</div>}
              {metadata && (
                <div className="mt-2 flex min-w-0 flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  {metadata}
                </div>
              )}
            </div>
          </div>
          {actions && <div className="flex w-full shrink-0 flex-wrap gap-2 lg:ml-auto lg:w-auto">{actions}</div>}
        </div>
        {footer ? <div className="mt-6 min-w-0 w-full">{footer}</div> : null}
      </header>
    </>
  );
}
