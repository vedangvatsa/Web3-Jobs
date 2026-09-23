'use client';

import type { Job } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { getJobSlug } from '@/lib/job-slugs';
import { CompanyLogo } from '@/components/company-logo';

export function JobCard({ job, logoUrl, faviconUrl }: { job: Job; logoUrl?: string | null; faviconUrl?: string | null }) {
  const slug = getJobSlug(job);
  return (
    <Link href={`/${slug}`} className="block h-full min-w-0">
      <Card className="flex h-full min-w-0 flex-col border-border/70 bg-card shadow-none hover:border-foreground/25">
        <CardHeader className="px-4 pb-3 pt-4 min-w-0">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-transparent overflow-hidden">
              <CompanyLogo logoSrc={logoUrl ?? null} faviconUrl={faviconUrl ?? null} name={job.company} size="max-h-full max-w-full object-contain" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base leading-snug font-semibold line-clamp-2" title={job.title}>
                {job.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{job.company}</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
