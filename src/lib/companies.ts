'use server';

import type { Company, Job } from '@/types';
import { getJobs } from './jobs';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { COMPANY_RICH_ABOUT } from './company-profiles';

interface CompanyContent {
 website?: string;
}

/**
 * Known ATS/job board hostnames that should NOT be used as company websites
 */
const ATS_HOSTNAMES = new Set([
 'jobs.lever.co', 'jobs.ashbyhq.com', 'job-boards.greenhouse.io',
 'boards.greenhouse.io', 'coinbase.getro.com', 'jobs.multicoin.capital',
 'jobs.solana.com', 'jobs.dragonfly.xyz', 'www.linkedin.com',
 'circle.wd1.myworkdayjobs.com', 'apply.workable.com',
 'jobs.smartrecruiters.com', 'getro.com', 'ats.rippling.com',
 'www.comeet.com', 'wellfound.com',
 'in.linkedin.com', 'sg.linkedin.com', 'il.linkedin.com',
 'de.linkedin.com', 'my.linkedin.com', 'eg.linkedin.com',
]);

const ATS_HOSTNAME_SUFFIXES = [
 '.ashbyhq.com', '.bamboohr.com', '.breezy.hr', '.comeet.com',
 '.greenhouse.io', '.lever.co', '.myworkdayjobs.com', '.rippling.com',
 '.smartrecruiters.com', '.teamtailor.com', '.traffit.com', '.workable.com',
];

function isAtsHostname(hostname: string): boolean {
 const normalized = hostname.toLowerCase();
 return ATS_HOSTNAMES.has(normalized)
  || ATS_HOSTNAME_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
}

/**
 * Hardcoded website overrides for major Web3 companies
 * whose job posts point to standard ATS boards.
 */
