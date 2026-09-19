import { NextResponse } from 'next/server';
import { getAllJobsWithSlugs, getJobBySlug, getLegacyJobSlugs } from '@/lib/job-guides';
import { getJobs } from '@/lib/jobs';
import { getJobPublicPath } from '@/lib/job-slugs';

/**
 * Legacy `/jobs/:slug` (and `/jobs/:id`, see getPublicJobUrl) → canonical
 * `/:shortSlug`. Explicit Response redirect: a page-component redirect throw
 * can lose its status once jobs/loading.tsx streams the shell, but a route
 * handler always answers with the exact status. Cheaper on Workers too —
 * no RSC tree is rendered for a pure redirect.
 */
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  if (process.env.IS_DOCKER_BUILD === '1') {
    return [];
  }
  const [jobsWithSlugs, allJobs] = await Promise.all([getAllJobsWithSlugs(), getJobs()]);
  const slugs = new Set<string>();
  for (const { slug } of jobsWithSlugs) {
    if (slug) slugs.add(slug);
  }
  for (const job of allJobs) {
    if (job.id) slugs.add(job.id);
  }
  for (const legacy of getLegacyJobSlugs()) {
    slugs.add(legacy);
  }
  return [...slugs].map((slug) => ({ slug }));
}

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const job = await getJobBySlug(params.slug);
  if (!job) {
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: 'Job not found. It may have expired or the link is outdated.',
          hint: 'Browse open roles at https://hashtagweb3.com/jobs.',
          docUrl: 'https://hashtagweb3.com/developers',
        },
      },
      { status: 404 },
    );
  }
  return NextResponse.redirect(new URL(getJobPublicPath(job), request.url), 308);
}
