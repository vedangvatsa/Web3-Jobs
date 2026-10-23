import { getAllArticles } from '@/lib/articles';
import { buildNewsRss } from '@/lib/news-rss';

export const revalidate = 300;

export async function GET() {
  return new Response(buildNewsRss(await getAllArticles()), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
    },
  });
}
