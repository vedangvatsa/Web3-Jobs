import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { jobAgePageCache } from '@/lib/job-age-page-cache';
import Home, { metadata as homeMetadata } from '@/app/page';
import Jobs, { metadata as jobsMetadata } from '@/app/jobs/page';
import Companies, { metadata as companiesMetadata } from '@/app/companies/page';
import Community, { metadata as communityMetadata } from '@/app/community/page';
import Detail, { generateMetadata as detailMetadata } from '@/app/[slug]/page';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 3600;
export function generateStaticParams() { return []; }

type Props = { params: Promise<{ epoch: string; path?: string[] }> };

async function scopeFor({ params }: Props) {
  const { epoch, path = [] } = await params;
  const scope = `/${path.join('/')}`;
  if (jobAgePageCache(scope)?.key !== epoch) notFound();
  return { scope, slug: path[0] };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { scope, slug } = await scopeFor(props);
  if (scope === '/') return homeMetadata;
  if (scope === '/jobs') return jobsMetadata;
  if (scope === '/companies') return companiesMetadata;
  if (scope === '/community') return communityMetadata;
  return detailMetadata({ params: Promise.resolve({ slug }) });
}

export default async function JobListingCachePage(props: Props) {
  const { scope, slug } = await scopeFor(props);
  if (scope === '/') return Home();
  if (scope === '/jobs') return Jobs();
  if (scope === '/companies') return Companies();
  if (scope === '/community') return Community();
  return Detail({ params: Promise.resolve({ slug }) });
}