const COMPANY_WEBSITE_OVERRIDES: Record<string, string> = {
 'circle': 'https://circle.com',
 'coinmarketcap': 'https://coinmarketcap.com',
 'kucoin': 'https://www.kucoin.com',
 'revolut': 'https://www.revolut.com',
 'bitget': 'https://www.bitget.com',
 'mudrex': 'https://mudrex.com',
 'certik': 'https://certik.com',
 'wintermute': 'https://wintermute.com',
 'wintermute-trading': 'https://wintermute.com',
 'sky-mavis': 'https://skymavis.com',
 'skymavis': 'https://skymavis.com',
 'monad-foundation': 'https://monad.xyz',
 'monad': 'https://monad.xyz',
 'monad-labs': 'https://monad.xyz',
 'digital-asset': 'https://digitalasset.com',
 'digitalassetcorp': 'https://digitalasset.com',
 'ondo-finance': 'https://ondo.finance',
 'ondofinance': 'https://ondo.finance',
 'consensys': 'https://consensys.io',
 'gauntlet': 'https://gauntlet.xyz',
 'zetachain': 'https://zetachain.com',
 'zeta': 'https://zetachain.com',
 'weex': 'https://weex.com',
 'ondo': 'https://ondo.finance',
 'ondofinance': 'https://ondo.finance',
 'figure': 'https://figure.com',
 'toku': 'https://toku.com',
 'animoca': 'https://animocabrands.com',
 'animoca-brands': 'https://animocabrands.com',
 'animocabrands': 'https://animocabrands.com',
 'swan': 'https://swanbitcoin.com',
 'bnb-chain': 'https://www.bnbchain.org',
 'bnbchain': 'https://www.bnbchain.org',
 'pioneer-services': 'https://www.bnbchain.org',
 'pancakeswap': 'https://pancakeswap.finance',
 'aster': 'https://www.asterdex.com',
 'asterdex': 'https://www.asterdex.com',
 'certik': 'https://certik.com',
 'impossiblecloud': 'https://impossiblecloud.com',
 'coinhako': 'https://coinhako.com',
 'veda': 'https://veda.tech',
 'gate': 'https://gate.io',
 'gateio': 'https://gate.io',
 'gemini': 'https://gemini.com',
 'bitkub': 'https://bitkub.com',
 'aligned': 'https://alignedlayer.com',
 'zerion': 'https://zerion.io',
 'skymavis': 'https://skymavis.com',
 'parallel': 'https://parallel.life',
 'straitsx': 'https://straitsx.com',
 'shakepay': 'https://shakepay.com',
 'bitpanda': 'https://bitpanda.com',
 'bitvavo': 'https://bitvavo.com',
 'bitso': 'https://bitso.com',
 'luno': 'https://luno.com',
 'coinhako': 'https://coinhako.com',
 'ledger': 'https://ledger.com',
 'bob': 'https://gobob.xyz',
 'delphi': 'https://delphidigital.io',
 'delphi-digital': 'https://delphidigital.io',
 'ava-labs': 'https://avax.network',
 'avalabs': 'https://avax.network',
 'parity': 'https://parity.io',
 'sei-labs': 'https://sei.io',
 'union': 'https://union.build',
 'symbiotic': 'https://symbiotic.fi',
 'artemis': 'https://artemis.xyz',
 'safe': 'https://safe.global',
 'apex': 'https://apex.exchange',
 'orderly': 'https://orderly.network',
 'grvt': 'https://grvt.io',
 'navi': 'https://naviprotocol.io',
 'wincent': 'https://wincent.io',
 'immutable': 'https://immutable.com',
 'moonpay': 'https://moonpay.com',
 'magiceden': 'https://magiceden.io',
 'phantom': 'https://phantom.app',
 'circle': 'https://circle.com',
 'ramp': 'https://ramp.network',
 'coingecko': 'https://coingecko.com',
 'bitgo': 'https://bitgo.com',
 'helius': 'https://helius.dev',
 'keyrock': 'https://keyrock.eu',
 'mystenlabs': 'https://mystenlabs.com',
 'mysten': 'https://mystenlabs.com',
 'securitize': 'https://securitize.io',
 'paxos': 'https://paxos.com',
 'elliptic': 'https://elliptic.co',
 'anchorage': 'https://anchorage.com',
 'fireblocks': 'https://fireblocks.com',
 'brave': 'https://brave.com',
 'layerzero': 'https://layerzero.network',
 'layerzerolabs': 'https://layerzero.network',
 'matter-labs': 'https://matter-labs.io',
 'zksync': 'https://zksync.io',
 'offchainlabs': 'https://offchainlabs.com',
 'arbitrum': 'https://arbitrum.io',
 'jito-labs': 'https://jito.network',
 'jito': 'https://jito.network',
 'opensea': 'https://opensea.io',
 'aptoslabs': 'https://aptoslabs.com',
 'aptos': 'https://aptoslabs.com',
 'bastion': 'https://bastion.com',
 'worldcoin': 'https://worldcoin.org',
 'morpho': 'https://morpho.org',
 'morpho-labs': 'https://morpho.org',
 'alchemy': 'https://alchemy.com',
 'talos': 'https://talos.com',
 'talos-trading': 'https://talos.com',
 'nethermind': 'https://nethermind.io',
 'dydx': 'https://dydx.exchange',
 'matter-labs': 'https://matter-labs.io',
 'status': 'https://status.im',
 'ledger': 'https://ledger.com',
 'immutable': 'https://immutable.com',
 'gauntlet': 'https://gauntlet.xyz',
 'blockworks': 'https://blockworks.co',
 'ava-labs': 'https://avalabs.org',
 'hedera-hashgraph': 'https://hedera.com',
 'jito-foundation': 'https://jito.network',
 'jito': 'https://jito.network',
 'tenderly': 'https://tenderly.co',
 'flow-blockchain': 'https://flow.com',
 'shapeshift': 'https://shapeshift.com',
 'river-financial': 'https://river.com',
 'walletconnect': 'https://walletconnect.com',
 'solana-labs': 'https://solana.com',
 'merkle-science': 'https://merklescience.com',
 'zerion': 'https://zerion.io',
 'hyperbolic': 'https://hyperbolic.xyz',
 'switchboard': 'https://switchboard.xyz',
 'avalanche': 'https://avax.network',
 'nasdaq': 'https://nasdaq.com',
 'improbable': 'https://improbable.io',
 'sfox': 'https://sfox.com',
 'sonic': 'https://soniclabs.com',
 'bitvavo': 'https://bitvavo.com',
 'venice': 'https://venice.ai',
 'parity-technologies': 'https://www.parity.io',
 'blockaid': 'https://blockaid.io',
 'zone': 'https://zone.network',
 'altonomy': 'https://www.altonomy.com',
 'apex': 'https://apex.win',
 'cinch': 'https://cinch.co',
 'swipe-io': 'https://swipe.io',
 'alphapoint': 'https://alphapoint.com',
 'onmeta': 'https://onmeta.in',
 'rise': 'https://risework.co',
 'utila': 'https://utila.io',
 'bitpay': 'https://bitpay.com',
 'spearbit': 'https://spearbit.com',
 'gomining': 'https://gomining.com',
 'bitdeer': 'https://www.bitdeer.com',
 'crypto-finance': 'https://www.crypto-finance.com',
 'offchain-labs': 'https://www.offchain.io',
 'hut-8': 'https://hut8.com',
 'blockstream': 'https://blockstream.com',
 'riot-platforms': 'https://www.riotplatforms.com',
 'crypto-com': 'https://crypto.com',
 'straitsx': 'https://www.straitsx.com',
 'zero-hash': 'https://zerohash.com',
 'ajaib-crypto': 'https://ajaib.co.id',
 'digital-asset': 'https://www.digitalasset.com',
 'nexo': 'https://nexo.com',
 'fasset': 'https://fasset.com',
 'coinflow': 'https://coinflow.cash',
 'oasis-network': 'https://oasisprotocol.org',
 'hex-trust': 'https://hextrust.com',
 'figure': 'https://www.figure.com',
 'ritual': 'https://ritual.net',
 'mantra-chain': 'https://www.mantrachain.io',
 'lightning-labs': 'https://lightning.engineering',
 'turnkey': 'https://www.turnkey.com',
 'swan-bitcoin': 'https://www.swanbitcoin.com',
 'allium': 'https://www.allium.so',
 'solflare': 'https://solflare.com',
 'fun-xyz': 'https://fun.xyz',
 'coinhako': 'https://www.coinhako.com',
 'ether-fi': 'https://www.ether.fi',
 'ndax': 'https://ndax.io',
 'keyrock': 'https://keyrock.com',
 'harmony': 'https://harmony.one',
 'somnia': 'https://somnia.network',
 'bitcoin-com': 'https://www.bitcoin.com',
 'grvt': 'https://grvt.io',
 '0g-labs': 'https://0g.ai',
 'crystal-intelligence': 'https://crystalintelligence.com',
 'category-labs': 'https://category.xyz',
 'strike': 'https://strike.me',
 'braiins': 'https://braiins.com',
 'waterfall': 'https://waterfall.network',
 'uphold': 'https://uphold.com',
 'daylight': 'https://daylight.xyz',
 'coinme': 'https://coinme.com',
 'telcoin': 'https://telcoin.com',
 'anza': 'https://anza.xyz',
 'doublezero': 'https://doublezero.xyz',
 'syndica': 'https://syndica.io',
 'provable-aleo': 'https://provable.com',
 'symbiotic': 'https://symbiotic.fi',
 'starknet-foundation': 'https://starknet.io',
 'ethereum-foundation': 'https://ethereum.org',
 'copper-co': 'https://copper.co',
 'alpen-labs': 'https://alpenlabs.io',
 'serotonin': 'https://serotonin.co',
 'io-global': 'https://iohk.io',
 'aztec': 'https://aztec.network',
 'goldsky': 'https://goldsky.com',
 'newton': 'https://www.newton.co',
 'renegade': 'https://renegade.fi',
 'sahara-ai': 'https://saharaai.com',
 'stargate-foundation': 'https://stargate.finance',
 'superstate': 'https://superstate.co',
 'relay': 'https://relay.link',
 'plasma': 'https://plasma.org',
 'sui-foundation': 'https://sui.io',
 'p2p-org': 'https://p2p.org',
 'validation-cloud': 'https://validationcloud.io',
 'woo-network': 'https://woo.org',
 'cryptio': 'https://cryptio.co',
 'luxor-technology': 'https://luxor.tech',
 'hyperliquid-labs': 'https://hyperliquid.xyz',
 'espresso-systems': 'https://www.espressosys.com',
 'aurora': 'https://aurora.dev',
 'coinjar': 'https://www.coinjar.com',
 'world-foundation': 'https://worldcoin.org',
 'apex-protocol': 'https://apex.exchange',
 'ethglobal': 'https://ethglobal.com',
 'chronicle-labs': 'https://chroniclelabs.org',
 'cow-dao': 'https://cow.fi',
 '21shares': 'https://21shares.com',
 'filecoin-foundation': 'https://fil.org',
 'zetachain': 'https://www.zetachain.com',
 'pyth-network': 'https://pyth.network',
 'paribu': 'https://www.paribu.com',
 'eclipse': 'https://www.eclipse.xyz',
 'saga': 'https://saga.xyz',
 'swissborg': 'https://swissborg.com',
 'plume-network': 'https://www.plumenetwork.xyz',
 'compound': 'https://compound.finance',
 'giottus': 'https://www.giottus.com',
 'bitoasis': 'https://bitoasis.net',
 'union': 'https://union.build',
 'coindcx': 'https://coindcx.com',
 'indodax': 'https://indodax.com',
 'starkware': 'https://starkware.co',
 'amina-bank': 'https://aminabank.com',
 'drivewealth': 'https://drivewealth.com',
 'prime-intellect': 'https://www.primeintellect.ai',
 'socket': 'https://socket.tech',
 'parallel': 'https://parallel.life',
 'fleek': 'https://fleek.xyz',
 'lens-protocol': 'https://lens.xyz',
 'delphi-digital': 'https://delphidigital.io',
 'trezor': 'https://trezor.io',
 'across-protocol': 'https://across.to',
 'mudrex': 'https://mudrex.com',
 'bitfinex': 'https://www.bitfinex.com',
 'unocoin': 'https://www.unocoin.com',
 'zebpay': 'https://zebpay.com',
};

