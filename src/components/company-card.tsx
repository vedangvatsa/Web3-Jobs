'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { CompanyLogo } from '@/components/company-logo';
import type { CompanySummary } from '@/types';
import type { ResponsiveImagePlan } from '@/lib/responsive-images';

export function CompanyCard({
  company,
  logoUrl,
  faviconUrl,
  imageVariants,
}: {
  company: CompanySummary;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  imageVariants?: ResponsiveImagePlan;
}) {
  return (
    <Link href={`/${company.slug}`} className="block h-full min-w-0">
      <Card className="flex h-full min-w-0 flex-col border-border/70 bg-card shadow-none hover:border-foreground/25 transition-colors">
        <CardHeader className="px-4 pb-3 pt-4 min-w-0">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-transparent overflow-hidden">
              <CompanyLogo logoSrc={logoUrl ?? null} faviconUrl={faviconUrl ?? null} imageVariants={imageVariants} imageSize={40} name={company.name} size="max-h-full max-w-full object-contain" />
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
