
'use server';

import Parser from 'rss-parser';
import type { Job } from '@/types';
import fs from 'fs';
import path from 'path';

const FEEDS = [
  'https://politepol.com/fd/JEeZwG4KK7uT.xml', // Dragonfly
  'https://politepol.com/fd/sDzglCq7RCpG.xml', // Paradigm
  'https://politepol.com/fd/bs9i34afSjHS.xml', // Arbitrum
  'https://politepol.com/fd/oiXKHETnrDap.xml', // a16z
  'https://politepol.com/fd/Ane01VX84MOk.xml', // Pantera
  'https://politepol.com/fd/HI6pMDlyEO7j.xml'  // Avalanche
];

const jobsCachePath = path.join(process.cwd(), 'content', 'jobs.json');

const parser = new Parser();

// Helper to clean company names
function cleanCompany(company: string | undefined): string | undefined {
    if (!company) return undefined;
    return company.replace(/<[^>]*>?/gm, '').split('\n')[0].trim();
}

// Helper to remove emojis
function removeEmojis(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
}

// Helper to read jobs from cache
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

// Helper to write jobs to cache
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

          if (link && title && company && title.split(' ').length <= 8 && !title.toLowerCase().includes('bounty')) {
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

  const jobMap = new Map<string, Job>();
  combinedJobs.forEach(job => {
      const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
      const key = `${normalize(job.title)}-${normalize(job.company)}`;
      const existingJob = jobMap.get(key);

      if (!existingJob || new Date(job.date) > new Date(existingJob.date)) {
          jobMap.set(key, job);
      }
  });
  
  let uniqueJobs = Array.from(jobMap.values());

  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
  uniqueJobs = uniqueJobs.filter(job => new Date(job.date) >= threeWeeksAgo);

  uniqueJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  writeJobsToCache(uniqueJobs);

  return uniqueJobs;
}