/**
 * Create a URL-safe slug from company name
 */
function createSlug(companyName: string): string {
 return companyName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
}

function buildListingDescription(companyName: string, jobs: Job[]): string {
 const countLabel = jobs.length === 1 ? '1 active role' : `${jobs.length} active roles`;
 const titles = [...new Set(jobs.map((job) => job.title.trim()).filter(Boolean))].slice(0, 3);
 const locations = [...new Set(jobs.map((job) => job.location?.trim()).filter((value): value is string => Boolean(value)))].slice(0, 3);

 if (titles.length === 0) {
  return `${companyName} currently has no active roles listed on Hashtag Web3.`;
 }

 const titleSummary = `Current openings include ${titles.join(', ')}.`;
 const locationSummary = locations.length > 0
  ? ` Listed locations include ${locations.join(', ')}.`
  : '';

 return `${companyName} has ${countLabel} listed on Hashtag Web3. ${titleSummary}${locationSummary}`;
}

function buildRichDescription(companyName: string, jobs: Job[], rich: string): string {
 return rich;
}

function getSafeProfileWebsite(value: unknown): string | undefined {
 if (typeof value !== 'string' || !value.trim()) return undefined;

 try {
  const url = new URL(value.trim());
  if (!['http:', 'https:'].includes(url.protocol) || isAtsHostname(url.hostname)) {
   return undefined;
  }
  return value.trim();
 } catch {
  return undefined;
 }
}

