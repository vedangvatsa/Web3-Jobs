import { getEvents } from '@/lib/events-server';
import { getEventType } from '@/lib/events';
import { NextRequest, NextResponse } from 'next/server';
import { getStandardApiHeaders } from '@/lib/api-headers';

export const revalidate = 3600; // Cache on CDN for 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const country = searchParams.get('country') || '';
    const limitRaw = searchParams.get('limit');

    let limit = 50;

    if (limitRaw !== null) {
      limit = parseInt(limitRaw, 10);
      if (isNaN(limit) || limit < 1 || limit > 200) {
        return NextResponse.json(
          {
            error: {
              code: 'BAD_REQUEST',
              message: "Invalid query parameter 'limit'. Must be an integer between 1 and 200.",
              hint: 'Provide a valid limit parameter such as ?limit=25. See docs at https://hashtagweb3.com/developers',
              docUrl: 'https://hashtagweb3.com/developers',
            },
          },
          {
            status: 400,
            headers: getStandardApiHeaders(),
          }
        );
      }
    }

    const allEvents = await getEvents();

    let filtered = allEvents;

    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q) ||
          (e.city || '').toLowerCase().includes(q) ||
          (e.country || '').toLowerCase().includes(q) ||
          (e.location || '').toLowerCase().includes(q)
      );
    }

    if (type) {
      const t = type.toLowerCase().trim();
      filtered = filtered.filter((e) => getEventType(e).toLowerCase() === t);
    }

    if (country) {
      const c = country.toLowerCase().trim();
      filtered = filtered.filter((e) => (e.country || '').toLowerCase().includes(c));
    }

    const paginated = filtered.slice(0, limit);

    return NextResponse.json(
      {
        data: paginated,
        meta: {
          total: filtered.length,
          count: paginated.length,
        },
      },
      {
        status: 200,
        headers: {
          ...getStandardApiHeaders(),
          'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
          'Vary': 'Accept-Encoding, Accept',
        },
      }
    );
  } catch (error) {
    console.error('API Error fetching events:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching Web3 events.',
          hint: 'Please retry your request. If the issue persists, contact support at contact@hashtagweb3.com',
          docUrl: 'https://hashtagweb3.com/developers',
        },
      },
      {
        status: 500,
        headers: getStandardApiHeaders(),
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, MCP-Protocol-Version',
      'Access-Control-Expose-Headers': 'RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, RateLimit-Policy, Retry-After, API-Version, Deprecation, Sunset',
    },
  });
}
