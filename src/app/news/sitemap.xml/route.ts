import { getAllArticles } from '@/lib/articles';
import { buildNewsSitemap } from '@/lib/news-sitemap';

export const revalidate = 300;

export async function GET() {
  return new Response(buildNewsSitemap(await getAllArticles()), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=300',
    },
  });
}