/**
 * Read only a company's canonical website from legacy markdown. The prose in
 * those files is intentionally not rendered: company-page copy is derived from
 * current, company-specific job facts instead of copied marketing language.
 */
async function loadCompanyContent(slug: string): Promise<{ website?: string; description?: string } | null> {
 try {
  const companiesDir = path.join(process.cwd(), 'content', 'companies');
  const filePath = path.join(companiesDir, `${slug}.md`);
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const website = getSafeProfileWebsite(data.website);

  let description = typeof data.description === 'string' && data.description.trim() ? data.description.trim() : undefined;
  if (!description && content.trim()) {
    const plain = content.replace(/^#+.*$/gm, '').replace(/[\r\n]+/g, ' ').trim();
    if (plain) description = plain;
  }

  return {
    ...(website && { website }),
    ...(description && { description }),
  };
 } catch {
  return null;
 }
}

/**
 * Normalize company name for matching
 */
function normalizeCompanyName(name: string): string {
  const lower = name.toLowerCase().trim();
  if (lower.includes('offchain') || lower.includes('arbitrum')) {
    return 'arbitrum';
  }
  return name
   .toLowerCase()
   .replace(/\s+inc\.?$/i, '')
   .replace(/\s+ltd\.?$/i, '')
   .replace(/\s+llc\.?$/i, '')
   .replace(/\s+corp\.?$/i, '')
   .replace(/\s+labs?$/i, '')
   .replace(/[^a-z0-9]/g, '')
   .trim();
}

/**
 * Extract unique companies from job listings
 */
export async function getCompanies(): Promise<Company[]> {
 const jobs = await getJobs();
 
 // Group jobs by company with normalized matching
 const companyMap = new Map<string, Job[]>();
 const nameMap = new Map<string, string>(); // normalized -> original name
 
 jobs.forEach(job => {
  const companyName = job.company.trim();
  const normalized = normalizeCompanyName(companyName);
  
  // Use the first occurrence as the canonical name
  if (!nameMap.has(normalized)) {
   const canonicalName = normalized === 'arbitrum' ? 'Offchain Labs' : companyName;
   nameMap.set(normalized, canonicalName);
   companyMap.set(canonicalName, []);
  }
  
  const canonicalName = nameMap.get(normalized)!;
  companyMap.get(canonicalName)!.push(job);
 });
 
 // Create company objects
 const companies: Company[] = [];
 
 companyMap.forEach((companyJobs, companyName) => {
  const slug = createSlug(companyName);
  
  // Extract website from job links, filtering out ATS platforms
  const firstJobLink = companyJobs[0]?.link || '';
  let website = '';
  try {
   const url = new URL(firstJobLink);
   if (!isAtsHostname(url.hostname)) {
    website = `${url.protocol}//${url.hostname}`;
   }
  } catch (e) {
   // Invalid URL, leave empty
  }

  if (COMPANY_WEBSITE_OVERRIDES[slug]) {
   website = COMPANY_WEBSITE_OVERRIDES[slug];
  }

    // Use most recent job date as lastUpdated instead of build time
   const latestJobDate = companyJobs.reduce((latest, j) => {
    const d = new Date(j.date);
    return d > latest ? d : latest;
   }, new Date(0));

   companies.push({
    slug,
    name: companyName,
    website,
    jobCount: companyJobs.length,
    jobs: companyJobs,
    lastUpdated: latestJobDate.toISOString(),
   });
 });
 
  // Load enriched content for each company
   await Promise.all(
    companies.map(async (company) => {
     const content = await loadCompanyContent(company.slug);
     if (content?.website) company.website = content.website;
     const desc = COMPANY_RICH_ABOUT[company.slug] || content?.description;
     company.description = desc ? desc : buildListingDescription(company.name, company.jobs);
    })
   );
 
 // Sort by job count (most jobs first)
 companies.sort((a, b) => b.jobCount - a.jobCount);
 
 return companies;
}

/**
 * Get a single company by slug
 */
export async function getCompanyBySlug(slug: string): Promise<Company | null> {
 const jobs = await getJobs();
 
 // Find all jobs for the target company without computing everything
 const companyMap = new Map<string, Job[]>();
 const nameMap = new Map<string, string>();
 let targetCanonicalName: string | null = null;
 
 jobs.forEach(job => {
  const companyName = job.company.trim();
  const normalized = normalizeCompanyName(companyName);
  
  if (!nameMap.has(normalized)) {
   const canonicalName = normalized === 'arbitrum' ? 'Offchain Labs' : companyName;
   nameMap.set(normalized, canonicalName);
   companyMap.set(canonicalName, []);
  }
  
  const canonicalName = nameMap.get(normalized)!;
  companyMap.get(canonicalName)!.push(job);
  
  if (createSlug(canonicalName) === slug || (slug === 'arbitrum' && canonicalName === 'Offchain Labs')) {
   targetCanonicalName = canonicalName;
  }
 });
 
 if (!targetCanonicalName) return null;
 
 const companyJobs = companyMap.get(targetCanonicalName) || [];
 const firstJobLink = companyJobs[0]?.link || '';
 let website = '';
 try {
  const url = new URL(firstJobLink);
  if (!isAtsHostname(url.hostname)) {
   website = `${url.protocol}//${url.hostname}`;
  }
 } catch (e) {}

 if (COMPANY_WEBSITE_OVERRIDES[slug]) {
  website = COMPANY_WEBSITE_OVERRIDES[slug];
 }

 const latestJobDate = companyJobs.reduce((latest, j) => {
  const d = new Date(j.date);
  return d > latest ? d : latest;
 }, new Date(0));

 const company: Company = {
  slug,
  name: targetCanonicalName,
  website,
  jobCount: companyJobs.length,
  jobs: companyJobs,
  lastUpdated: latestJobDate.toISOString(),
 };
 
  // Try to load enriched content
  const content = await loadCompanyContent(slug);
  if (content?.website) company.website = content.website;
  const desc = COMPANY_RICH_ABOUT[slug] || content?.description;
  company.description = desc ? desc : buildListingDescription(company.name, company.jobs);
 
 return company;
}
