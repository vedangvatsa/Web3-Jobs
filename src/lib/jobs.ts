
'use server';

import Parser from 'rss-parser';
import type { Job } from '@/types';
import fs from 'fs';
import path from 'path';

const FEEDS = [
  'https://politepol.com/fd/JEeZwG4KK7uT.xml',
  'https://politepol.com/fd/sDzglCq7RCpG.xml',
  'https://politepol.com/fd/bs9i34afSjHS.xml',
  'https://politepol.com/fd/oiXKHETnrDap.xml', // a16z
  'https://politepol.com/fd/Ane01VX84MOk.xml', // Pantera
];

const jobsCachePath = path.join(process.cwd(), 'content', 'jobs.json');

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

// Reads jobs from the JSON cache file
function readJobsFromCache(): Job[] {
    if (!fs.existsSync(jobsCachePath)) {
        return [];
    }
    try {
        const fileContents = fs.readFileSync(jobsCachePath, 'utf-8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error('Error reading jobs cache:', error);
        return [];
    }
}

// Writes jobs to the JSON cache file
function writeJobsToCache(jobs: Job[]) {
    try {
        const directory = path.dirname(jobsCachePath);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
        fs.writeFileSync(jobsCachePath, JSON.stringify(jobs, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing to jobs cache:', error);
    }
}


export async function getJobs(): Promise<Job[]> {
  const cachedJobs = readJobsFromCache();

  const allJobsPromises = FEEDS.map(async (feedUrl) => {
    try {
      const feed = await parser.parseURL(feedUrl);
      if (feed?.items) {
        return feed.items.map((item) => {
          const title = removeEmojis(item.title?.trim());
          const company = cleanCompany(item.content);
          const link = item.link;

          if (link && title && company && title.split(' ').length <= 7 && !title.toLowerCase().includes('bounty')) {
            return {
              id: item.guid || link,
              title,
              company,
              link,
              date: item.isoDate || new Date().toISOString(),
              source: feed.title || feedUrl,
            };
          }
          return null;
        }).filter((job): job is Job => job !== null);
      }
      return [];
    } catch (error) {
      console.warn(`Could not fetch or parse feed: ${feedUrl}`, error);
      return [];
    }
  });

  const newJobsNested = await Promise.all(allJobsPromises);
  const newJobs = newJobsNested.flat();

  const combinedJobs = [...cachedJobs, ...newJobs];

  // Deduplicate jobs based on the job link, keeping the most recent.
  const jobMap = new Map<string, Job>();
  combinedJobs.forEach(job => {
    const existingJob = jobMap.get(job.link);
    if (!existingJob || new Date(job.date) > new Date(existingJob.date)) {
        jobMap.set(job.link, job);
    }
  });
  
  let uniqueJobs = Array.from(jobMap.values());

  // Filter out jobs older than 3 weeks (21 days)
  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
  uniqueJobs = uniqueJobs.filter(job => new Date(job.date) >= threeWeeksAgo);

  // Final sort by date descending (newest first)
  uniqueJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Write back to cache
  writeJobsToCache(uniqueJobs);

  return uniqueJobs;
}
