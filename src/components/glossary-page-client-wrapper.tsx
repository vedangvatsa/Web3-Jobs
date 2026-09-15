'use client';

import { Suspense } from 'react';
import {
  GlossaryPageClient,
  type GlossaryCategoryItem,
  type GlossaryTermItem,
} from '@/components/glossary-page-client';
import { Skeleton } from '@/components/ui/skeleton';

function GlossaryPageClientSkeleton() {
  return (
    <>
      <Skeleton className="mx-auto mb-8 h-10 w-48" />
      <Skeleton className="mb-6 h-10 w-full rounded-md" />
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </>
  );
}

export function GlossaryPageClientWrapper({
  allTerms,
  categories,
}: {
  allTerms: GlossaryTermItem[];
  categories: GlossaryCategoryItem[];
}) {
  return (
    <Suspense fallback={<GlossaryPageClientSkeleton />}>
      <GlossaryPageClient allTerms={allTerms} categories={categories} />
    </Suspense>
  );
}
