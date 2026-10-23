import type { Article } from '@/types';

export type FeedArticle = Omit<Article, 'content' | 'rawContent'>;
const SITE_URL = 'https://hashtagweb3.com';

export function escapeXml(value: string): string {
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function publishedNewsArticles(articles: FeedArticle[], now = new Date()): FeedArticle[] {
  return articles.filter(article => {
    const published = Date.parse(article.publishedDate || '');
    return article.category === 'News' && Number.isFinite(published) && published <= now.getTime();
  }).sort((a, b) => Date.parse(b.publishedDate!) - Date.parse(a.publishedDate!));
}

export function buildNewsRss(articles: FeedArticle[], now = new Date()): string {
  const news = publishedNewsArticles(articles, now).slice(0, 100);
  const items = news.map(article => {
    const url = `${SITE_URL}/${encodeURIComponent(article.slug)}`;
    const image = new URL(article.image || '/og-news.png', SITE_URL);
    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(article.publishedDate!).toUTCString()}</pubDate>
      <description>${escapeXml(article.description)}</description>
      <dc:creator>Hashtag Web3</dc:creator>
      <category>News</category>
      ${['https:', 'http:'].includes(image.protocol) ? `<media:content url="${escapeXml(image.href)}" medium="image"/>` : ''}
    </item>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Hashtag Web3 News</title>
    <link>${SITE_URL}/news</link>
    <description>Original crypto and Web3 news from Hashtag Web3.</description>
    <language>en-us</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/news/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}
