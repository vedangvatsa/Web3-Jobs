#!/usr/bin/env node

/**
 * Fetches all RSS job feeds and writes results to content/jobs-cache.json.
 * Designed to run via GitHub Actions every 8 hours.
 * The committed cache file is read by getJobs() at runtime (no live RSS fetching).
 */

import Parser from 'rss-parser';
import * as fs from 'fs';
import * as path from 'path';

interface FeedSource {
  url: string;
  defaultCompany?: string; // fallback when RSS content doesn't contain company name
}

const FEEDS: FeedSource[] = [
  { url: 'https://politepol.com/fd/JEeZwG4KK7uT.xml', defaultCompany: 'Dragonfly' },
  { url: 'https://politepol.com/fd/sDzglCq7RCpG.xml', defaultCompany: 'Paradigm' },
  { url: 'https://politepol.com/fd/bs9i34afSjHS.xml', defaultCompany: 'Arbitrum' },
  { url: 'https://politepol.com/fd/oiXKHETnrDap.xml', defaultCompany: 'a16z' },
  { url: 'https://politepol.com/fd/Ane01VX84MOk.xml', defaultCompany: 'Pantera Capital' },
  { url: 'https://politepol.com/fd/HI6pMDlyEO7j.xml', defaultCompany: 'Avalanche' },
  { url: 'https://politepol.com/fd/uIQRejBOTRjO.xml', defaultCompany: 'Solana' },
  { url: 'https://politepol.com/fd/qglK0E9cQDYB.xml', defaultCompany: 'Hedera' },
  { url: 'https://politepol.com/fd/UEGwYfx1fQ9R.xml' },
  { url: 'https://politepol.com/fd/fEgzbFDDrmRe.xml', defaultCompany: 'Multicoin Capital' },
  { url: 'https://politepol.com/fd/KTQjDJIFxvZY.xml', defaultCompany: 'Coinbase' },
  { url: 'https://politepol.com/fd/K6yCQ7sphvoC.xml', defaultCompany: 'Spartan Group' },
  { url: 'https://politepol.com/fd/UCDj2aIroL4G.xml', defaultCompany: 'Binance' },
];

const FEED_TIMEOUT_MS = 8000;

// Normalize variant company names to a canonical form
const COMPANY_ALIASES: Record<string, string> = {
  'anchorage': 'Anchorage Digital',
  'layerzero labs': 'LayerZero',
  '1inch network': '1inch',
  '1inch': '1inch',
  'near protocol': 'NEAR',
  'near': 'NEAR',
  'monad': 'Monad Foundation',
  'monad foundation': 'Monad Foundation',
  'uniswap': 'Uniswap',
  'uniswap labs': 'Uniswap',
  'worldcoin': 'World',
  'world': 'World',
};

function normalizeCompany(company: string): string {
  const key = company.toLowerCase().trim();
  return COMPANY_ALIASES[key] || company;
}

interface CachedJob {
  id: string;
  title: string;
  company: string;
  link: string;
  date: string;
  source: string;
}

function cleanCompany(company: string | undefined): string | undefined {
  if (!company) return undefined;
  return company.replace(/<[^>]*>?/gm, '').split('\\n')[0].trim();
}

