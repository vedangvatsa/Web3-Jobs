#!/usr/bin/env node

/**
 * Fetches all RSS job feeds and writes results to content/jobs-cache.json.
 * Designed to run via GitHub Actions every 8 hours.
 * The committed cache file is read by getJobs() at runtime (no live RSS fetching).
 */

import * as fs from 'fs';
import * as path from 'path';

interface GetroBoard {
  url: string;
  defaultCompany?: string; // fallback when content doesn't contain company name
}

const GETRO_BOARDS: GetroBoard[] = [
  { url: 'https://jobs.dragonfly.xyz/jobs', defaultCompany: 'Dragonfly' },
  { url: 'https://jobs.arbitrum.io/jobs', defaultCompany: 'Arbitrum' },
  { url: 'https://jobs.avax.network/jobs', defaultCompany: 'Avalanche' },
  { url: 'https://jobs.solana.com/jobs', defaultCompany: 'Solana' },
  { url: 'https://jobs.multicoin.capital/jobs', defaultCompany: 'Multicoin Capital' },
  { url: 'https://coinbase.getro.com/jobs', defaultCompany: 'Coinbase' },
  { url: 'https://jobs.spartangroup.io/jobs', defaultCompany: 'Spartan Group' },
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
  // Strip CJK fullwidth brackets and content (e.g. 【MY】, 【SG】)
  text = text.replace(/[\u3010\uFF08].*?[\u3011\uFF09]/g, '');
  // Strip regular parenthetical country codes and junk (e.g. "(MY)", "(Remote)")
  text = text.replace(/\s*\([^)]{1,4}\)\s*$/g, '');
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
  console.log(`Getro boards to fetch: ${GETRO_BOARDS.length}`);

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

  // Fetch all Getro boards in parallel
  const fetchStart = Date.now();
  let feedsOk = 0;
  let feedsFailed = 0;

  await Promise.all(
    GETRO_BOARDS.map(async (board) => {
      try {
        const response = await fetch(board.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
          },
          signal: AbortSignal.timeout(FEED_TIMEOUT_MS)
        });
        
        if (!response.ok) throw new Error(`Status ${response.status}`);
        
        const html = await response.text();
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        if (!nextDataMatch) throw new Error('No __NEXT_DATA__ found in HTML');
        
        const nextData = JSON.parse(nextDataMatch[1]);
        const jobsData = nextData?.props?.pageProps?.initialState?.jobs?.found || nextData?.props?.pageProps?.initialState?.jobs?.data || [];
        
        let added = 0;
        jobsData.forEach((job: any) => {
          const title = cleanTitle(job.title || '');
          const rawCompany = job.company?.name || board.defaultCompany;
          const company = rawCompany ? normalizeCompany(rawCompany) : undefined;
          const link = job.application_url || job.job_url || job.url;
          
          if (link && title && company && !title.includes('*') && title.split(' ').length <= 15 && !title.toLowerCase().includes('bounty')) {
            const key = createUniqueKey(title, company);
            if (!jobMap.has(key)) {
              jobMap.set(key, {
                id: String(job.id) || link,
                title,
                company,
                link,
                date: job.published_at || job.updated_at || new Date().toISOString(),
                source: board.url,
              });
              added++;
            }
          }
        });
        feedsOk++;
        console.log(`  ✅ ${board.url}: ${jobsData.length} items, ${added} new`);
      } catch (error: any) {
        feedsFailed++;
        console.warn(`  ❌ ${board.url}: ${error.message}`);
      }
    })
  );

  // --- Greenhouse API Sources ---
  const GREENHOUSE_BOARDS = [
    { board: 'guild', company: 'Guild' },

    { board: 'stripe', company: 'Stripe' },

    { board: 'messari', company: 'Messari' },

    { board: 'gearbox', company: 'Gearbox' },

    { board: 'axiom', company: 'Axiom' },

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
    // --- Apr 2026 expansion ---
    { board: 'ritual', company: 'Ritual' },
    { board: 'flowtraders', company: 'Flow Traders' },
    { board: 'taxbit', company: 'TaxBit' },
    // --- Apr 2026 expansion (wave 2) ---
    { board: 'grayscaleinvestments', company: 'Grayscale' },
    { board: 'zetachain', company: 'ZetaChain' },
    { board: 'complyadvantage', company: 'ComplyAdvantage' },
    { board: 'rampnetwork', company: 'Ramp Network' },
    // --- Apr 2026 expansion (wave 3) ---
    { board: 'orderly', company: 'Orderly Network' },
    // --- Apr 2026 expansion (wave 4) ---
    { board: 'bitpanda', company: 'Bitpanda' },
    { board: 'bitso', company: 'Bitso' },
    { board: 'woo', company: 'WOO Network' },
    { board: 'shakepay', company: 'Shakepay' },
    { board: 'polychaincapital', company: 'Polychain Capital' },
    // --- Massive May 2026 expansion ---
    { board: 'falconx', company: 'FalconX' },
    { board: 'gsrmarkets', company: 'GSR Markets' },
    { board: 'dvtrading', company: 'DV Trading' },
    { board: 'alpaca', company: 'Alpaca' },
    { board: 'dfinity', company: 'DFINITY' },
    { board: 'sei', company: 'Sei' },
    { board: 'magic', company: 'Magic' },
    { board: 'helium', company: 'Helium' },
    { board: 'janestreet', company: 'Jane Street' },
    { board: 'galaxy', company: 'Galaxy Digital' },
    { board: 'genesis', company: 'Genesis' },
    { board: 'foundry', company: 'Foundry' },
    // --- CoinGecko May 2026 expansion ---
    { board: 'sonic', company: 'Sonic' },
    { board: 'spire', company: 'Spire' },
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

        if (link && title && title.split(' ').length <= 15 && !title.includes('*') && !title.toLowerCase().includes('bounty')) {
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
    { board: 'crypto', company: 'Crypto' },

    { board: 'zeta', company: 'Zeta' },

    { board: 'cleanspark', company: 'Cleanspark' },

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
    { board: 'wintermute-trading', company: 'Wintermute' },
    { board: 'superstate', company: 'Superstate' },
    { board: 'offchainlabs', company: 'Offchain Labs' },
    { board: 'arbitrumfoundation', company: 'Arbitrum Foundation' },
    { board: 'animocabrands', company: 'Animoca Brands' },
    { board: 'fuellabs', company: 'Fuel Labs' },
    { board: 'ambergroup', company: 'Amber Group' },
    { board: 'coingecko', company: 'CoinGecko' },
    { board: 'coinmarketcap', company: 'CoinMarketCap' },
    { board: 'gauntlet', company: 'Gauntlet' },
    { board: 'jito', company: 'Jito' },
    // --- Apr 2026 expansion ---
    { board: 'centrifuge', company: 'Centrifuge' },
    // --- Apr 2026 expansion (wave 2) ---
    { board: 'certik', company: 'CertiK' },
    { board: 'merklescience', company: 'Merkle Science' },
    { board: 'harmony', company: 'Harmony' },
    { board: 'infstones', company: 'InfStones' },
    { board: 'aurora-dev', company: 'Aurora' },
    // --- Apr 2026 expansion (wave 3) ---
    { board: 'binance', company: 'Binance' },
    { board: 'bigtime', company: 'Big Time' },
    // --- Apr 2026 expansion (wave 4) ---
    { board: 'newton', company: 'Newton' },
    // --- Massive May 2026 expansion ---
    { board: 'coins', company: 'Coins.ph' },
    { board: 'coinmarketcap', company: 'CoinMarketCap' },
    { board: 'zerion', company: 'Zerion' },
    { board: 'aragon', company: 'Aragon' },
    // --- CoinGecko May 2026 expansion ---
    { board: 'mantra', company: 'MANTRA' },
    { board: 'neon', company: 'Neon EVM' },
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

        if (link && title && title.split(' ').length <= 15 && !title.includes('*') && !title.toLowerCase().includes('bounty')) {
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
    { board: 'ramp', company: 'Ramp' },

    { board: 'jump', company: 'Jump' },

    { board: 'jane', company: 'Jane' },

    { board: 'electric', company: 'Electric' },

    { board: 'tokenterminal', company: 'Tokenterminal' },

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
    { board: 'Nethermind', company: 'Nethermind' },
    { board: 'cantina', company: 'Cantina' },
    { board: 'cubist', company: 'Cubist' },
    { board: 'trm-labs', company: 'TRM Labs' },
    { board: 'switchboard', company: 'Switchboard' },
    // Wallets & SDK
    { board: 'Sequence', company: 'Sequence' },
    // Crypto VC
    { board: 'Nascent', company: 'Nascent' },
    // --- Apr 2026 expansion ---
    { board: 'Paxos', company: 'Paxos' },
    { board: 'Blockworks', company: 'Blockworks' },
    // --- Apr 2026 expansion (wave 2) ---
    { board: 'Sardine', company: 'Sardine' },
    { board: 'Notabene', company: 'Notabene' },
    { board: 'Parity', company: 'Parity Technologies' },
    { board: 'SkyMavis', company: 'Sky Mavis' },
    { board: 'Dune', company: 'Dune' },
    { board: 'Goldsky', company: 'Goldsky' },
    { board: 'oplabs', company: 'OP Labs' },
    { board: 'eigen-labs', company: 'Eigen Labs' },
    { board: 'aztec-labs', company: 'Aztec' },
    { board: 'provable', company: 'Provable (Aleo)' },
    { board: 'Render', company: 'Render Network' },
    // --- Apr 2026 expansion (wave 3) ---
    { board: 'seifoundation', company: 'Sei' },
    { board: 'artemis', company: 'Artemis' },
    // --- Apr 2026 expansion (wave 4) ---
    { board: 'trust-wallet', company: 'Trust Wallet' },
    { board: 'bitvavo', company: 'Bitvavo' },
    { board: 'delphi', company: 'Delphi Digital' },
    { board: 'variant-fund', company: 'Variant Fund' },
    { board: 'flipsidecrypto', company: 'Flipside Crypto' },
    // --- Massive May 2026 expansion ---
    { board: 'biconomy', company: 'Biconomy' },
    { board: 'dapper', company: 'Dapper Labs' },
    { board: 'protocol', company: 'Protocol Labs' },
    { board: 'cyberconnect', company: 'CyberConnect' },
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

        if (link && title && title.split(' ').length <= 15 && !title.includes('*') && !title.toLowerCase().includes('bounty')) {
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

  // --- Workable API Sources ---
  const WORKABLE_BOARDS = [
    { board: 'aethir', company: 'Aethir' },
    { board: 'blast', company: 'Blast' },
  ];

  for (const wb of WORKABLE_BOARDS) {
    try {
      const res = await fetch(`https://apply.workable.com/api/v1/widget/accounts/${wb.board}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { jobs: Array<{ title: string; url: string; id: string; published_on: string; department: string; location: { city: string; country: string } }> };

      let added = 0;
      for (const job of data.jobs) {
        const title = cleanTitle(job.title);
        const company = normalizeCompany(wb.company);
        const link = `https://apply.workable.com/${wb.board}/j/${job.id}/`;
        const date = job.published_on || new Date().toISOString();

        if (link && title && title.split(' ').length <= 15 && !title.includes('*') && !title.toLowerCase().includes('bounty')) {
          const key = createUniqueKey(title, company);
          if (!jobMap.has(key)) {
            jobMap.set(key, {
              id: job.id,
              title,
              company,
              link,
              date,
              source: `Workable: ${wb.company}`,
            });
            added++;
          }
        }
      }
      feedsOk++;
      console.log(`  ✅ Workable (${wb.company}): ${data.jobs.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Workable (${wb.company}): ${error.message}`);
    }
  }

  // --- Recruitee API Sources ---
  const RECRUITEE_BOARDS = [
    { board: 'circle', company: 'Circle' },
    { board: 'celestia', company: 'Celestia' },
    { board: 'harmony', company: 'Harmony' },
    // --- CoinGecko May 2026 expansion ---
    { board: 'tether', company: 'Tether' },
    { board: 'bitfinex', company: 'Bitfinex' },
    { board: 'jump', company: 'Jump' },
  ];

  for (const rt of RECRUITEE_BOARDS) {
    try {
      const res = await fetch(`https://${rt.board}.recruitee.com/api/offers`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { offers: Array<{ title: string; careers_url: string; id: number; published_at: string; department: string; location: string }> };

      let added = 0;
      for (const offer of data.offers) {
        const title = cleanTitle(offer.title);
        const company = normalizeCompany(rt.company);
        const link = offer.careers_url;
        const date = offer.published_at || new Date().toISOString();

        if (link && title && title.split(' ').length <= 15 && !title.includes('*') && !title.toLowerCase().includes('bounty')) {
          const key = createUniqueKey(title, company);
          if (!jobMap.has(key)) {
            jobMap.set(key, {
              id: String(offer.id),
              title,
              company,
              link,
              date,
              source: `Recruitee: ${rt.company}`,
            });
            added++;
          }
        }
      }
      feedsOk++;
      console.log(`  ✅ Recruitee (${rt.company}): ${data.offers.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Recruitee (${rt.company}): ${error.message}`);
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

  // Filter out unwanted companies and non-tech roles
  const BLOCKED_COMPANIES = new Set([
    'crusoe', 'florida street', 'wyoming stable token commission',
    'katana',          // Restaurant chain, not web3
    'fuse energy',     // Energy company, not web3
    'ashby',           // ATS software, not web3 (leaks through VC feeds)
  ]);

  const BLOCKED_TITLE_KEYWORDS = [
    'chef', 'cook', 'sous chef', 'pastry', 'barista', 'bartender', 'sommelier',
    'kitchen', 'food service', 'catering',
    'janitor', 'custodian', 'cleaner', 'housekeeper', 'housekeeping', 'laundry',
    'driver', 'chauffeur', 'courier', 'delivery driver',
    'receptionist', 'front desk', 'concierge',
    'waiter', 'waitress', 'busser', 'dishwasher',
    'landscaper', 'groundskeeper', 'plumber', 'electrician', 'carpenter', 'hvac',
    'security guard', 'security officer', 'bouncer',
    'nurse', 'physician', 'dentist', 'pharmacist', 'veterinarian',
    'nanny', 'babysitter', 'childcare',
    'robata', 'sushi', 'mixologist',
  ];

  allJobs = allJobs.filter(job => {
    const titleLower = job.title.toLowerCase().trim();
    const companyLower = job.company.toLowerCase().trim();

    // Block specific companies entirely
    if (BLOCKED_COMPANIES.has(companyLower)) return false;

    // Block placeholder/generic entries
    if (companyLower === 'interop labs' && titleLower.includes('interested in working with us')) return false;
    if (job.title.includes('*')) return false;

    // Block titles that are actually locations (e.g. "West Hollywood, CA")
    if (/^[A-Z][a-z]+(\s[A-Z][a-z]+)?,\s*[A-Z]{2}$/.test(job.title.trim())) return false;

    // Block non-tech roles by title keyword
    if (BLOCKED_TITLE_KEYWORDS.some(kw => titleLower.includes(kw))) return false;

    return true;
  });

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
