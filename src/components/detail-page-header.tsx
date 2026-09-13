import Link from 'next/link';
import type { ReactNode } from 'react';

type Breadcrumb = {
  href: string;
  label: string;
};

export function DetailPageHeader({
  breadcrumbs,
  icon,
  title,
  subtitle,
  metadata,
  actions,
}: {
  breadcrumbs: Breadcrumb[];
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap gap-2 text-sm text-muted-foreground">
        {breadcrumbs.map((breadcrumb, index) => (
          <span key={breadcrumb.href} className="contents">
            {index > 0 && <span aria-hidden="true">/</span>}
            <Link href={breadcrumb.href} className="hover:text-foreground">
              {breadcrumb.label}
            </Link>
          </span>
        ))}
      </nav>

      <header className="border-b pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex flex-row min-w-0 items-start gap-3 lg:contents">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center">{icon}</div>
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-2xl font-bold tracking-tight lg:text-4xl">{title}</h1>
              {subtitle && <div className="mt-1">{subtitle}</div>}
              {metadata && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">{metadata}</div>}
            </div>
          </div>
          {actions && <div className="flex w-full shrink-0 flex-wrap gap-2 lg:w-auto">{actions}</div>}
        </div>
      </header>
    </>
  );
}
