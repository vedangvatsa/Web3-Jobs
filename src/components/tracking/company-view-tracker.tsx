'use client';

import { useEffect } from 'react';
import { trackCompanyView } from '@/lib/posthog';

export function CompanyViewTracker({ 
  slug, 
  name, 
  jobCount 
}: { 
  slug: string; 
  name: string;
  jobCount: number;
}) {
  useEffect(() => {
    trackCompanyView(slug, name, jobCount);
  }, [slug, name, jobCount]);

  return null;
}
