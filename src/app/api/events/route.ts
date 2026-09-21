import { getEvents } from '@/lib/events-server';
import { getEventSlug, getEventType, isEventUpcoming, normalizeCountry } from '@/lib/events';
import { getPublicEvent } from '@/lib/event-public';
import { NextRequest, NextResponse } from 'next/server';
import { getStandardApiHeaders } from '@/lib/api-headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const country = searchParams.get('country') || '';
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

    if (offsetRaw !== null) {
      offset = parseInt(offsetRaw, 10);
      if (isNaN(offset) || offset < 0) {
        return NextResponse.json(
          {
            error: {
              code: 'BAD_REQUEST',
              message: 'Invalid query parameter offset. It must be a non-negative integer.',
              hint: 'Provide a valid offset parameter such as ?offset=50. See docs at https://hashtagweb3.com/developers',
              docUrl: 'https://hashtagweb3.com/developers',
            },
          },
          { status: 400, headers: getStandardApiHeaders() }
        );
      }
    }

    const allEvents = await getEvents();

    let filtered = allEvents.filter((event) => isEventUpcoming(event));

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
      const c = normalizeCountry(country).toLowerCase();
      filtered = filtered.filter((e) => normalizeCountry(e.country || '').toLowerCase() === c);
    }

    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json(
      {
        // Public API links must stay on hashtagweb3.com: point url at our
        // event page and strip nested external urls (organizer/performer/
        // partnerOffer). The site itself keeps registration links via
        // getPublicEvent elsewhere — this mapping is API-only.
        data: paginated.map((event) => {
          const pub = getPublicEvent(event) as Record<string, any>;
          const { organizer, performer, partnerOffer, ...rest } = pub;
          const stripUrl = (p: any) => {
            if (!p || typeof p !== 'object') return p;
            const { url: _u, ...kept } = p;
            return kept;
          };
          return {
            ...rest,
            url: `https://hashtagweb3.com/${getEventSlug(event)}`,
            ...(organizer ? { organizer: stripUrl(organizer) } : {}),
            ...(performer ? { performer: stripUrl(performer) } : {}),
            ...(partnerOffer ? { partnerOffer: stripUrl(partnerOffer) } : {}),
          };
        }),
        meta: {
          total: filtered.length,
          count: paginated.length,
          offset,
        },
      },
      {
        status: 200,
        headers: {
          ...getStandardApiHeaders(),
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
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
