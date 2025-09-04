
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

export async function getNewsFeed(): Promise<NewsItem[]> {
  const allItems: NewsItem[] = [];

  const feedPromises = FEEDS.map(async (feedInfo) => {
    try {
      const feed = await parser.parseURL(feedInfo.url);
      if (feed?.items) {
        feed.items.forEach((item) => {
          // Make creator optional to handle feeds that don't provide it.
          if (item.title && item.link && item.pubDate && item.contentSnippet) {
            allItems.push({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              creator: item.creator || item.author || feedInfo.source, // Fallback to author or source name
              contentSnippet: item.contentSnippet.substring(0, 150) + '...',
              source: feedInfo.source,
            });
          }
        });
      }
    } catch (error) {
      console.warn(`Could not fetch or parse news feed: ${feedInfo.url}`, error);
    }
  });

  await Promise.all(feedPromises);

  // Sort all items by publication date, descending
  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return allItems;
}
