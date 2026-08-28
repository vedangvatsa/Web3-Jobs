#!/usr/bin/env node

/**
 * Fetches all RSS job feeds and writes results to content/jobs-cache.json.
 * Designed to run via GitHub Actions every 8 hours.
 * The committed cache file is read by getJobs() at runtime (no live RSS fetching).
 */

import * as fs from 'fs';
import * as path from 'path';
import Parser from 'rss-parser';
import { load } from 'cheerio';
import { getJobContentKey, getJobIdentity, getJobSlug } from '../src/lib/job-slugs';

interface GetroBoard {
  url: string;
  defaultCompany?: string; // fallback when content doesn't contain company name
}

// Getro SSR returns the 20 most-recently-posted jobs in __NEXT_DATA__.
// With an 8-hour cron + 30-day cache window this is sufficient to capture
// all new postings unless a board publishes >20 jobs in a single 8-hour window.
const GETRO_BOARDS: GetroBoard[] = [
  // --- VC portfolio boards ---
  { url: 'https://jobs.dragonfly.xyz/jobs', defaultCompany: 'Dragonfly' },
  { url: 'https://jobs.polychain.capital/jobs', defaultCompany: 'Polychain Capital' },
  { url: 'https://jobs.electriccapital.com/jobs', defaultCompany: 'Electric Capital' },
  { url: 'https://jobs.blockchaincapital.com/jobs', defaultCompany: 'Blockchain Capital' },
  { url: 'https://jobs.variant.fund/jobs', defaultCompany: 'Variant' },
  { url: 'https://jobs.dcg.co/jobs', defaultCompany: 'DCG' },
  { url: 'https://jobs.framework.ventures/jobs', defaultCompany: 'Framework Ventures' },
  { url: 'https://jobs.multicoin.capital/jobs', defaultCompany: 'Multicoin Capital' },
  { url: 'https://jobs.spartangroup.io/jobs', defaultCompany: 'Spartan Group' },
  { url: 'https://jobs.archetype.fund/jobs', defaultCompany: 'Archetype' },
  { url: 'https://nascent.getro.com/jobs', defaultCompany: 'Nascent' },
  { url: 'https://jobs.placeholder.vc/jobs', defaultCompany: 'Placeholder' },
  // --- Ecosystem boards ---
  { url: 'https://jobs.arbitrum.io/jobs', defaultCompany: 'Arbitrum' },
  { url: 'https://jobs.avax.network/jobs', defaultCompany: 'Avalanche' },
  { url: 'https://jobs.solana.com/jobs', defaultCompany: 'Solana' },
];

const FEED_TIMEOUT_MS = 15000;

// Previously guessed ATS slugs that resolve to unrelated companies (or dead
// boards). Keeping their cached rows would make source counts look healthier
// while publishing jobs outside the site's scope.
const RETIRED_BAD_SOURCES = new Set([
  'greenhouse: guild',
  'greenhouse: gearbox',
  'greenhouse: axiom',
  'ashby: jump',
  'ashby: jane',
  'ashby: electric',
  'ashby: tokenterminal',
  'recruitee: circle',
  'recruitee: harmony',
  'recruitee: bitfinex',
  'recruitee: jump',
  'lever: zeta',
  'lever: cleanspark',
  'lever: celestia',
  'lever: starknet',
  'lever: kraken',
  'lever: big time',
  'lever: neon evm',
  'ashby: foundation',
  'ashby: render network',
  'ashby: lido',
  'ashby: zerodev',
  'ashby: puffer finance',
  'ashby: flipside crypto',
]);

const RETIRED_BAD_BOARD_KEYS = new Set([
  'greenhouse:guild', 'greenhouse:gearbox', 'greenhouse:axiom',
  'greenhouse:nexus', 'greenhouse:sonic', 'greenhouse:spire',
  'greenhouse:foundry', 'greenhouse:galaxy', 'greenhouse:eclipse',
  'greenhouse:alchemy', 'greenhouse:avalabs', 'greenhouse:chainlink',
  'greenhouse:scroll', 'greenhouse:starkware', 'greenhouse:mantlenetwork',
  'greenhouse:worldcoin', 'greenhouse:berachain', 'greenhouse:gnosis',
  'greenhouse:wormhole', 'greenhouse:moralis', 'greenhouse:dydx',
  'greenhouse:pancakeswap', 'greenhouse:farcaster', 'greenhouse:etherscan',
  'lever:zeta', 'lever:cleanspark', 'lever:starknet',
  'lever:kraken', 'lever:bigtime', 'lever:neon',
  'lever:mantra',
  'ashby:jump', 'ashby:jane', 'ashby:electric', 'ashby:tokenterminal',
  'ashby:foundation', 'ashby:render', 'ashby:lido', 'ashby:zerodev',
  'ashby:puffer', 'ashby:flipsidecrypto', 'ashby:base', 'ashby:compound',
  'ashby:espresso', 'ashby:dapper', 'ashby:lens', 'ashby:safe',
  'ashby:gelato', 'ashby:socket', 'ashby:maple', 'ashby:stacks',
  'ashby:cantina', 'ashby:switchboard', 'ashby:sequence', 'ashby:artemis',
  'ashby:delphi',
  'ashby:cosmos', 'ashby:backpack', 'ashby:biconomy', 'ashby:cubist',
  'workable:blast',
  'recruitee:circle', 'recruitee:harmony', 'recruitee:bitfinex',
  'recruitee:jump', 'recruitee:celestia', 'recruitee:holepunch',
]);

function isRetiredSource(source: string): boolean {
  const normalized = source.toLowerCase();
  if (RETIRED_BAD_SOURCES.has(normalized)) return true;
  const match = normalized.match(/^([^:]+):.*\[([^\]]+)\]$/);
  return Boolean(match && RETIRED_BAD_BOARD_KEYS.has(`${match[1]}:${match[2]}`));
}

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
  'offchain labs': 'Arbitrum',
  'offchain': 'Arbitrum',
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
  'aave': 'Aave Labs',
  'aave labs': 'Aave Labs',
  'chainlink': 'Chainlink Labs',
  'chainlink labs': 'Chainlink Labs',
  'startale': 'Startale Group',
  'startale group': 'Startale Group',
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
  dateVerified?: boolean;
  source: string;
  slug?: string;
  location?: string;
  department?: string;
  active?: boolean;
}

function cleanCompany(company: string | undefined): string | undefined {
  if (!company) return undefined;
  return company.replace(/<[^>]*>?/gm, '').split('\\n')[0].trim();
}

