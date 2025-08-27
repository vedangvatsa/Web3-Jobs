
'use server';

import Parser from 'rss-parser';
import type { Job } from '@/types';

// The jobs you manually added are now stored here permanently.
const MANUAL_JOBS: Job[] = [
    {
        "id": "https://job-boards.greenhouse.io/alchemy/jobs/4599359005",
        "title": "Site Reliability Engineer",
        "company": "Alchemy",
        "link": "https://job-boards.greenhouse.io/alchemy/jobs/4599359005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5628728004",
        "title": "Partner Marketer",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5628728004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/2b9a141e-0669-4197-aa52-2b07d9fadc96?lever-source%5B%5D=jobs.a16z.com",
        "title": "Software Engineer - Platform",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/2b9a141e-0669-4197-aa52-2b07d9fadc96?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7182039",
        "title": "Senior Mobile Engineer (Android)",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7182039",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/eigen-labs/4e018bca-ec96-43f7-a3f6-b784bbd19a7f?utm_source=jobs.a16z.com",
        "title": "Staff Software Engineer, Fullstack",
        "company": "EigenLayer",
        "link": "https://jobs.ashbyhq.com/eigen-labs/4e018bca-ec96-43f7-a3f6-b784bbd19a7f?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6688696003",
        "title": "Senior Analytics Engineer II",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6688696003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/mystenlabs/7faf0127-1e2d-4a2e-808c-24868daa9a3a?utm_source=jobs.a16z.com",
        "title": "Senior Communications Manager, Walrus",
        "company": "Mysten Labs",
        "link": "https://jobs.ashbyhq.com/mystenlabs/7faf0127-1e2d-4a2e-808c-24868daa9a3a?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/9006a802-8d9c-43a3-b566-dca55ce73819?lever-source%5B%5D=jobs.a16z.com",
        "title": "Senior Revenue Accountant",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/9006a802-8d9c-43a3-b566-dca55ce73819?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/spade/jobs/4598919005",
        "title": "Head of Engineering",
        "company": "Spade",
        "link": "https://job-boards.greenhouse.io/spade/jobs/4598919005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7185423",
        "title": "Advertising Operations Associate",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7185423",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/7e02daad-59d2-49f3-afa3-b9b568e4edc5?utm_source=jobs.a16z.com",
        "title": "Payroll Associate, Africa Payroll | India",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/7e02daad-59d2-49f3-afa3-b9b568e4edc5?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/285cbc02-bf6c-4f9e-903c-85fb5a9e9c10?utm_source=jobs.a16z.com",
        "title": "Senior Manager of Accounting Operations",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/285cbc02-bf6c-4f9e-903c-85fb5a9e9c10?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/method/de13a369-ccb9-4b03-9a28-a8e551ee3949?utm_source=jobs.a16z.com",
        "title": "Senior Software Engineer",
        "company": "Method",
        "link": "https://jobs.ashbyhq.com/method/de13a369-ccb9-4b03-9a28-a8e551ee3949?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/lightspark/e207e505-6b0c-4f1f-ae97-6e75dbd9fbeb?utm_source=jobs.a16z.com",
        "title": "Senior Staff Engineer, Spark",
        "company": "Lightspark",
        "link": "https://jobs.ashbyhq.com/lightspark/e207e505-6b0c-4f1f-ae97-6e75dbd9fbeb?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/bd688703-36be-4d64-aea7-c2c83c8fe3f3?lever-source%5B%5D=jobs.a16z.com",
        "title": "Member of Compliance, Singapore",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/bd688703-36be-4d64-aea7-c2c83c8fe3f3?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4589818006",
        "title": "Director, Product Management (Consumer)",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4589818006",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Solana%20Foundation/32de1a78-2e7d-469d-b846-c61152324365?utm_source=jobs.a16z.com",
        "title": "Growth Lead- Japan",
        "company": "Solana Foundation",
        "link": "https://jobs.ashbyhq.com/Solana%20Foundation/32de1a78-2e7d-469d-b846-c61152324365?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Sui%20Foundation/833f7999-f042-43d3-b2b4-e8064bee8cd7?utm_source=jobs.a16z.com",
        "title": "Partner Marketing Coordinator - Walrus (Contract)",
        "company": "Sui Foundation",
        "link": "https://jobs.ashbyhq.com/Sui%20Foundation/833f7999-f042-43d3-b2b4-e8064bee8cd7?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/oplabs/e62916c2-71d8-4c04-a3a5-1331700e4e46?utm_source=jobs.a16z.com",
        "title": "Enterprise Sales Lead, Payments",
        "company": "OP Labs",
        "link": "https://jobs.ashbyhq.com/oplabs/e62916c2-71d8-4c04-a3a5-1331700e4e46?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/walrus/21e0f179-40c8-4d6a-b241-97cbcdb5e3d6?utm_source=jobs.a16z.com",
        "title": "Chief of Staff",
        "company": "Walrus Foundation",
        "link": "https://jobs.ashbyhq.com/walrus/21e0f179-40c8-4d6a-b241-97cbcdb5e3d6?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/0e9c8c3f-ae73-43e7-b882-1a42af518973?utm_source=jobs.a16z.com",
        "title": "Strategic Account Executive, Financial Services",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/0e9c8c3f-ae73-43e7-b882-1a42af518973?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/cruxclimate/4386e2ac-bcb7-496c-9108-502ce29dabd8?utm_source=jobs.a16z.com",
        "title": "Events & Community Lead",
        "company": "Crux",
        "link": "https://jobs.ashbyhq.com/cruxclimate/4386e2ac-bcb7-496c-9108-502ce29dabd8?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/eaa0267b-d44c-4168-8977-8a0ec585b599?lever-source%5B%5D=jobs.a16z.com",
        "title": "Key Account Manager (Qatar)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/eaa0267b-d44c-4168-8977-8a0ec585b599?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6688184003",
        "title": "Workday LMS Consultant",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6688184003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Runway/c17a5f0b-ce37-4544-9107-cea79ac39d44?utm_source=jobs.a16z.com",
        "title": "FP&A Experience Manager",
        "company": "Runway",
        "link": "https://jobs.ashbyhq.com/Runway/c17a5f0b-ce37-4544-9107-cea79ac39d44?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/skymavis/d767361b-4d3b-47ee-b16b-31011195b93c?utm_source=jobs.a16z.com",
        "title": "Lead Product Designer",
        "company": "Sky Mavis",
        "link": "https://jobs.ashbyhq.com/skymavis/d767361b-4d3b-47ee-b16b-31011195b93c?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://branchinternational.applytojob.com/apply/E5RGe7p13E/Software-Engineer-DevOps-Security",
        "title": "Software Engineer - DevOps Security",
        "company": "Branch International",
        "link": "https://branchinternational.applytojob.com/apply/E5RGe7p13E/Software-Engineer-DevOps-Security",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/withclutch/0c3c4ec5-8dea-4d36-a560-9024e3961389?utm_source=jobs.a16z.com",
        "title": "Engagement Manager",
        "company": "Clutch",
        "link": "https://jobs.ashbyhq.com/withclutch/0c3c4ec5-8dea-4d36-a560-9024e3961389?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/phantom/b7d0a7f7-c1d0-43c3-936f-c97ff46ee72e?utm_source=jobs.a16z.com",
        "title": "Backend Engineer, Blockchain Data Team",
        "company": "Phantom",
        "link": "https://jobs.ashbyhq.com/phantom/b7d0a7f7-c1d0-43c3-936f-c97ff46ee72e?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
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

// Helper to remove emojis and other non-standard characters from job titles
function cleanTitle(text: string | undefined): string | undefined {
  if (!text) return undefined;
  // This regex removes a wide range of symbols, emojis, and non-standard characters
  return text.replace(/[^a-z0-9\s.,-–—_()|/\\&+#@:'’`´~!?$%[\]{}]/gi, '').trim();
}


export async function getJobs(): Promise<Job[]> {
  const jobMap = new Map<string, Job>();

  // Helper to add a job to the map, checking for duplicates based on title and company
  const addJobToMap = (job: Job) => {
    const uniqueKey = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;
    if (!jobMap.has(uniqueKey)) {
        jobMap.set(uniqueKey, job);
    }
  };

  // Prioritize manual jobs by adding them to the map first
  MANUAL_JOBS.forEach(job => {
    // We use a different key here to ensure manual jobs are always unique if their link is unique
    const uniqueKeyForManual = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;
     if (!jobMap.has(uniqueKeyForManual)) {
        jobMap.set(uniqueKeyForManual, job);
    }
  });

  const allJobsPromises = FEEDS.map(async (feedUrl) => {
    try {
      const feed = await parser.parseURL(feedUrl);
      if (feed?.items) {
        feed.items.forEach((item) => {
          const title = cleanTitle(item.title);
          const company = cleanCompany(item.content);
          const link = item.link;

          if (link && title && company && title.split(' ').length <= 8 && !title.toLowerCase().includes('bounty')) {
            addJobToMap({
                id: item.guid || link,
                title,
                company,
                link,
                date: item.isoDate || new Date().toISOString(),
                source: feed.title || feedUrl,
            });
          }
        });
      }
    } catch (error) {
      console.warn(`Could not fetch or parse feed: ${feedUrl}`, error);
    }
  });

  await Promise.all(allJobsPromises);
  
  let uniqueJobs = Array.from(jobMap.values());

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  uniqueJobs = uniqueJobs.filter(job => new Date(job.date) >= ninetyDaysAgo);

  uniqueJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return uniqueJobs;
}

    