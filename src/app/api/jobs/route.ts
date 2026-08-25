import { getJobs } from '@/lib/jobs';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 300; // Cache on CDN for 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || searchParams.get('q') || '';
    const tag = searchParams.get('tag') || '';
    const company = searchParams.get('company') || '';
    const limitRaw = searchParams.get('limit');
    const offsetRaw = searchParams.get('offset');

    let limit = 50;
    let offset = 0;

    if (limitRaw !== null) {
      limit = parseInt(limitRaw, 10);
      if (isNaN(limit) || limit < 1 || limit > 200) {
        return NextResponse.json(
          {
            error: {
              code: 'BAD_REQUEST',
              message: "Invalid query parameter 'limit'. Must be an integer between 1 and 200.",
              hint: 'Provide a valid limit parameter such as ?limit=20. See docs at https://hashtagweb3.com/developers',
              docUrl: 'https://hashtagweb3.com/developers',
            },
          },
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    if (offsetRaw !== null) {
      offset = parseInt(offsetRaw, 10);
      if (isNaN(offset) || offset < 0) {
        return NextResponse.json(
          {
            error: {
              code: 'BAD_REQUEST',
              message: "Invalid query parameter 'offset'. Must be a non-negative integer.",
              hint: 'Provide a valid offset parameter such as ?offset=0. See docs at https://hashtagweb3.com/developers',
              docUrl: 'https://hashtagweb3.com/developers',
            },
          },
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    const allJobs = await getJobs();

    // Filter jobs
    let filtered = allJobs;

    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          ((j as any).tags || []).some((t: string) => t.toLowerCase().includes(q))
      );
    }

    if (tag) {
      const t = tag.toLowerCase().trim();
      filtered = filtered.filter((j) =>
        ((j as any).tags || []).some((tagItem: string) => tagItem.toLowerCase() === t || tagItem.toLowerCase().includes(t))
      );
    }

    if (company) {
      const c = company.toLowerCase().trim();
      filtered = filtered.filter((j) => j.company.toLowerCase().includes(c));
    }

    const cursor = searchParams.get('cursor');
    if (cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
        if (typeof decoded.offset === 'number') {
          offset = decoded.offset;
        }
      } catch (e) {}
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    const nextOffset = offset + limit < total ? offset + limit : null;
    const prevOffset = offset - limit >= 0 ? offset - limit : null;

    const nextCursor = nextOffset !== null ? Buffer.from(JSON.stringify({ offset: nextOffset })).toString('base64') : null;
    const prevCursor = prevOffset !== null ? Buffer.from(JSON.stringify({ offset: prevOffset })).toString('base64') : null;

    return NextResponse.json(
      {
        data: paginated,
        meta: {
          total,
          limit,
          offset,
          count: paginated.length,
          cursor: cursor || null,
          next_cursor: nextCursor,
          prev_cursor: prevCursor,
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
          'Vary': 'Accept-Encoding, Accept, User-Agent',
        },
      }
    );
  } catch (error) {
    console.error('API Error fetching jobs:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching Web3 jobs.',
          hint: 'Please retry your request. If the issue persists, contact support at contact@hashtagweb3.com',
          docUrl: 'https://hashtagweb3.com/developers',
        },
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    },
  });
}
