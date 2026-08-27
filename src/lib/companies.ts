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
async function loadCompanyContent(slug: string): Promise<Partial<CompanyContent> | null> {
 try {
  const companiesDir = path.join(process.cwd(), 'content', 'companies');
  const filePath = path.join(companiesDir, `${slug}.md`);
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const { data } = matter(fileContent);
  const website = getSafeProfileWebsite(data.website);

  return website ? { website } : {};
 } catch {
  // No content file exists, return null
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
     const rich = COMPANY_RICH_ABOUT[company.slug];
     company.description = rich ? rich : buildListingDescription(company.name, company.jobs);
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
  const rich = COMPANY_RICH_ABOUT[slug];
  company.description = rich ? rich : buildListingDescription(company.name, company.jobs);
 
 return company;
}
