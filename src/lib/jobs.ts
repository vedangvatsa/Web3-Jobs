
'use server';

import Parser from 'rss-parser';
import type { Job } from '@/types';

// The jobs you manually added are now stored here permanently.
const MANUAL_JOBS: Job[] = [
    {
      "id": "1",
      "title": "Senior Smart Contract Engineer",
      "company": "Nexus Protocol",
      "link": "https://jobs.hashtagweb3.com/jobs/nexus-protocol-senior-smart-contract-engineer",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "2",
      "title": "Lead Frontend Developer (DeFi)",
      "company": "Statera",
      "link": "https://jobs.hashtagweb3.com/jobs/statera-lead-frontend-developer-defi",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "3",
      "title": "Community Manager (APAC)",
      "company": "Aura Network",
      "link": "https://jobs.hashtagweb3.com/jobs/aura-network-community-manager-apac",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "4",
      "title": "Head of Engineering",
      "company": "EigenLayer",
      "link": "https://jobs.hashtagweb3.com/jobs/eigenlayer-head-of-engineering",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "5",
      "title": "Quantitative Researcher",
      "company": "Wintermute",
      "link": "https://jobs.hashtagweb3.com/jobs/wintermute-quantitative-researcher",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "6",
      "title": "Senior Rust Engineer (L1)",
      "company": "Celestia",
      "link": "https://jobs.hashtagweb3.com/jobs/celestia-senior-rust-engineer-l1",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "7",
      "title": "Product Marketing Manager",
      "company": "Chainlink Labs",
      "link": "https://jobs.hashtagweb3.com/jobs/chainlink-labs-product-marketing-manager",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "8",
      "title": "DevOps Engineer",
      "company": "Scroll",
      "link": "https://jobs.hashtagweb3.com/jobs/scroll-devops-engineer",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "9",
      "title": "Senior Data Analyst (On-Chain)",
      "company": "Dune Analytics",
      "link": "https://jobs.hashtagweb3.com/jobs/dune-analytics-senior-data-analyst-on-chain",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "10",
      "title": "Lead UX/UI Designer",
      "company": "Phantom Wallet",
      "link": "https://jobs.hashtagweb3.com/jobs/phantom-wallet-lead-uxui-designer",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "11",
      "title": "Technical Writer",
      "company": "Ethereum Foundation",
      "link": "https://jobs.hashtagweb3.com/jobs/ethereum-foundation-technical-writer",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "12",
      "title": "Head of Talent",
      "company": "a16z Crypto",
      "link": "https://jobs.hashtagweb3.com/jobs/a16z-crypto-head-of-talent",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    }
];

const FEEDS = [
  'https://politepol.com/fd/JEeZwG4KK7uT.xml', // Dragonfly
  'https://politepol.com/fd/sDzglCq7RCpG.xml', // Paradigm
  'https://politepol.com/fd/bs9i34afSjHS.xml', // Arbitrum
  'https://politepol.com/fd/oiXKHETnrDap.xml', // a16z
  'https://politepol.com/fd/Ane01VX84MOk.xml', // Pantera
  'https://politepol.com/fd/HI6pMDlyEO7j.xml'  // Avalanche
];

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


export async function getJobs(): Promise<Job[]> {
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
  const fetchedJobs = newJobsNested.flat();
  
  // Combine manually added jobs with fetched jobs
  const allJobs = [...MANUAL_JOBS, ...fetchedJobs];

  const jobMap = new Map<string, Job>();
  allJobs.forEach(job => {
      const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
      const key = `${normalize(job.title)}-${normalize(job.company)}`;
      const existingJob = jobMap.get(key);

      if (!existingJob || new Date(job.date) > new Date(existingJob.date)) {
          jobMap.set(key, job);
      }
  });
  
  let uniqueJobs = Array.from(jobMap.values());

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  uniqueJobs = uniqueJobs.filter(job => new Date(job.date) >= ninetyDaysAgo);

  uniqueJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return uniqueJobs;
}
