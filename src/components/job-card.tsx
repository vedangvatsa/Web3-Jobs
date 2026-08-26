'use client';

import type { Job } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { getJobSlug } from '@/lib/job-slugs';
import { CompanyLogo } from '@/components/company-logo';

export function JobCard({ job, logoUrl, faviconUrl }: { job: Job; logoUrl?: string | null; faviconUrl?: string | null }) {
  const slug = getJobSlug(job);
  return (
    <Link href={`/${slug}`} className="block h-full group relative">
      <Card className="flex flex-col h-full rounded-lg shadow-sm hover:shadow-md border-transparent hover:border-border/60 bg-card transition-all duration-200">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center gap-3">
            {(logoUrl || faviconUrl) && (
              <div className="h-10 w-10 rounded-md border border-border/70 bg-background p-1.5 shrink-0 flex items-center justify-center">
                <CompanyLogo logoSrc={logoUrl ?? null} faviconUrl={faviconUrl ?? null} name={job.company} size="h-full w-full" />
              </div>
            )}
            <div className="min-w-0">
              <CardTitle className="text-base leading-snug font-semibold group-hover:text-primary transition-colors line-clamp-2" title={job.title}>
                {job.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{job.company}</p>
            </div>
          </div>
        </CardHeader>
        <span className="absolute bottom-3 right-4 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 pl-1">
          View Job →
        </span>
      </Card>
    </Link>
  );
}