function cleanTitle(text: string | undefined): string | undefined {
  if (!text) return undefined;
  // Location and team qualifiers distinguish otherwise-identical postings.
  return text
    .replace(/<[^>]*>?/gm, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isDirectSource(source: string): boolean {
  return /^(Greenhouse|Lever|Ashby|Workable|Recruitee|Workday|SmartRecruiters|Breezy|BambooHR|Comeet|Teamtailor|Rippling|FirstParty):/i.test(source);
}

function sourceLabel(provider: string, board: string, company: string): string {
  return `${provider}: ${company} [${board}]`;
}

function matchesRefreshedSource(job: CachedJob, provider: string, board: string, company: string): boolean {
  const source = job.source.toLowerCase();
  return source === sourceLabel(provider, board, company).toLowerCase()
    || source === `${provider}: ${company}`.toLowerCase();
}

function combineLeverContent(posting: {
  opening?: string;
  description?: string;
  descriptionBody?: string;
  salaryDescription?: string;
  lists?: Array<{ text?: string; content?: string }>;
  additional?: string;
}): string {
  const sections = [posting.opening, posting.description, posting.descriptionBody];
  for (const list of posting.lists || []) {
    if (list.text) sections.push(`<h3>${list.text}</h3>`);
    if (list.content) sections.push(`<ul>${list.content}</ul>`);
  }
  // Some employers put the full role body in Lever's salary-description field.
  // Treat it as source content, but only after the normal sections.
  sections.push(posting.salaryDescription);
  sections.push(posting.additional);
  return sections.filter(Boolean).join('\n');
}

const FABRICATED_DESCRIPTION_MARKERS = [
  'leading organisation in the Web3 and blockchain ecosystem',
  'passion for the Web3 space',
  'dynamic and collaborative environment where you can grow your career',
  'fast-paced environment, collaborating with talented colleagues',
];

function isUsableDescription(content: string | undefined): content is string {
  if (!content || content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length < 200) return false;
  return !FABRICATED_DESCRIPTION_MARKERS.some((marker) => content.includes(marker));
}

function isConcreteOpening(title: string): boolean {
  return !/(general application|general interest|general opening|general opportunity|expression of interest|talent community|talent pool|future opportunities|future consideration|future builders|join our talent|dream job|spontaneous application|open position|create your own role)/i.test(title);
}

interface JsonLdJobPosting {
  '@type'?: string;
  description?: string;
  datePosted?: string;
  title?: string;
}

function extractJsonLdJobPosting(html: string): JsonLdJobPosting | undefined {
  const scripts = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of scripts) {
    try {
      const parsed = JSON.parse(match[1]);
      const roots = Array.isArray(parsed) ? parsed : [parsed];
      const entries = roots.flatMap((entry) => (
        Array.isArray(entry?.['@graph']) ? entry['@graph'] : [entry]
      ));
      const posting = entries.find((entry) => entry?.['@type'] === 'JobPosting');
      if (posting) return posting as JsonLdJobPosting;
    } catch {
      // Ignore unrelated or malformed structured-data blocks.
    }
  }
  return undefined;
}

function extractJsonLdJobDescription(html: string): string | undefined {
  const description = extractJsonLdJobPosting(html)?.description;
  return description ? String(description) : undefined;
}

function extractBreezyJobDescription(html: string): string | undefined {
  const $ = load(html);
  return $('#description .description').first().html() || undefined;
}

function extractAshbyAppData(html: string): any | undefined {
  const match = html.match(/window\.__appData\s*=\s*(\{[^\n\r]*\});/);
  if (!match) return undefined;
  try {
    return JSON.parse(match[1]);
  } catch {
    return undefined;
  }
}

async function runInBatches<T>(
  items: T[],
  batchSize: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  for (let index = 0; index < items.length; index += batchSize) {
    await Promise.all(items.slice(index, index + batchSize).map(task));
  }
}

async function refreshJobsCache() {
  console.log('🔄 Refreshing jobs cache from RSS feeds...');
  console.log(`Getro boards to fetch: ${GETRO_BOARDS.length}`);

  const jobMap = new Map<string, CachedJob>();
  const persistedSlugs = new Map<string, string>();
  const persistedDates = new Map<string, string>();
  const persistedDateVerification = new Map<string, boolean | undefined>();
  const descriptionsPath = path.join(process.cwd(), 'content/job-descriptions.json');
  let existingDescriptions: Record<string, string> = {};
  const refreshedDescriptions = new Map<string, string>();

  const upsertJob = (job: CachedJob): boolean => {
    const identity = getJobIdentity(job);
    const existing = jobMap.get(identity);
    const nextJob = {
      ...job,
      slug: existing?.slug || persistedSlugs.get(identity) || job.slug || getJobSlug(job),
    };
    jobMap.set(identity, nextJob);
    return !existing;
  };

  const removeJobs = (predicate: (job: CachedJob) => boolean): void => {
    for (const [identity, job] of jobMap) {
      if (predicate(job)) jobMap.delete(identity);
    }
  };

  const removeAggregatorCopiesForCompany = (company: string): void => {
    const canonicalCompany = normalizeCompany(company).toLowerCase();
    removeJobs((job) => (
      !isDirectSource(job.source)
      && normalizeCompany(job.company).toLowerCase() === canonicalCompany
    ));
  };

  const rememberDescription = (job: CachedJob, content: string | undefined): void => {
    if (isUsableDescription(content)) {
      refreshedDescriptions.set(getJobContentKey(job), content);
    }
  };

  try {
    if (fs.existsSync(descriptionsPath)) {
      existingDescriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf-8'));
    }
  } catch {
    console.warn('Could not read the existing job description cache; rebuilding it from live sources.');
  }

  // Load existing cache to preserve jobs that may have dropped from feeds
  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  try {
    if (fs.existsSync(cachePath)) {
      const existing: CachedJob[] = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      existing.forEach(job => {
        const identity = getJobIdentity(job);
        if (job.slug) persistedSlugs.set(identity, job.slug);
        persistedDates.set(identity, job.date);
        persistedDateVerification.set(identity, job.dateVerified);
        if (isRetiredSource(job.source)) return;
        // Direct ATS roles are replaced only after their board responds
        // successfully. This avoids wiping a company during a transient outage.
        if (isDirectSource(job.source) || new Date(job.date) > thirtyDaysAgo) {
          jobMap.set(getJobIdentity(job), job);
        }
      });
      console.log(`📦 Loaded ${jobMap.size} existing jobs (active ATS roles plus recent aggregator discoveries)`);
    }
  } catch (e) {
    console.warn('⚠️ Could not read existing cache, starting fresh');
  }

  // Fetch all Getro boards in parallel
  const fetchStart = Date.now();
  let feedsOk = 0;
  let feedsFailed = 0;
  const configuredDirectSources = new Set<string>();
  const registerDirectSource = (provider: string, board: string, company: string): void => {
    configuredDirectSources.add(sourceLabel(provider, board, company).toLowerCase());
  };

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
        removeJobs((job) => job.source === board.url);
        
        let added = 0;
        jobsData.forEach((job: any) => {
          const title = cleanTitle(job.title || '');
          const rawCompany = job.organization?.name || board.defaultCompany;
          const company = rawCompany ? normalizeCompany(rawCompany) : undefined;
          const link = job.url || job.application_url || job.job_url;
          
          const isUnsafeLink = link && (
            link.includes('forms.gle') ||
            link.includes('docs.google.com/forms') ||
            link.includes('typeform.com') ||
            link.includes('cal.com') ||
            link.includes('jotform.com') ||
            // Reject links to competitor job boards — these are scraped/bad data
            link.includes('web3.career') ||
            link.includes('crypto.jobs') ||
            link.includes('remote3.co') ||
            link.includes('cryptojobslist.com') ||
            link.includes('web3jobboard.com')
          );

          if (link && title && company && !title.includes('*') && title.split(' ').length <= 15 && !title.toLowerCase().includes('bounty') && !isUnsafeLink) {
            const candidate: CachedJob = {
                id: String(job.id) || link,
                title,
                company,
                link,
                date: job.createdAt ? new Date(job.createdAt * 1000).toISOString() : new Date().toISOString(),
                source: board.url,
              };
            if (upsertJob(candidate)) added++;
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
    { board: 'stripe', company: 'Stripe' },

    { board: 'messari', company: 'Messari' },

    { board: 'coinbase', company: 'Coinbase' },
    { board: 'ripple', company: 'Ripple' },
    { board: 'robinhood', company: 'Robinhood' },
    { board: 'bitgo', company: 'BitGo' },
    { board: 'fireblocks', company: 'Fireblocks' },
    { board: 'consensys', company: 'Consensys' },
    { board: 'gemini', company: 'Gemini' },
    { board: 'ondofinance', company: 'Ondo Finance' },
    { board: 'figure', company: 'Figure' },
    { board: 'bvnk', company: 'BVNK' },
    { board: 'hut8', company: 'Hut 8' },
    { board: 'mesh', company: 'Mesh' },
    { board: 'straitsx', company: 'StraitsX' },
    { board: 'digitalassetcorp', company: 'Digital Asset' },
    { board: 'breezecash', company: 'Breeze Cash' },
    { board: 'xapo61', company: 'Xapo Bank' },
    { board: 'strike', company: 'Strike' },
    { board: 'daylight', company: 'Daylight' },
    { board: 'm0dbathenextthingltd', company: 'M0' },
    { board: 'telcoin', company: 'Telcoin' },
    { board: 'validationcloud', company: 'Validation Cloud' },
    { board: 'filecoinfoundation', company: 'Filecoin Foundation' },
    { board: '21shares', company: '21Shares' },
    { board: 'bcbgroup', company: 'BCB Group' },
    { board: 'block', company: 'Block' },
    // --- New web3 Greenhouse feeds ---
    { board: 'aptoslabs', company: 'Aptos Labs' },
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
    // --- Regional Exchanges & Protocols ---
    { board: 'coinme', company: 'Coinme' },
    { board: 'strike', company: 'Strike' },
  ];

  for (const gh of GREENHOUSE_BOARDS) {
    registerDirectSource('Greenhouse', gh.board, gh.company);
    try {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${gh.board}/jobs?content=true`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { jobs: Array<{
        title: string;
        absolute_url: string;
        id: number;
        updated_at: string;
        first_published: string;
        content?: string;
        location?: { name?: string };
        departments?: Array<{ name?: string }>;
        metadata?: Array<{ name: string; value: string }>;
      }> };

      removeJobs((job) => matchesRefreshedSource(job, 'Greenhouse', gh.board, gh.company));
      removeAggregatorCopiesForCompany(gh.company);

      let added = 0;
      for (const job of data.jobs) {
        const title = cleanTitle(job.title);
        const company = normalizeCompany(gh.company);
        const link = job.absolute_url;
        const date = job.first_published || job.updated_at;
        // Skip internal/hidden postings
        const dept = job.metadata?.find(m => m.name === 'Careersite Department (for job postings)')?.value;
        if (dept === 'Do Not Post') continue;

        if (link && title && title.length <= 180 && !title.toLowerCase().includes('bounty') && isConcreteOpening(title)) {
          const candidate: CachedJob = {
              id: String(job.id),
              title,
              company,
              link,
              date: date || new Date().toISOString(),
              source: sourceLabel('Greenhouse', gh.board, gh.company),
              location: job.location?.name,
              department: job.departments?.[0]?.name || dept,
              active: true,
            };
          if (upsertJob(candidate)) added++;
          rememberDescription(candidate, job.content);
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
  const LEVER_BOARDS: Array<{ board: string; company: string; apiHost?: string }> = [
    { board: 'crypto', company: 'Crypto.com' },
    { board: 'aavelabs', company: 'Aave Labs', apiHost: 'https://api.eu.lever.co' },
    { board: 'funxyz', company: 'Fun.xyz' },
    { board: 'serotonin', company: 'Serotonin' },
    { board: 'renegade', company: 'Renegade' },
    { board: 'waterfall', company: 'Waterfall' },
    { board: 'relay', company: 'Relay' },

    { board: 'immutable', company: 'Immutable' },
    { board: 'anchorage', company: 'Anchorage Digital' },
    { board: 'moonpay', company: 'MoonPay' },
    { board: 'ledger', company: 'Ledger' },
    { board: '1inch', company: '1inch' },
    { board: 'zerion', company: 'Zerion' },
    // --- Crypto exchanges ---
    { board: 'gate', company: 'Gate.io' },
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
    // --- Apr 2026 expansion (wave 4) ---
    { board: 'newton', company: 'Newton' },
    // --- Massive May 2026 expansion ---
    { board: 'coins', company: 'Coins.ph' },
    { board: 'aragon', company: 'Aragon' },
    // --- Regional Exchanges & Protocols ---
    { board: 'swissborg', company: 'SwissBorg' },
    { board: 'plume', company: 'Plume Network' },
  ];

  for (const lv of LEVER_BOARDS) {
    registerDirectSource('Lever', lv.board, lv.company);
    try {
      const res = await fetch(`${lv.apiHost || 'https://api.lever.co'}/v0/postings/${lv.board}?mode=json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const postings = await res.json() as Array<{
        text: string;
        hostedUrl: string;
        id: string;
        createdAt: number;
        categories?: { team?: string; department?: string; location?: string };
        opening?: string;
        description?: string;
        descriptionBody?: string;
        salaryDescription?: string;
        lists?: Array<{ text?: string; content?: string }>;
        additional?: string;
      }>;

      removeJobs((job) => matchesRefreshedSource(job, 'Lever', lv.board, lv.company));
      removeAggregatorCopiesForCompany(lv.company);

      let added = 0;
      for (const posting of postings) {
        const title = cleanTitle(posting.text);
        const company = normalizeCompany(lv.company);
        const link = posting.hostedUrl;
        const date = posting.createdAt ? new Date(posting.createdAt).toISOString() : new Date().toISOString();
        const content = combineLeverContent(posting);

        if (link && title && title.length <= 180 && !title.toLowerCase().includes('bounty') && isConcreteOpening(title) && isUsableDescription(content)) {
          const candidate: CachedJob = {
              id: posting.id,
              title,
              company,
              link,
              date,
              source: sourceLabel('Lever', lv.board, lv.company),
              location: posting.categories?.location,
              department: posting.categories?.department || posting.categories?.team,
              active: true,
          };
          if (upsertJob(candidate)) added++;
          rememberDescription(candidate, content);
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

    // High-signal crypto employers verified against their official careers pages.
    { board: 'chainalysis-careers', company: 'Chainalysis' },
    { board: 'chainalysis-government-solutions', company: 'Chainalysis' },
    { board: 'blockstream', company: 'Blockstream' },
    { board: 'Talos-Trading', company: 'Talos' },
    { board: 'keyrock', company: 'Keyrock' },
    { board: 'coinhako', company: 'Coinhako' },
    { board: 'Hyperliquid Labs', company: 'Hyperliquid Labs' },
    { board: 'Tools for Humanity', company: 'Tools for Humanity' },
    { board: 'Solana Foundation', company: 'Solana Foundation' },
    { board: 'Sui Foundation', company: 'Sui Foundation' },
    { board: 'ethereum-foundation', company: 'Ethereum Foundation' },
    { board: 'category-labs', company: 'Category Labs' },
    { board: 'monad.foundation', company: 'Monad Foundation' },
    { board: 'lightning', company: 'Lightning Labs' },
    { board: 'matter-labs', company: 'Matter Labs' },
    { board: 'solanalabs', company: 'Solana Labs' },
    { board: 'ether.fi', company: 'ether.fi' },
    { board: 'rain', company: 'Rain' },
    { board: 'tempo-xyz', company: 'Tempo' },
    { board: '0g', company: '0G Labs' },
    { board: 'coinflow', company: 'Coinflow' },
    { board: 'allium', company: 'Allium' },
    { board: 'braiins', company: 'Braiins' },
    { board: 'luxor', company: 'Luxor Technology' },
    { board: 'ellipsislabs', company: 'Ellipsis Labs' },
    { board: 'grvt', company: 'GRVT' },
    { board: 'doublezero', company: 'DoubleZero' },
    { board: 'symbiotic', company: 'Symbiotic' },
    { board: 'stargate-foundation', company: 'Stargate Foundation' },
    { board: 'plasma', company: 'Plasma' },
    { board: 'sahara', company: 'Sahara AI' },
    { board: 'ethglobal', company: 'ETHGlobal' },
    { board: 'cow-dao', company: 'CoW DAO' },
    { board: 'cointracker', company: 'CoinTracker' },
    { board: 'lightspark', company: 'Lightspark' },
    { board: 'cryptio', company: 'Cryptio' },
    { board: 'alpenlabs', company: 'Alpen Labs' },
    { board: 'improbable', company: 'Improbable' },
    { board: 'p2p.org', company: 'P2P.org' },
    { board: 'world-foundation', company: 'World Foundation' },
    { board: 'kraken.com', company: 'Kraken' },
    { board: 'starknetfoundation', company: 'Starknet Foundation' },
    { board: 'Lido.fi', company: 'Lido' },
    { board: 'veda', company: 'Veda' },
    { board: 'walrus', company: 'Walrus Foundation' },
    { board: 'blackbird-labs-inc', company: 'Blackbird Labs' },
    { board: 'alchemy', company: 'Alchemy' },

    // L1/L2 Chains
    { board: 'polygon-labs', company: 'Polygon Labs' },
    { board: 'mystenlabs', company: 'Mysten Labs' },
    { board: 'Injective', company: 'Injective' },
    { board: 'Conduit', company: 'Conduit' },
    { board: 'Succinct', company: 'Succinct' },
    { board: 'SkyEcosystem', company: 'Sky (MakerDAO)' },
    // Exchanges & Trading
    { board: 'Polymarket', company: 'Polymarket' },
    // DeFi
    { board: 'Uniswap', company: 'Uniswap' },
    { board: 'Morpho', company: 'Morpho' },
    { board: 'Orca', company: 'Orca' },
    // NFT & Social
    { board: 'OpenSea', company: 'OpenSea' },
    { board: 'MagicEden', company: 'Magic Eden' },
    { board: 'Sorare', company: 'Sorare' },
    // Wallets & Auth
    { board: 'Phantom', company: 'Phantom' },
    { board: 'Turnkey', company: 'Turnkey' },
    { board: 'SpruceID', company: 'Spruce' },
    // Infra & Dev Tools
    { board: 'QuickNode', company: 'QuickNode' },
    { board: 'Syndica', company: 'Syndica' },
    { board: 'Helius', company: 'Helius' },
    { board: '0x', company: '0x' },
    { board: 'LI.FI', company: 'LI.FI' },
    { board: 'PythNetwork', company: 'Pyth Network' },
    // Analytics & Security
    { board: 'Elliptic', company: 'Elliptic' },
    { board: 'Blockdaemon', company: 'Blockdaemon' },
    // L1 Chains
    { board: 'Stellar', company: 'Stellar' },
    // Infra & Security
    { board: 'Nethermind', company: 'Nethermind' },
    { board: 'trm-labs', company: 'TRM Labs' },
    // Wallets & SDK
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
    // --- Apr 2026 expansion (wave 3) ---
    { board: 'seifoundation', company: 'Sei' },
    // --- Apr 2026 expansion (wave 4) ---
    { board: 'trust-wallet', company: 'Trust Wallet' },
    { board: 'bitvavo', company: 'Bitvavo' },
    { board: 'variant-fund', company: 'Variant Fund' },
    // --- Additional Top Web3 Companies (August 2026 expansion) ---
    { board: 'swan', company: 'Swan Bitcoin' },
    { board: 'union', company: 'Union' },
  ];

  for (const ab of ASHBY_BOARDS) {
    registerDirectSource('Ashby', ab.board, ab.company);
    try {
      const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(ab.board)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { jobs: Array<{
        title: string;
        jobUrl: string;
        id: string;
        publishedAt: string;
        location?: string;
        department?: string;
        team?: string;
        descriptionHtml?: string;
      }> };

      removeJobs((job) => matchesRefreshedSource(job, 'Ashby', ab.board, ab.company));
      removeAggregatorCopiesForCompany(ab.company);

      let added = 0;
      for (const job of data.jobs) {
        const title = cleanTitle(job.title);
        const company = normalizeCompany(ab.company);
        const link = job.jobUrl;
        const date = job.publishedAt || new Date().toISOString();

        if (link && title && title.length <= 180 && !title.toLowerCase().includes('bounty') && isConcreteOpening(title)) {
          const candidate: CachedJob = {
              id: job.id,
              title,
              company,
              link,
              date,
              source: sourceLabel('Ashby', ab.board, ab.company),
              location: job.location,
              department: job.department || job.team,
              active: true,
            };
          if (upsertJob(candidate)) added++;
          rememberDescription(candidate, job.descriptionHtml);
        }
      }
      feedsOk++;
      console.log(`  ✅ Ashby (${ab.company}): ${data.jobs.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Ashby (${ab.company}): ${error.message}`);
    }
  }

  // Some employers use Ashby's public hosted board but disable its posting API.
  // The hosted HTML still exposes the same live posting data and full details.
  const ASHBY_HTML_BOARDS = [
    { board: 'chainlink-labs', company: 'Chainlink Labs' },
  ];

  for (const ab of ASHBY_HTML_BOARDS) {
    registerDirectSource('Ashby', ab.board, ab.company);
    try {
      const boardUrl = `https://jobs.ashbyhq.com/${ab.board}`;
      const boardRes = await fetch(boardUrl);
      if (!boardRes.ok) throw new Error(`HTTP ${boardRes.status}`);
      const boardData = extractAshbyAppData(await boardRes.text());
      const postings = boardData?.jobBoard?.jobPostings as Array<{
        id: string;
        title: string;
        locationName?: string;
        teamId?: string;
      }> | undefined;
      if (!Array.isArray(postings)) throw new Error('Missing Ashby hosted job list');

      removeJobs((job) => matchesRefreshedSource(job, 'Ashby', ab.board, ab.company));
      removeAggregatorCopiesForCompany(ab.company);
      let added = 0;

      await runInBatches(postings, 8, async (posting) => {
        const title = cleanTitle(posting.title);
        if (!title || !isConcreteOpening(title)) return;

        const link = `${boardUrl}/${posting.id}`;
        let detail: {
          id?: string;
          title?: string;
          descriptionHtml?: string;
          locationName?: string;
          departmentName?: string;
          teamNames?: string[];
          isListed?: boolean;
        } = {};
        let datePosted: string | undefined;
        try {
          const detailRes = await fetch(link);
          if (detailRes.ok) {
            const detailHtml = await detailRes.text();
            detail = extractAshbyAppData(detailHtml)?.posting || {};
            datePosted = extractJsonLdJobPosting(detailHtml)?.datePosted;
          }
        } catch {
          // Keep the verified live listing, but never invent missing detail text.
        }
        if (detail.isListed === false) return;

        const candidate: CachedJob = {
          id: detail.id || posting.id,
          title: cleanTitle(detail.title) || title,
          company: ab.company,
          link,
          date: datePosted || new Date().toISOString(),
          dateVerified: Boolean(datePosted),
          source: sourceLabel('Ashby', ab.board, ab.company),
          location: detail.locationName || posting.locationName,
          department: detail.departmentName || detail.teamNames?.[0],
          active: true,
        };
        const identity = getJobIdentity(candidate);
        candidate.date = datePosted || persistedDates.get(identity) || candidate.date;
        candidate.dateVerified = datePosted
          ? true
          : persistedDateVerification.get(identity) ?? false;
        if (upsertJob(candidate)) added++;
        rememberDescription(candidate, detail.descriptionHtml);
      });

      feedsOk++;
      console.log(`  ✅ Ashby hosted (${ab.company}): ${postings.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Ashby hosted (${ab.company}): ${error.message}`);
    }
  }

  // --- Workable API Sources ---
  const WORKABLE_BOARDS = [
    { board: 'aethir', company: 'Aethir' },
    { board: 'anza-xyz', company: 'Anza' },
    { board: 'walletconnect', company: 'WalletConnect' },
    { board: 'io-global', company: 'IO Global' },
    { board: 'hextrust', company: 'Hex Trust' },
    { board: 'crypto-finance', company: 'Crypto Finance' },
    { board: 'gomining', company: 'GoMining' },
    // --- Regional Exchanges Expansion ---
    { board: 'bitoasis', company: 'BitOasis' },
    { board: 'ndax', company: 'Ndax' },
    { board: 'coinjar', company: 'CoinJar' },
    { board: 'giottus', company: 'Giottus' },
  ];

  for (const wb of WORKABLE_BOARDS) {
    registerDirectSource('Workable', wb.board, wb.company);
    try {
      const res = await fetch(`https://apply.workable.com/api/v1/widget/accounts/${wb.board}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { jobs: Array<{
        title: string;
        url?: string;
        application_url?: string;
        shortcode?: string;
        code?: string;
        published_on?: string;
        created_at?: string;
        department?: string;
        city?: string;
        country?: string;
      }> };

      removeJobs((job) => matchesRefreshedSource(job, 'Workable', wb.board, wb.company));
      removeAggregatorCopiesForCompany(wb.company);

      let added = 0;
      await runInBatches(data.jobs, 10, async (job) => {
        const id = job.shortcode || job.code;
        if (!id) return;

        let detail: {
          title?: string;
          published?: string;
          department?: string;
          description?: string;
          requirements?: string;
          benefits?: string;
          location?: { city?: string; country?: string };
          locations?: Array<{ city?: string; country?: string }>;
        } = {};
        try {
          const detailRes = await fetch(`https://apply.workable.com/api/v1/accounts/${wb.board}/jobs/${id}`);
          if (detailRes.ok) detail = await detailRes.json() as typeof detail;
        } catch {
          // Keep the verified listing and omit optional fields on detail failure.
        }

        const title = cleanTitle(detail.title || job.title);
        const company = normalizeCompany(wb.company);
        const link = job.url || job.application_url || `https://apply.workable.com/${wb.board}/j/${id}/`;
        const date = detail.published || job.published_on || job.created_at || new Date().toISOString();
        if (!link || !title || title.length > 180 || title.toLowerCase().includes('bounty')) return;

        const detailLocations = detail.locations || (detail.location ? [detail.location] : []);
        const location = detailLocations
          .map((item) => [item.city, item.country].filter(Boolean).join(', '))
          .filter(Boolean)
          .join(' / ');
        const candidate: CachedJob = {
          id,
          title,
          company,
          link,
          date,
          source: sourceLabel('Workable', wb.board, wb.company),
          location: location || [job.city, job.country].filter(Boolean).join(', ') || undefined,
          department: detail.department || job.department,
          active: true,
        };
        if (upsertJob(candidate)) added++;
        rememberDescription(
          candidate,
          [detail.description, detail.requirements, detail.benefits].filter(Boolean).join('\n')
        );
      });
      feedsOk++;
      console.log(`  ✅ Workable (${wb.company}): ${data.jobs.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Workable (${wb.company}): ${error.message}`);
    }
  }

  // --- Recruitee API Sources ---
  const RECRUITEE_BOARDS = [
    { board: 'tether', company: 'Tether' },
  ];

  for (const rt of RECRUITEE_BOARDS) {
    registerDirectSource('Recruitee', rt.board, rt.company);
    try {
      const res = await fetch(`https://${rt.board}.recruitee.com/api/offers`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { offers: Array<{
        title: string;
        careers_url: string;
        id: number;
        published_at: string;
        department?: string;
        location?: string;
        description?: string;
        requirements?: string;
      }> };

      removeJobs((job) => matchesRefreshedSource(job, 'Recruitee', rt.board, rt.company));
      removeAggregatorCopiesForCompany(rt.company);

      let added = 0;
      for (const offer of data.offers) {
        const title = cleanTitle(offer.title);
        const company = normalizeCompany(rt.company);
        const link = offer.careers_url;
        const date = offer.published_at || new Date().toISOString();

        if (link && title && title.length <= 180 && !title.toLowerCase().includes('bounty')) {
          const candidate: CachedJob = {
              id: String(offer.id),
              title,
              company,
              link,
              date,
              source: sourceLabel('Recruitee', rt.board, rt.company),
              location: offer.location,
              department: offer.department,
              active: true,
            };
          if (upsertJob(candidate)) added++;
          rememberDescription(candidate, [offer.description, offer.requirements].filter(Boolean).join('\n'));
        }
      }
      feedsOk++;
      console.log(`  ✅ Recruitee (${rt.company}): ${data.offers.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Recruitee (${rt.company}): ${error.message}`);
    }
  }

  // --- Workday Sources ---
  // Workday's public CXS endpoint exposes a complete listing and a separate
  // detail document with the employer-authored description.
  const WORKDAY_BOARDS = [
    {
      tenant: 'circle',
      site: 'Circle',
      company: 'Circle',
      host: 'https://circle.wd1.myworkdayjobs.com',
    },
  ];

  for (const wd of WORKDAY_BOARDS) {
    const board = `${wd.tenant}/${wd.site}`;
    registerDirectSource('Workday', board, wd.company);
    try {
      const endpoint = `${wd.host}/wday/cxs/${wd.tenant}/${wd.site}/jobs`;
      const postings: Array<{ title: string; externalPath: string; locationsText?: string }> = [];
      let total = 1;

      for (let offset = 0; offset < total; offset += 20) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appliedFacets: {}, limit: 20, offset, searchText: '' }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as {
          total: number;
          jobPostings: Array<{ title: string; externalPath: string; locationsText?: string }>;
        };
        // Workday reports the total only on the first page and returns zero on
        // later offsets, so never shrink the pagination bound.
        total = Math.max(total, data.total);
        postings.push(...data.jobPostings);
      }

      removeJobs((job) => matchesRefreshedSource(job, 'Workday', board, wd.company));
      removeAggregatorCopiesForCompany(wd.company);
      let added = 0;

      await runInBatches(postings, 10, async (posting) => {
        const detailUrl = `${wd.host}/wday/cxs/${wd.tenant}/${wd.site}${posting.externalPath}`;
        let detail: {
          id?: string;
          title?: string;
          jobDescription?: string;
          location?: string;
          jobReqId?: string;
          startDate?: string;
          externalUrl?: string;
        } = {};
        try {
          const detailRes = await fetch(detailUrl);
          if (detailRes.ok) {
            const body = await detailRes.json() as { jobPostingInfo?: typeof detail };
            detail = body.jobPostingInfo || {};
          }
        } catch {
          // The listing still identifies a live role; omit unverified details.
        }

        const title = cleanTitle(detail.title || posting.title);
        const link = detail.externalUrl || `${wd.host}/${wd.site}${posting.externalPath}`;
        if (!title || !isConcreteOpening(title)) return;
        const identityDraft: CachedJob = {
          id: detail.jobReqId || detail.id || posting.externalPath,
          title,
          company: wd.company,
          link,
          date: detail.startDate || new Date().toISOString(),
          source: sourceLabel('Workday', board, wd.company),
          location: detail.location || posting.locationsText,
          active: true,
        };
        identityDraft.date = detail.startDate
          || persistedDates.get(getJobIdentity(identityDraft))
          || identityDraft.date;
        if (upsertJob(identityDraft)) added++;
        rememberDescription(identityDraft, detail.jobDescription);
      });

      feedsOk++;
      console.log(`  ✅ Workday (${wd.company}): ${postings.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Workday (${wd.company}): ${error.message}`);
    }
  }

  // --- SmartRecruiters Sources ---
  const SMARTRECRUITERS_BOARDS = [
    { board: 'Solflare', company: 'Solflare' },
  ];

  for (const sr of SMARTRECRUITERS_BOARDS) {
    registerDirectSource('SmartRecruiters', sr.board, sr.company);
    try {
      const listRes = await fetch(`https://api.smartrecruiters.com/v1/companies/${sr.board}/postings?limit=100&offset=0`);
      if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);
      const list = await listRes.json() as {
        content: Array<{
          id: string;
          name: string;
          releasedDate?: string;
          postingUrl?: string;
          location?: { fullLocation?: string };
          department?: { label?: string };
        }>;
      };

      removeJobs((job) => matchesRefreshedSource(job, 'SmartRecruiters', sr.board, sr.company));
      removeAggregatorCopiesForCompany(sr.company);
      let added = 0;
      await runInBatches(list.content, 10, async (posting) => {
        const detailRes = await fetch(`https://api.smartrecruiters.com/v1/companies/${sr.board}/postings/${posting.id}`);
        if (!detailRes.ok) return;
        const detail = await detailRes.json() as typeof posting & {
          postingUrl?: string;
          jobAd?: { sections?: Record<string, { title?: string; text?: string }> };
        };
        const title = cleanTitle(detail.name || posting.name);
        const link = detail.postingUrl || posting.postingUrl;
        if (!title || !link || !isConcreteOpening(title)) return;
        const candidate: CachedJob = {
          id: posting.id,
          title,
          company: sr.company,
          link,
          date: detail.releasedDate || posting.releasedDate || new Date().toISOString(),
          source: sourceLabel('SmartRecruiters', sr.board, sr.company),
          location: detail.location?.fullLocation || posting.location?.fullLocation,
          department: detail.department?.label || posting.department?.label,
          active: true,
        };
        if (upsertJob(candidate)) added++;
        const content = Object.values(detail.jobAd?.sections || {})
          .flatMap((section) => [section.title ? `<h3>${section.title}</h3>` : '', section.text || ''])
          .filter(Boolean)
          .join('\n');
        rememberDescription(candidate, content);
      });
      feedsOk++;
      console.log(`  ✅ SmartRecruiters (${sr.company}): ${list.content.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ SmartRecruiters (${sr.company}): ${error.message}`);
    }
  }

  // --- Breezy Sources ---
  const BREEZY_BOARDS = [
    { board: 'bitdeer', company: 'Bitdeer' },
    { board: 'nexo', company: 'Nexo' },
    { board: 'zero-hash', company: 'Zero Hash' },
  ];

  for (const bz of BREEZY_BOARDS) {
    registerDirectSource('Breezy', bz.board, bz.company);
    try {
      const res = await fetch(`https://${bz.board}.breezy.hr/json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const postings = await res.json() as Array<{
        id: string;
        name: string;
        url: string;
        published_date?: string;
        department?: string;
        location?: { name?: string };
      }>;

      removeJobs((job) => matchesRefreshedSource(job, 'Breezy', bz.board, bz.company));
      removeAggregatorCopiesForCompany(bz.company);
      let added = 0;
      const concretePostings = postings.filter((posting) => isConcreteOpening(posting.name));
      await runInBatches(concretePostings, 12, async (posting) => {
        const title = cleanTitle(posting.name);
        if (!title || !posting.url) return;
        const candidate: CachedJob = {
          id: posting.id,
          title,
          company: bz.company,
          link: posting.url,
          date: posting.published_date || new Date().toISOString(),
          source: sourceLabel('Breezy', bz.board, bz.company),
          location: posting.location?.name,
          department: posting.department,
          active: true,
        };
        candidate.date = posting.published_date
          || persistedDates.get(getJobIdentity(candidate))
          || candidate.date;
        if (upsertJob(candidate)) added++;

        try {
          const pageRes = await fetch(posting.url);
          if (pageRes.ok) {
            const html = await pageRes.text();
            rememberDescription(candidate, extractJsonLdJobDescription(html) || extractBreezyJobDescription(html));
          }
        } catch {
          // Preserve the verified listing without fabricating missing content.
        }
      });
      feedsOk++;
      console.log(`  ✅ Breezy (${bz.company}): ${concretePostings.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Breezy (${bz.company}): ${error.message}`);
    }
  }

  // --- BambooHR Sources ---
  const BAMBOO_BOARDS = [
    { board: 'bitcoin', company: 'Bitcoin.com' },
    { board: 'uphold', company: 'Uphold' },
    { board: 'chainstack', company: 'Chainstack' },
  ];

  for (const bh of BAMBOO_BOARDS) {
    registerDirectSource('BambooHR', bh.board, bh.company);
    try {
      const res = await fetch(`https://${bh.board}.bamboohr.com/careers/list`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as {
        result: Array<{
          id: string;
          jobOpeningName: string;
          departmentLabel?: string;
          atsLocation?: { city?: string; state?: string; country?: string };
        }>;
      };
      removeJobs((job) => matchesRefreshedSource(job, 'BambooHR', bh.board, bh.company));
      removeAggregatorCopiesForCompany(bh.company);
      const openings = data.result.filter((opening) => isConcreteOpening(opening.jobOpeningName));
      let added = 0;

      await runInBatches(openings, 8, async (opening) => {
        const detailRes = await fetch(`https://${bh.board}.bamboohr.com/careers/${opening.id}/detail`);
        if (!detailRes.ok) return;
        const detailData = await detailRes.json() as {
          result?: { jobOpening?: {
            jobOpeningName?: string;
            jobOpeningShareUrl?: string;
            departmentLabel?: string;
            description?: string;
            datePosted?: string;
            atsLocation?: { city?: string; state?: string; country?: string };
          } };
        };
        const detail = detailData.result?.jobOpening;
        const title = cleanTitle(detail?.jobOpeningName || opening.jobOpeningName);
        const link = detail?.jobOpeningShareUrl || `https://${bh.board}.bamboohr.com/careers/${opening.id}`;
        if (!title) return;
        const location = detail?.atsLocation || opening.atsLocation;
        const candidate: CachedJob = {
          id: opening.id,
          title,
          company: bh.company,
          link,
          date: detail?.datePosted || new Date().toISOString(),
          source: sourceLabel('BambooHR', bh.board, bh.company),
          location: [location?.city, location?.state, location?.country].filter(Boolean).join(', ') || undefined,
          department: detail?.departmentLabel || opening.departmentLabel,
          active: true,
        };
        candidate.date = detail?.datePosted
          || persistedDates.get(getJobIdentity(candidate))
          || candidate.date;
        if (upsertJob(candidate)) added++;
        rememberDescription(candidate, detail?.description);
      });
      feedsOk++;
      console.log(`  ✅ BambooHR (${bh.company}): ${openings.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ BambooHR (${bh.company}): ${error.message}`);
    }
  }

  // --- Comeet Sources ---
  const COMEET_BOARDS = [
    { board: '41.009', token: '14952452466D3DB7B61495240B91', company: 'eToro' },
  ];

  for (const cm of COMEET_BOARDS) {
    registerDirectSource('Comeet', cm.board, cm.company);
    try {
      const url = `https://www.comeet.co/careers-api/2.0/company/${cm.board}/positions?token=${cm.token}&details=true`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const postings = await res.json() as Array<{
        uid: string;
        name: string;
        department?: string;
        time_updated?: string;
        url_active_page?: string;
        url_comeet_hosted_page?: string;
        location?: { name?: string };
        details?: Array<{ name?: string; value?: string; order?: number }>;
      }>;
      removeJobs((job) => matchesRefreshedSource(job, 'Comeet', cm.board, cm.company));
      removeAggregatorCopiesForCompany(cm.company);
      let added = 0;
      for (const posting of postings) {
        const title = cleanTitle(posting.name);
        const link = posting.url_active_page || posting.url_comeet_hosted_page;
        if (!title || !link || !isConcreteOpening(title)) continue;
        const candidate: CachedJob = {
          id: posting.uid,
          title,
          company: cm.company,
          link,
          date: posting.time_updated || new Date().toISOString(),
          source: sourceLabel('Comeet', cm.board, cm.company),
          location: posting.location?.name,
          department: posting.department,
          active: true,
        };
        if (upsertJob(candidate)) added++;
        const content = [...(posting.details || [])]
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .flatMap((section) => [section.name ? `<h3>${section.name}</h3>` : '', section.value || ''])
          .filter(Boolean)
          .join('\n');
        rememberDescription(candidate, content);
      }
      feedsOk++;
      console.log(`  ✅ Comeet (${cm.company}): ${postings.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Comeet (${cm.company}): ${error.message}`);
    }
  }

  // --- Teamtailor public RSS Sources ---
  const TEAMTAILOR_BOARDS = [
    { board: 'crossmint.na', company: 'Crossmint', url: 'https://crossmint.na.teamtailor.com/jobs.rss' },
    { board: 'crystalintelligence', company: 'Crystal Intelligence', url: 'https://crystalintelligence.teamtailor.com/jobs.rss' },
  ];
  const rssParser = new Parser();

  for (const tt of TEAMTAILOR_BOARDS) {
    registerDirectSource('Teamtailor', tt.board, tt.company);
    try {
      const feed = await rssParser.parseURL(tt.url);
      removeJobs((job) => matchesRefreshedSource(job, 'Teamtailor', tt.board, tt.company));
      removeAggregatorCopiesForCompany(tt.company);
      let added = 0;
      for (const item of feed.items) {
        const title = cleanTitle(item.title);
        const link = item.link;
        if (!title || !link || !isConcreteOpening(title)) continue;
        const candidate: CachedJob = {
          id: item.guid || link,
          title,
          company: tt.company,
          link,
          date: item.isoDate || item.pubDate || new Date().toISOString(),
          source: sourceLabel('Teamtailor', tt.board, tt.company),
          active: true,
        };
        if (upsertJob(candidate)) added++;
        rememberDescription(candidate, item.content);
      }
      feedsOk++;
      console.log(`  ✅ Teamtailor (${tt.company}): ${feed.items.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Teamtailor (${tt.company}): ${error.message}`);
    }
  }

  // --- Rippling Sources ---
  // Rippling's public API can collapse location variants for the same job UUID.
  // Detail responses contain the employer-authored description and post date.
  const RIPPLING_BOARDS = [
    { board: 'riot-platforms-careers', company: 'Riot Platforms' },
  ];

  for (const rp of RIPPLING_BOARDS) {
    registerDirectSource('Rippling', rp.board, rp.company);
    try {
      const listRes = await fetch(
        `https://ats.rippling.com/api/v2/board/${rp.board}/jobs?groupJobsByLocation=true&page=0&pageSize=1000`
      );
      if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);
      const list = await listRes.json() as { items: Array<{
        id: string;
        name: string;
        url: string;
        department?: { name?: string };
        locations?: Array<{ name?: string }>;
      }> };
      if (!Array.isArray(list.items)) throw new Error('Missing Rippling job list');

      removeJobs((job) => matchesRefreshedSource(job, 'Rippling', rp.board, rp.company));
      removeAggregatorCopiesForCompany(rp.company);
      let added = 0;

      await runInBatches(list.items, 8, async (posting) => {
        const title = cleanTitle(posting.name);
        if (!title || !posting.url || !isConcreteOpening(title)) return;

        let detail: {
          uuid?: string;
          name?: string;
          description?: Record<string, string>;
          workLocations?: string[];
          department?: { name?: string };
          createdOn?: string;
          url?: string;
        } = {};
        try {
          const detailRes = await fetch(
            `https://ats.rippling.com/api/v2/board/${rp.board}/jobs/${posting.id}`
          );
          if (detailRes.ok) {
            detail = await detailRes.json() as typeof detail;
          }
        } catch {
          // The verified board entry is still usable without optional details.
        }

        const candidate: CachedJob = {
          id: detail.uuid || posting.id,
          title: cleanTitle(detail.name) || title,
          company: rp.company,
          link: detail.url || posting.url,
          date: detail.createdOn || new Date().toISOString(),
          source: sourceLabel('Rippling', rp.board, rp.company),
          location: (detail.workLocations || posting.locations?.map((location) => location.name).filter(Boolean) || []).join(', ') || undefined,
          department: detail.department?.name || posting.department?.name,
          active: true,
        };
        candidate.date = detail.createdOn
          || persistedDates.get(getJobIdentity(candidate))
          || candidate.date;
        if (upsertJob(candidate)) added++;
        rememberDescription(candidate, Object.values(detail.description || {}).join('\n'));
      });

      feedsOk++;
      console.log(`  ✅ Rippling (${rp.company}): ${list.items.length} unique jobs, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ Rippling (${rp.company}): ${error.message}`);
    }
  }

  // Verified employer-owned career pages that do not expose a conventional
  // ATS feed. Each adapter discovers only links on the employer's live index
  // and stores the employer-written detail page content.
  const FIRST_PARTY_CAREER_BOARDS = [
    {
      board: 'etherscan-careers',
      company: 'Etherscan',
      indexUrl: 'https://etherscan.io/careers',
      linkSelector: 'a[href*="/careers-inner/"]',
      pathPattern: /^\/careers-inner\/[^/]+$/,
      titleSelector: 'main h1',
      locationSelector: 'main .row.justify-content-center.text-center .text-cap',
      contentSelector: '#about, #role, #apply',
    },
    {
      board: 'streamingfast-careers',
      company: 'StreamingFast',
      indexUrl: 'https://www.streamingfast.io/careers',
      linkSelector: 'a[href^="/careers/"]',
      pathPattern: /^\/careers\/[^/]+$/,
      titleSelector: 'main h1',
      locationSelector: 'main section:first-of-type h1 + p',
      contentSelector: 'main section:nth-of-type(2) .max-w-3xl',
    },
    {
      board: 'zama-careers',
      company: 'Zama',
      indexUrl: 'https://jobs.zama.org/',
      linkSelector: 'a.jobs-list-item-link',
      pathPattern: /^\/jobs\/[^/]+$/,
      titleSelector: 'h1.main-header-title',
      locationSelector: '.sticky-header-details li:first-child',
      contentSelector: '.block-job-description, .block-job-profile',
    },
  ];

  for (const fp of FIRST_PARTY_CAREER_BOARDS) {
    registerDirectSource('FirstParty', fp.board, fp.company);
    try {
      const indexRes = await fetch(fp.indexUrl);
      if (!indexRes.ok) throw new Error(`HTTP ${indexRes.status}`);
      const indexHtml = await indexRes.text();
      const $index = load(indexHtml);
      const links = [...new Set(
        $index(fp.linkSelector)
          .map((_, element) => $index(element).attr('href'))
          .get()
          .filter(Boolean)
          .map((href) => new URL(href, fp.indexUrl).toString())
          .filter((href) => fp.pathPattern.test(new URL(href).pathname))
      )];
      if (links.length === 0) {
        throw new Error('No job detail links found; preserving the previous snapshot');
      }

      const staged: Array<{ job: CachedJob; content: string }> = [];

      await runInBatches(links, 6, async (link) => {
        const detailRes = await fetch(link);
        if (!detailRes.ok) throw new Error(`Detail HTTP ${detailRes.status}: ${link}`);
        const html = await detailRes.text();
        const $ = load(html);
        const title = cleanTitle($(fp.titleSelector).first().text());
        if (!title) throw new Error(`Missing title in detail page: ${link}`);
        if (!isConcreteOpening(title)) return;

        const content = $(fp.contentSelector)
          .map((_, element) => $(element).html())
          .get()
          .filter(Boolean)
          .join('\n');
        if (!isUsableDescription(content)) {
          throw new Error(`Missing substantial employer content: ${link}`);
        }
        const location = cleanTitle($(fp.locationSelector).first().text());
        const datePosted = html.match(/"datePosted"\s*:\s*"([^"]+)"/)?.[1];
        const candidate: CachedJob = {
          id: new URL(link).pathname.split('/').filter(Boolean).pop() || link,
          title,
          company: fp.company,
          link,
          date: datePosted || new Date().toISOString(),
          dateVerified: Boolean(datePosted),
          source: sourceLabel('FirstParty', fp.board, fp.company),
          location,
          active: true,
        };
        const identity = getJobIdentity(candidate);
        candidate.date = datePosted
          || persistedDates.get(identity)
          || candidate.date;
        candidate.dateVerified = datePosted
          ? true
          : persistedDateVerification.get(identity) ?? false;
        staged.push({ job: candidate, content });
      });

      removeJobs((job) => matchesRefreshedSource(job, 'FirstParty', fp.board, fp.company));
      removeAggregatorCopiesForCompany(fp.company);
      let added = 0;
      for (const { job, content } of staged) {
        if (upsertJob(job)) added++;
        rememberDescription(job, content);
      }

      feedsOk++;
      console.log(`  ✅ First-party (${fp.company}): ${links.length} items, ${added} new`);
    } catch (error: any) {
      feedsFailed++;
      console.warn(`  ❌ First-party (${fp.company}): ${error.message}`);
    }
  }

  const elapsed = Date.now() - fetchStart;
  console.log(`\n⏱️ Fetched in ${elapsed}ms (${feedsOk} ok, ${feedsFailed} failed)`);

  // Convert to array and sort by date
  let allJobs = Array.from(jobMap.values());

  // Direct ATS feeds are authoritative: an older posting remains active until
  // it disappears from a successful board response. Aggregator discoveries are
  // published only when employer-authored content was verified and cached;
  // otherwise they remain low-confidence leads rather than public job pages.
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  allJobs = allJobs.filter((job) => (
    isDirectSource(job.source)
      ? job.active !== false && configuredDirectSources.has(job.source.toLowerCase())
      : new Date(job.date) > thirtyDaysAgo
        && isUsableDescription(
          refreshedDescriptions.get(getJobContentKey(job))
            || existingDescriptions[getJobContentKey(job)]
            || existingDescriptions[job.id]
        )
  ));

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

    // A first-party ATS is authoritative for the employer. Do not silently
    // discard valid operations, facilities, support, or other non-engineering
    // roles; Coinbase and every other company page should reflect its full board.
    if (isDirectSource(job.source)) return isConcreteOpening(job.title);

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
  fs.writeFileSync(cachePath, `${JSON.stringify(allJobs, null, 2)}\n`);

  // Keep only employer-provided descriptions for jobs that are still
  // published. Composite source keys avoid the old cross-company ID clashes.
  const nextDescriptions: Record<string, string> = {};
  for (const job of allJobs) {
    const key = getJobContentKey(job);
    const content = refreshedDescriptions.get(key)
      || existingDescriptions[key]
      || existingDescriptions[job.id];
    if (isUsableDescription(content)) nextDescriptions[key] = content;
  }
  fs.writeFileSync(descriptionsPath, `${JSON.stringify(nextDescriptions, null, 2)}\n`);

  console.log(`\n✅ Cache updated: ${allJobs.length} jobs written to content/jobs-cache.json`);
  console.log(`🏢 ${new Set(allJobs.map((job) => job.company)).size} companies; ${nextDescriptions ? Object.keys(nextDescriptions).length : 0} verified descriptions`);
  console.log(`📅 Date range: ${allJobs[allJobs.length - 1]?.date || 'N/A'} to ${allJobs[0]?.date || 'N/A'}`);
}

refreshJobsCache().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
