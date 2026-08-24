import { getAllTerms } from '@/lib/glossary';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 86400; // Cache on CDN for 24 hours

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const limitRaw = searchParams.get('limit');

    let limit = 50;

    if (limitRaw !== null) {
      limit = parseInt(limitRaw, 10);
      if (isNaN(limit) || limit < 1 || limit > 250) {
        return NextResponse.json(
          {
            error: {
              code: 'BAD_REQUEST',
              message: "Invalid query parameter 'limit'. Must be an integer between 1 and 250.",
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

    const allTerms = await getAllTerms();

    let filtered = allTerms;

    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.synonyms || []).some((s) => s.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q)
      );
    }

    if (category) {
      const c = category.toLowerCase().trim();
      filtered = filtered.filter((t) => t.category.toLowerCase() === c);
    }

    const paginated = filtered.slice(0, limit);

    return NextResponse.json(
      {
        data: paginated.map((t) => ({
          slug: t.slug,
          term: t.term,
          category: t.category,
          definition: t.description,
          synonyms: t.synonyms || [],
          url: `https://hashtagweb3.com/${t.slug}`,
        })),
        meta: {
          total: filtered.length,
          count: paginated.length,
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          'Vary': 'Accept-Encoding, Accept',
        },
      }
    );
  } catch (error) {
    console.error('API Error fetching glossary terms:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching glossary terms.',
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
