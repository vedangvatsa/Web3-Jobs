
'use server';

import Parser from 'rss-parser';
import type { NewsItem } from '@/types';

const FEEDS = [
 { url: 'https://decrypt.co/feed', source: 'Decrypt' },
 { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph' },
 { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'Coindesk' },
 { url: 'https://blockchain.news/RSS/', source: 'Blockchain.News' },
 { url: 'https://www.theblock.co/rss.xml', source: 'The Block' },
 { url: 'https://cryptoslate.com/feed/', source: 'CryptoSlate' }
];

const parser = new Parser();

// Helper to compute token overlap between titles
function getKeywords(text: string) {
 const stopWords = new Set(['this', 'that', 'with', 'from', 'what', 'where', 'when', 'crypto', 'web3', 'bitcoin', 'ethereum']);
 return new Set(
  text.toLowerCase()
   .replace(/[^a-z0-9]/g, ' ')
   .split(/\s+/)
   .filter(w => w.length > 3 && !stopWords.has(w))
 );
}

function isDuplicate(title1: string, title2: string) {
 const w1 = getKeywords(title1);
 const w2 = getKeywords(title2);
 if (w1.size === 0 || w2.size === 0) return false;
 
 let intersection = 0;
 for (const w of w1) {
  if (w2.has(w)) intersection++;
 }
 const union = w1.size + w2.size - intersection;
 const similarity = intersection / union;
 
 return similarity > 0.4; // 40% keyword overlap
}

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
        let creator = item.creator || item.author || feedInfo.source;
        if (typeof creator === 'string') {
         const regex = new RegExp(`^${feedInfo.source}\\s*(?:by|-|:)?\\s*`, 'i');
         creator = creator.replace(regex, '').trim();
         if (creator.toLowerCase().startsWith('by ')) {
          creator = creator.substring(3).trim();
         }
         if (!creator) creator = feedInfo.source;
        }

        items.push({
         title: item.title,
         link: item.link,
         pubDate: item.pubDate,
         creator: creator,
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

 // Deduplicate news items (keep the newest one if multiple sources report the same event)
 const uniqueItems: NewsItem[] = [];
 for (const item of allItems) {
  let isDup = false;
  // Compare against the recently added unique items (last 20 is usually enough)
  const recentUniques = uniqueItems.slice(-20);
  for (const unique of recentUniques) {
   if (isDuplicate(item.title, unique.title)) {
    isDup = true;
    break;
   }
  }
  if (!isDup) {
   uniqueItems.push(item);
  }
 }

 // Update cache
 newsCache = { timestamp: Date.now(), items: uniqueItems };

 return uniqueItems;
}
