import { NextResponse } from 'next/server';
import { legacyJobRedirectTarget, resolveJobForLegacyRedirect } from '@/lib/job-legacy-redirect';

/**
 * Legacy `/jobs/:slug` (and `/jobs/:id`, see getPublicJobUrl) → canonical
 * `/:shortSlug`. Uses shard lookup + jobs-runtime only (no job-guides/cheerio).
 */
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;
export const runtime = 'nodejs';

const RESERVED = new Set([
  'feed.xml',
  'feed.json',
  'jora.xml',
  'adzuna.xml',
  'feed-aggregator-us.xml',
]);

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return [];
}

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const segment = params.slug?.trim();
  if (!segment || RESERVED.has(segment.toLowerCase())) {
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: 'Not found.',
          docUrl: 'https://hashtagweb3.com/developers',
        },
      },
      { status: 404 },
    );
  }

  try {
    const job = await resolveJobForLegacyRedirect(segment);
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
    const target = new URL(legacyJobRedirectTarget(job), request.url);
    return NextResponse.redirect(target, 308);
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
