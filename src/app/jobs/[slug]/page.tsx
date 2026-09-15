import { permanentRedirect, notFound } from 'next/navigation';
import { getJobBySlug } from '@/lib/job-guides';
import { getJobPublicPath } from '@/lib/job-slugs';

interface LegacyJobPageProps {
  params: {
    slug: string;
  };
}

/** Legacy `/jobs/:slug` → canonical `/:shortSlug` only (no job pages under `/jobs/`). */
export default async function LegacyJobPage({ params }: LegacyJobPageProps) {
  const job = await getJobBySlug(params.slug);
  if (!job) {
    notFound();
  }
  permanentRedirect(getJobPublicPath(job));
}
