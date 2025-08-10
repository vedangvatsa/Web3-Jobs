import Parser from 'rss-parser';
import type { Job } from '@/types';

const FEEDS = [
  'https://politepol.com/fd/JEeZwG4KK7uT.xml',
  'https://politepol.com/fd/HI6pMDlyEO7j.xml',
  'https://politepol.com/fd/sDzglCq7RCpG.xml',
  'https://politepol.com/fd/bs9i34afSjHS.xml',
  'https://politepol.com/fd/oiXKHETnrDap.xml',
  'https://politepol.com/fd/Ane01VX84MOk.xml',
];

const parser = new Parser();

export async function getJobs(): Promise<Job[]> {
  const allJobs: Job[] = [];
  const seenIds = new Set<string>();

  const feedPromises = FEEDS.map(async (feedUrl) => {
    try {
      const feed = await parser.parseURL(feedUrl);
      if (feed?.items) {
        feed.items.forEach((item) => {
          const id = item.guid || item.link;

          // Per instructions: title is job title, description is company
          // In rss-parser, item.content is the description.
          const title = item.title?.trim();
          const company = item.content?.trim();
          
          if (id && !seenIds.has(id) && title && company && item.link && title.split(' ').length <= 7) {
            seenIds.add(id);
            allJobs.push({
              id,
              title,
              company,
              link: item.link,
              date: item.isoDate || new Date().toISOString(),
              source: feed.title || feedUrl,
            });
          }
        });
      }
    } catch (error) {
      console.warn(`Could not fetch or parse feed: ${feedUrl}`, error);
      // Continue to next feed if one fails
    }
  });

  await Promise.all(feedPromises);

  // Sort by date descending (newest first)
  allJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return allJobs;
}
