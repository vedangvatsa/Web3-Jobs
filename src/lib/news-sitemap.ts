import { escapeXml, publishedNewsArticles, type FeedArticle } from './news-rss';

export function buildNewsSitemap(articles: FeedArticle[], now = new Date()): string {
  const cutoff = now.getTime() - 48 * 60 * 60 * 1000;
  const news = publishedNewsArticles(articles, now)
    .filter(article => Date.parse(article.publishedDate!) >= cutoff);
  if (news.length > 1000) throw new Error('News sitemap exceeds 1,000 articles; split it before publishing.');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${news.map(article => `  <url>
    <loc>https://hashtagweb3.com/${encodeURIComponent(article.slug)}</loc>
    <news:news>
      <news:publication><news:name>Hashtag Web3</news:name><news:language>en</news:language></news:publication>
      <news:publication_date>${escapeXml(article.publishedDate!)}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>`;
}
