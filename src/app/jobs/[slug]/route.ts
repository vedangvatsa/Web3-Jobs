import { NextResponse } from 'next/server';
import { getJobBySlug } from '@/lib/job-guides';
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
export const runtime = 'nodejs';

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return [];
}

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
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
  } catch (error) {
    console.error('[jobs/[slug]] redirect failed:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Could not resolve this job link.',
          hint: 'Try the canonical URL at https://hashtagweb3.com/jobs or search by company.',
          docUrl: 'https://hashtagweb3.com/developers',
        },
      },
      { status: 500 },
    );
  }
}
