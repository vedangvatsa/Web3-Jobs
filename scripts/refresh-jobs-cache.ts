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
  { url: 'https://politepol.com/fd/bs9i34afSjHS.xml', defaultCompany: 'Arbitrum' },
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
  'layerzero': 'LayerZero',
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
  'dapper labs': 'Dapper Labs',
  'dapper': 'Dapper Labs',
  'offchain labs': 'Offchain Labs',
  'arbitrum foundation': 'Arbitrum',
  'arbitrum': 'Arbitrum',
  'polygon labs': 'Polygon Labs',
  'mysten labs': 'Mysten Labs',
  'sky (makerdao)': 'Sky',
  'maple finance': 'Maple Finance',
  'magic eden': 'Magic Eden',
  'lens protocol': 'Lens Protocol',
  'espresso systems': 'Espresso Systems',
  'pyth network': 'Pyth Network',
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
    // --- Crypto exchanges ---
    { board: 'okx', company: 'OKX' },
    { board: 'bybit', company: 'Bybit' },
    { board: 'bitmex', company: 'BitMEX' },
    { board: 'luno', company: 'Luno' },
    // --- New Web3 companies ---
    { board: 'a16z', company: 'a16z' },
    { board: 'paradigm', company: 'Paradigm' },
    { board: 'zora', company: 'Zora' },
    { board: 'securitize', company: 'Securitize' },
    { board: 'copperco', company: 'Copper.co' },
    { board: 'figment', company: 'Figment' },
    { board: 'eclipse', company: 'Eclipse' },
    { board: 'nexus', company: 'Nexus' },
    { board: 'openzeppelin', company: 'OpenZeppelin' },
    { board: 'immunefi', company: 'Immunefi' },
    { board: 'b2c2', company: 'B2C2' },
    { board: 'brave', company: 'Brave' },
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

  // --- Lever API Sources ---
  const LEVER_BOARDS = [
    { board: 'immutable', company: 'Immutable' },
    { board: 'celestia', company: 'Celestia' },
    { board: 'starknet', company: 'StarkNet' },
    { board: 'kraken', company: 'Kraken' },
    { board: 'anchorage', company: 'Anchorage Digital' },
    { board: 'moonpay', company: 'MoonPay' },
    { board: 'ledger', company: 'Ledger' },
    { board: 'ethena', company: 'Ethena' },
    { board: '1inch', company: '1inch' },
    { board: 'zerion', company: 'Zerion' },
    // --- Crypto exchanges ---
    { board: 'gate', company: 'Gate.io' },
    { board: 'swissborg', company: 'SwissBorg' },
    // --- New Web3 companies ---
    { board: 'offchainlabs', company: 'Offchain Labs' },
    { board: 'arbitrumfoundation', company: 'Arbitrum Foundation' },
    { board: 'animocabrands', company: 'Animoca Brands' },
    { board: 'fuellabs', company: 'Fuel Labs' },
    { board: 'ambergroup', company: 'Amber Group' },
    { board: 'coingecko', company: 'CoinGecko' },
    { board: 'coinmarketcap', company: 'CoinMarketCap' },
    { board: 'gauntlet', company: 'Gauntlet' },
    { board: 'jito', company: 'Jito' },
  ];

  for (const lv of LEVER_BOARDS) {
    try {
      const res = await fetch(`https://api.lever.co/v0/postings/${lv.board}?mode=json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const postings = await res.json() as Array<{ text: string; hostedUrl: string; id: string; createdAt: number; categories?: { team?: string; department?: string; location?: string } }>;

      let added = 0;
      for (const posting of postings) {
        const title = cleanTitle(posting.text);
        const company = normalizeCompany(lv.company);
        const link = posting.hostedUrl;
        const date = posting.createdAt ? new Date(posting.createdAt).toISOString() : new Date().toISOString();

        if (link && title && title.split(' ').length <= 8 && !title.includes('*') && !title.toLowerCase().includes('bounty')) {
          const key = createUniqueKey(title, company);
          if (!jobMap.has(key)) {
            jobMap.set(key, {
              id: posting.id,
              title,
              company,
              link,
              date,
              source: `Lever: ${lv.company}`,
            });
            added++;
          }
        }
      }
      feedsOk++;
      console.log(`  ✅ Lever (${lv.company}): ${postings.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Lever (${lv.company}): ${error.message}`);
    }
  }

  // --- Ashby API Sources ---
  const ASHBY_BOARDS = [
    // L1/L2 Chains
    { board: 'polygon-labs', company: 'Polygon Labs' },
    { board: 'mystenlabs', company: 'Mysten Labs' },
    { board: 'Base', company: 'Base' },
    { board: 'Cosmos', company: 'Cosmos' },
    { board: 'Injective', company: 'Injective' },
    { board: 'Conduit', company: 'Conduit' },
    { board: 'Espresso', company: 'Espresso Systems' },
    { board: 'Succinct', company: 'Succinct' },
    { board: 'SkyEcosystem', company: 'Sky (MakerDAO)' },
    // Exchanges & Trading
    { board: 'Polymarket', company: 'Polymarket' },
    { board: 'Backpack', company: 'Backpack' },
    // DeFi
    { board: 'Uniswap', company: 'Uniswap' },
    { board: 'Compound', company: 'Compound' },
    { board: 'Morpho', company: 'Morpho' },
    { board: 'Orca', company: 'Orca' },
    // NFT & Social
    { board: 'OpenSea', company: 'OpenSea' },
    { board: 'MagicEden', company: 'Magic Eden' },
    { board: 'Dapper', company: 'Dapper Labs' },
    { board: 'Foundation', company: 'Foundation' },
    { board: 'Lens', company: 'Lens Protocol' },
    { board: 'Sorare', company: 'Sorare' },
    // Wallets & Auth
    { board: 'Phantom', company: 'Phantom' },
    { board: 'Safe', company: 'Safe' },
    { board: 'Turnkey', company: 'Turnkey' },
    { board: 'SpruceID', company: 'Spruce' },
    // Infra & Dev Tools
    { board: 'Gelato', company: 'Gelato' },
    { board: 'QuickNode', company: 'QuickNode' },
    { board: 'Syndica', company: 'Syndica' },
    { board: 'Helius', company: 'Helius' },
    { board: '0x', company: '0x' },
    { board: 'LI.FI', company: 'LI.FI' },
    { board: 'Socket', company: 'Socket' },
    { board: 'PythNetwork', company: 'Pyth Network' },
    { board: 'Biconomy', company: 'Biconomy' },
    // Analytics & Security
    { board: 'Elliptic', company: 'Elliptic' },
    { board: 'Maple', company: 'Maple Finance' },
    { board: 'Blockdaemon', company: 'Blockdaemon' },
    // L1 Chains
    { board: 'Stacks', company: 'Stacks' },
    { board: 'Stellar', company: 'Stellar' },
    // Infra & Security
    { board: 'nethermind', company: 'Nethermind' },
    { board: 'cantina', company: 'Cantina' },
    { board: 'cubist', company: 'Cubist' },
    // Wallets & SDK
    { board: 'Sequence', company: 'Sequence' },
    // Crypto VC
    { board: 'Nascent', company: 'Nascent' },
  ];

  for (const ab of ASHBY_BOARDS) {
    try {
      const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${ab.board}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { jobs: Array<{ title: string; jobUrl: string; id: string; publishedAt: string; location: string; department: string }> };

      let added = 0;
      for (const job of data.jobs) {
        const title = cleanTitle(job.title);
        const company = normalizeCompany(ab.company);
        const link = job.jobUrl;
        const date = job.publishedAt || new Date().toISOString();

        if (link && title && title.split(' ').length <= 8 && !title.includes('*') && !title.toLowerCase().includes('bounty')) {
          const key = createUniqueKey(title, company);
          if (!jobMap.has(key)) {
            jobMap.set(key, {
              id: job.id,
              title,
              company,
              link,
              date,
              source: `Ashby: ${ab.company}`,
            });
            added++;
          }
        }
      }
      feedsOk++;
      console.log(`  ✅ Ashby (${ab.company}): ${data.jobs.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Ashby (${ab.company}): ${error.message}`);
    }
  }

  // --- Workable Public Search API ---
  // Searches Workable's global job board for web3-relevant keywords
  const WORKABLE_QUERIES = ['web3', 'blockchain', 'crypto', 'DeFi', 'solidity', 'smart contract', 'ethereum', 'bitcoin', 'NFT', 'tokenomics'];
  
  for (const query of WORKABLE_QUERIES) {
    try {
      const res = await fetch(`https://jobs.workable.com/api/v1/jobs?query=${encodeURIComponent(query)}&limit=50`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { jobs: Array<{ id: string; title: string; url: string; created: string; company?: { title?: string }; location?: { city?: string; countryName?: string } }> };

      let added = 0;
      for (const job of data.jobs) {
        const title = cleanTitle(job.title);
        const company = normalizeCompany(job.company?.title || 'Unknown');
        const link = job.url;
        const date = job.created || new Date().toISOString();

        // Skip if company is unknown or title is too long/short
        if (!job.company?.title || !link || !title || title.split(' ').length > 8) continue;
        // Skip non-English titles (common on Workable global search)
        if (/[^\x00-\x7F]/.test(title)) continue;

        const key = createUniqueKey(title, company);
        if (!jobMap.has(key)) {
          jobMap.set(key, {
            id: job.id,
            title,
            company,
            link,
            date,
            source: `Workable: ${query}`,
          });
          added++;
        }
      }
      feedsOk++;
      console.log(`  ✅ Workable ("${query}"): ${data.jobs.length} results, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Workable ("${query}"): ${error.message}`);
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
