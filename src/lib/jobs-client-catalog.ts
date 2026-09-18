import type { Job } from '@/types';
import type { CompanyLogoMap } from '@/lib/job-listing';

export type JobsApiResponse = {
  data: Job[];
  companyLogos?: CompanyLogoMap;
  meta: { total: number };
};

/** Paginated jobs from public API — avoids downloading the full ~5MB jobs-runtime.json in the browser. */
export async function fetchJobsPage(options: {
  search?: string;
  limit: number;
  offset: number;
  signal?: AbortSignal;
}): Promise<JobsApiResponse> {
  const params = new URLSearchParams();
  params.set('limit', String(options.limit));
  params.set('offset', String(options.offset));
  const search = options.search?.trim();
  if (search) params.set('search', search);

  const res = await fetch(`/api/jobs?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: options.signal,
  });

  if (!res.ok) {
    throw new Error(`Jobs API HTTP ${res.status}`);
  }

  const body = (await res.json()) as JobsApiResponse;
  if (!Array.isArray(body.data) || !body.meta || typeof body.meta.total !== 'number') {
    throw new Error('Jobs API malformed');
  }
  return body;
}
