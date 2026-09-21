import { NextResponse } from 'next/server';
import { getCompanyBySlug } from '@/lib/companies';
import { renderJobCardPng } from '@/lib/og-card';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Content-Type': 'image/png',
  'Cache-Control': 'public, max-age=31536000, immutable, stale-while-revalidate=86400',
};

/** On-demand per-company share card: /og/companies/{slug}.png. */
export async function GET(_request: Request, { params }: { params: { file: string } }) {
  const slug = decodeURIComponent(params.file || '').replace(/\.png$/i, '');
  if (!slug) return new NextResponse('Not found', { status: 404 });
  const company = await getCompanyBySlug(slug);
  if (!company) return new NextResponse('Not found', { status: 404 });
  const subtitle =
    typeof company.jobCount === 'number' && company.jobCount > 0
      ? `${company.jobCount} open role${company.jobCount === 1 ? '' : 's'}`
      : 'Web3 careers';
  try {
    const png = await renderJobCardPng(subtitle, company.name);
    return new NextResponse(new Uint8Array(png), { status: 200, headers: CACHE_HEADERS });
  } catch {
    return new NextResponse('Render failed', { status: 500 });
  }
}
