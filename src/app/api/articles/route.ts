import { getAllArticles } from '@/lib/articles';
import { getStandardApiHeaders } from '@/lib/api-headers';
import { NextRequest, NextResponse } from 'next/server';

const MAX_LIMIT = 1000;

function getPagination(searchParams: URLSearchParams) {
  const limit = Number.parseInt(searchParams.get('limit') || '24', 10);
  const offset = Number.parseInt(searchParams.get('offset') || '0', 10);

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT || !Number.isInteger(offset) || offset < 0) {
    return null;
  }

  return { limit, offset };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pagination = getPagination(searchParams);

  if (!pagination) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: `limit must be between 1 and ${MAX_LIMIT}, and offset must be non-negative.` } },
      { status: 400, headers: getStandardApiHeaders() },
    );
  }

  const search = searchParams.get('search')?.trim().toLowerCase() || '';
  const category = searchParams.get('category')?.trim() || '';
  const articles = await getAllArticles();
  const filtered = articles.filter((article) => {
    if (category && article.category !== category) return false;
    if (!search) return true;
    return article.title.toLowerCase().includes(search)
      || article.description.toLowerCase().includes(search)
      || article.category.toLowerCase().includes(search);
  });

  const data = filtered.slice(pagination.offset, pagination.offset + pagination.limit);
  return NextResponse.json(
    { data, meta: { total: filtered.length, count: data.length, offset: pagination.offset } },
    {
      headers: {
        ...getStandardApiHeaders(),
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
      },
    },
  );
}
