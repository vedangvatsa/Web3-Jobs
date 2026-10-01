import type { Job } from '@/types';
import type { CompanyLogoMap } from '@/lib/job-logo-map';
import { paginatePublicJobs } from '@/lib/jobs-public-listing';
import type { ResponsiveImagePlan } from './responsive-images';

export type JobsApiResponse = {
  data: Job[];
  companyLogos?: CompanyLogoMap;
  meta: { total: number };
};

let catalogPromise: Promise<Job[]> | null = null;
let logoVariantsPromise: Promise<Record<string, ResponsiveImagePlan>> | null = null;

function loadLogoVariants(): Promise<Record<string, ResponsiveImagePlan>> {
  logoVariantsPromise ??= fetch('/data/company-image-variants.json', { signal: AbortSignal.timeout(2500) })
    .then(async response => {
      if (!response.ok) return {};
      const value: unknown = await response.json();
      return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, ResponsiveImagePlan> : {};
    })
    .catch(() => ({}));
  return logoVariantsPromise;
}

async function loadJobsCatalog(): Promise<Job[]> {
  if (!catalogPromise) {
    catalogPromise = fetch('/data/jobs-runtime.json')
      .then(async (res) => {
        if (!res.ok) throw new Error(`jobs-runtime HTTP ${res.status}`);
        const catalog: unknown = await res.json();
        if (!Array.isArray(catalog) || catalog.some(job =>
          !job || typeof job !== 'object' || ['id', 'title', 'company', 'slug'].some(key => typeof job[key] !== 'string')
        )) throw new Error('Invalid jobs catalog');
        return catalog as Job[];
      })
      .catch((error) => {
        catalogPromise = null;
        throw error;
      });
  }
  return catalogPromise;
}

/** Paginated jobs from static build output (no Serverless Function on the host). */
export async function fetchJobsPage(options: {
  search?: string;
  limit: number;
  offset: number;
  signal?: AbortSignal;
}): Promise<JobsApiResponse> {
  if (options.signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const [allJobs, logoVariants] = await Promise.all([loadJobsCatalog(), loadLogoVariants()]);
  if (options.signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const page = paginatePublicJobs(allJobs, {
    search: options.search,
    limit: options.limit,
    offset: options.offset,
  });
  for (const logo of Object.values(page.companyLogos)) {
    const image = logo.logo ? logoVariants[logo.logo] : undefined;
    if (image && typeof image.src === 'string' && Number.isFinite(image.width) && Number.isFinite(image.height)) logo.imageVariants = image;
  }

  return {
    data: page.data,
    companyLogos: page.companyLogos,
    meta: { total: page.meta.total },
  };
}