function cleanTitle(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return text.replace(/[^a-z0-9\s.,-\u2013\u2014_()|/\\\u0026+#@:\u2019\u2018`\u00b4~!?$%[\]{}*]/gi, '').trim();
}

function createUniqueKey(title: string, company: string): string {
  const normalize = (str: string) => str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/gi, '');
  return `${normalize(title)}|${normalize(company)}`;
}

async function refreshJobsCache() {
  console.log('🔄 Refreshing jobs cache from RSS feeds...');
  console.log(`Feeds to fetch: ${FEEDS.length}`);

  const parser = new Parser();
  const jobMap = new Map<string, CachedJob>();

  // Load existing cache to preserve jobs that may have dropped from feeds
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  try {
    if (fs.existsSync(cachePath)) {
      const existing: CachedJob[] = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      existing.forEach(job => {
        if (new Date(job.date) > thirtyDaysAgo) {
          const key = createUniqueKey(job.title, job.company);
          jobMap.set(key, job);
        }
      });
      console.log(`📦 Loaded ${jobMap.size} existing jobs from cache (after 30-day filter)`);
    }
  } catch (e) {
    console.warn('⚠️ Could not read existing cache, starting fresh');
  }

  // Fetch all feeds in parallel
  const fetchStart = Date.now();
  let feedsOk = 0;
  let feedsFailed = 0;

  await Promise.all(
    FEEDS.map(async (feedSource) => {
      try {
        const feed = await Promise.race([
          parser.parseURL(feedSource.url),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Feed timeout')), FEED_TIMEOUT_MS)
          ),
        ]);

        if (feed?.items) {
          let added = 0;
          feed.items.forEach((item) => {
            const title = cleanTitle(item.title);
            const rawCompany = cleanCompany(item.content) || feedSource.defaultCompany;
            const company = rawCompany ? normalizeCompany(rawCompany) : undefined;
            const link = item.link;

            if (link && title && company && !title.includes('*') && title.split(' ').length <= 8 && !title.toLowerCase().includes('bounty')) {
              const key = createUniqueKey(title, company);
              if (!jobMap.has(key)) {
                jobMap.set(key, {
                  id: item.guid || link,
                  title,
                  company,
                  link,
                  date: item.isoDate || new Date().toISOString(),
                  source: feed.title || feedSource.url,
                });
                added++;
              }
            }
          });
          feedsOk++;
          console.log(`  ✅ ${feed.title || feedSource.url}: ${feed.items.length} items, ${added} new`);
        }
      } catch (error: any) {
        feedsFailed++;
        console.warn(`  ❌ ${feedSource.url}: ${error.message}`);
      }
    })
  );

  // --- Greenhouse API Sources ---
  const GREENHOUSE_BOARDS = [
    { board: 'coinbase', company: 'Coinbase' },
    { board: 'ripple', company: 'Ripple' },
    { board: 'robinhood', company: 'Robinhood' },
    { board: 'bitgo', company: 'BitGo' },
    { board: 'fireblocks', company: 'Fireblocks' },
    { board: 'alchemy', company: 'Alchemy' },
    { board: 'consensys', company: 'Consensys' },
    { board: 'gemini', company: 'Gemini' },
    // --- New web3 Greenhouse feeds ---
    { board: 'aptoslabs', company: 'Aptos Labs' },
    { board: 'avalabs', company: 'Ava Labs' },
    { board: 'layerzerolabs', company: 'LayerZero' },
    { board: 'galaxydigitalservices', company: 'Galaxy Digital' },
    { board: 'blockchain', company: 'Blockchain.com' },
    { board: 'nansen', company: 'Nansen' },
    { board: 'nearfoundation', company: 'NEAR' },
    { board: 'digitalcurrencygroup', company: 'DCG' },
    { board: 'hashgraph', company: 'Hedera' },
    { board: 'jumpcrypto', company: 'Jump Crypto' },
  ];

  for (const gh of GREENHOUSE_BOARDS) {
    try {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${gh.board}/jobs?content=false`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { jobs: Array<{ title: string; absolute_url: string; id: number; updated_at: string; first_published: string; metadata: Array<{ name: string; value: string }> }> };

      let added = 0;
      for (const job of data.jobs) {
        const title = cleanTitle(job.title);
        const company = normalizeCompany(gh.company);
        const link = job.absolute_url;
        const date = job.first_published || job.updated_at;
        // Skip internal/hidden postings
        const dept = job.metadata?.find(m => m.name === 'Careersite Department (for job postings)')?.value;
        if (dept === 'Do Not Post') continue;

        if (link && title && title.split(' ').length <= 8 && !title.includes('*') && !title.toLowerCase().includes('bounty')) {
          const key = createUniqueKey(title, company);
          if (!jobMap.has(key)) {
            jobMap.set(key, {
              id: String(job.id),
              title,
              company,
              link,
              date: date || new Date().toISOString(),
              source: `Greenhouse: ${gh.company}`,
            });
            added++;
          }
        }
      }
      feedsOk++;
      console.log(`  ✅ Greenhouse (${gh.company}): ${data.jobs.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Greenhouse (${gh.company}): ${error.message}`);
    }
  }

  const elapsed = Date.now() - fetchStart;
  console.log(`\n⏱️ Fetched in ${elapsed}ms (${feedsOk} ok, ${feedsFailed} failed)`);

  // Convert to array and sort by date
  let allJobs = Array.from(jobMap.values());

  // Apply 30-day filter
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  allJobs = allJobs.filter(job => new Date(job.date) > thirtyDaysAgo);

  // Filter out unwanted companies
  allJobs = allJobs.filter(job =>
    job.company.toLowerCase() !== 'crusoe' &&
    !(job.company.toLowerCase() === 'interop labs' && job.title.toLowerCase().includes('interested in working with us')) &&
    job.company.toLowerCase() !== 'florida street' &&
    !job.title.includes('*') &&
    job.company.toLowerCase() !== 'wyoming stable token commission' &&
    !(job.company.toLowerCase() === 'katana' && job.title.toLowerCase().includes('bartender'))
  );

  // Sort newest first
  allJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Write cache
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(allJobs, null, 2));

  console.log(`\n✅ Cache updated: ${allJobs.length} jobs written to content/jobs-cache.json`);
  console.log(`📅 Date range: ${allJobs[allJobs.length - 1]?.date || 'N/A'} to ${allJobs[0]?.date || 'N/A'}`);
}

refreshJobsCache().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
