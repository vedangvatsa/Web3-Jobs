import { NextRequest, NextResponse } from 'next/server';
import { getStandardApiHeaders } from '@/lib/api-headers';
import { getAllArticles } from '@/lib/articles';

export const revalidate = 300; // Cache on CDN for 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || searchParams.get('q') || '';
    const limitRaw = searchParams.get('limit');

    let limit = 30;

    if (limitRaw !== null) {
      limit = parseInt(limitRaw, 10);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        return NextResponse.json(
          {
            error: {
              code: 'BAD_REQUEST',
              message: "Invalid query parameter 'limit'. Must be an integer between 1 and 100.",
              hint: 'Provide a valid limit parameter such as ?limit=15. See docs at https://hashtagweb3.com/developers',
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

    // Public API carries only our own reporting with absolute
    // hashtagweb3.com links. Third-party RSS items have no page on our
    // site, so they are excluded rather than leaking outlet URLs.
    // (Same native mapping as the /news page.)
    const siteUrl = 'https://hashtagweb3.com';
    const articles = await getAllArticles();
    const native = articles
      .filter((article) => article.category === 'News')
      .map((article) => ({
        title: article.title,
        link: `${siteUrl}/${article.slug}`,
        pubDate: article.publishedDate
          ? new Date(article.publishedDate).toISOString()
          : new Date().toISOString(),
        creator: 'Hashtag Web3',
        contentSnippet: article.description,
        source: 'Hashtag Web3',
      }))
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    let filtered = native;
    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.source.toLowerCase().includes(q) ||
          (n.contentSnippet || '').toLowerCase().includes(q)
      );
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
          'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
          'Vary': 'Accept-Encoding, Accept',
        },
      }
    );
  } catch (error) {
    console.error('API Error fetching news:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching Web3 news.',
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
