'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { CompanyLogo } from '@/components/company-logo';
import type { Company } from '@/types';

export function CompanyCard({
  company,
  logoUrl,
  faviconUrl,
}: {
  company: Company;
  logoUrl?: string | null;
  faviconUrl?: string | null;
}) {
  return (
    <Link href={`/${company.slug}`} className="block h-full">
      <Card className="flex h-full flex-col border-border/70 bg-card shadow-none hover:border-foreground/25 transition-colors">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md border border-border/60 bg-muted/40 p-1.5 shrink-0 flex items-center justify-center">
              <CompanyLogo logoSrc={logoUrl ?? null} faviconUrl={faviconUrl ?? null} name={company.name} size="h-full w-full" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base leading-snug font-semibold line-clamp-2" title={company.name}>
                {company.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {company.jobCount} open {company.jobCount === 1 ? 'role' : 'roles'}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
