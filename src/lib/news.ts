
'use server';

import Parser from 'rss-parser';
import type { NewsItem } from '@/types';

const FEEDS = [
 { url: 'https://decrypt.co/feed', source: 'Decrypt' },
 { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph' },
 { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'Coindesk' },
 { url: 'https://blockchain.news/RSS/', source: 'Blockchain.News' }
];

const parser = new Parser();

// In-memory cache for news feeds
let newsCache: { timestamp: number; items: NewsItem[] } | null = null;
const NEWS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function getNewsFeed(): Promise<NewsItem[]> {
 // Return cached results if fresh
 const now = Date.now();
 if (newsCache && (now - newsCache.timestamp < NEWS_CACHE_TTL_MS)) {
  return newsCache.items;
 }

 const allItems: NewsItem[] = [];

 const feedResults = await Promise.all(
  FEEDS.map(async (feedInfo) => {
   try {
    const feed = await parser.parseURL(feedInfo.url);
    const items: NewsItem[] = [];
    if (feed?.items) {
     feed.items.forEach((item) => {
      if (item.title && item.link && item.pubDate && item.contentSnippet) {
       const snippet = item.contentSnippet.trim();
       // Avoid double-ellipsis when snippet already ends with one
       const truncated = snippet.length > 150
        ? snippet.substring(0, 150).replace(/\.{1,3}$/, '') + '...'
        : snippet;
       items.push({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        creator: item.creator || item.author || feedInfo.source,
        contentSnippet: truncated,
        source: feedInfo.source,
       });
      }
     });
    }
    return items;
   } catch (error) {
    console.warn(`Could not fetch or parse news feed: ${feedInfo.url}`, error);
    return [];
   }
  })
 );

 // Flatten results (no shared mutable array)
 for (const items of feedResults) {
  allItems.push(...items);
 }

 // Sort all items by publication date, descending
 allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

 // Update cache
 newsCache = { timestamp: Date.now(), items: allItems };

 return allItems;
}
