import { NextResponse } from 'next/server';
import { resolveJobSlug } from '@/lib/job-guides';
import { renderJobCardPng } from '@/lib/og-card';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Content-Type': 'image/png',
  'Cache-Control': 'public, max-age=31536000, immutable, stale-while-revalidate=86400',
};

/** On-demand per-job share card: /og/jobs/{slug}.png (static precompute can't reach git-built hosts). */
export async function GET(_request: Request, { params }: { params: { file: string } }) {
  const slug = decodeURIComponent(params.file || '').replace(/\.png$/i, '');
  if (!slug) return new NextResponse('Not found', { status: 404 });
  const { job } = await resolveJobSlug(slug);
  if (!job) return new NextResponse('Not found', { status: 404 });
  try {
    const png = await renderJobCardPng(job.title, job.company);
    return new NextResponse(new Uint8Array(png), { status: 200, headers: CACHE_HEADERS });
  } catch {
    return new NextResponse('Render failed', { status: 500 });
  }
}
