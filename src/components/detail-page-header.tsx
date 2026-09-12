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
  mobileTitleInline = false,
}: {
  breadcrumbs: Breadcrumb[];
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
  mobileTitleInline?: boolean;
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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className={mobileTitleInline ? 'flex min-w-0 items-start gap-4 sm:contents' : 'contents'}>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center">{icon}</div>
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
              {subtitle && <div className="mt-2">{subtitle}</div>}
              {metadata && <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">{metadata}</div>}
            </div>
          </div>
          {actions && <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">{actions}</div>}
        </div>
      </header>
    </>
  );
}
