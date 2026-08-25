import { redirect, notFound } from 'next/navigation';
import { getJobBySlug, getJobSlug } from '@/lib/job-guides';

interface JobPageProps {
  params: {
    slug: string;
  };
}

export default async function LegacyJobRedirectPage({ params }: JobPageProps) {
  const job = await getJobBySlug(params.slug);
  if (!job) {
    notFound();
  }

  const slug = getJobSlug(job);
  redirect(`/${slug}`);
}
