
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

// Helper function to strip HTML and clean the company name
function cleanCompany(company: string | undefined): string | undefined {
    if (!company) return undefined;
    // Strip HTML tags and then take only the first line.
    return company.replace(/<[^>]*>?/gm, '').split('\n')[0].trim();
}

// Helper function to remove emojis from a string
function removeEmojis(text: string | undefined): string | undefined {
  if (!text) return undefined;
  // This regex removes most common emojis.
  return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
}

export async function getJobs(): Promise<Job[]> {
  const allJobs: Job[] = [];
  const seenJobs = new Set<string>();

  const feedPromises = FEEDS.map(async (feedUrl) => {
    try {
      const feed = await parser.parseURL(feedUrl);
      if (feed?.items) {
        feed.items.forEach((item) => {
          const title = removeEmojis(item.title?.trim());
          const company = cleanCompany(item.content);
          const link = item.link;

          if (title && company && link && title.split(' ').length <= 7) {
            const jobKey = `${title.toLowerCase()}|${company.toLowerCase()}`;
            
            if (!seenJobs.has(jobKey)) {
              seenJobs.add(jobKey);
              allJobs.push({
                id: item.guid || link,
                title,
                company,
                link,
                date: item.isoDate || new Date().toISOString(),
                source: feed.title || feedUrl,
              });
            }
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
