import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync, execFileSync } from 'child_process';
import { isConcreteJobOpening, cleanCompanyName } from '../src/lib/job-filters';
import { getJobContentKey } from '../src/lib/job-slugs';

// ---------------------------------------------------------------------------
// 1. Shared types & constants
// ---------------------------------------------------------------------------

const TODAY = new Date().toISOString().slice(0, 10);
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const CUTOFF = Date.now() - THIRTY_DAYS_MS;

const CACHE_PATH = path.join(process.cwd(), 'content/jobs-cache.json');
const DESC_PATH  = path.join(process.cwd(), 'content/job-descriptions.json');

type AtsType = 'ashby' | 'greenhouse' | 'lever' | 'bamboo';

interface FeedConfig {
  company: string;
  type: AtsType;
  slug: string;
  url: string;
  skills?: string[];
}

// ---------------------------------------------------------------------------
// 2. Cache helpers
// ---------------------------------------------------------------------------

function readCache(): any[] {
  return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
}
function writeCache(data: any[]): void {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
}
function readDescCache(): Record<string, string> {
  return fs.existsSync(DESC_PATH) ? JSON.parse(fs.readFileSync(DESC_PATH, 'utf8')) : {};
}
function writeDescCache(data: Record<string, string>): void {
  fs.writeFileSync(DESC_PATH, JSON.stringify(data, null, 2));
}
function upsertJob(cacheData: any[], job: any): 'added' | 'updated' {
  const idx = cacheData.findIndex((e: any) => e.id === job.id || e.link === job.link);
  if (idx === -1) { cacheData.unshift(job); return 'added'; }
  cacheData[idx] = { ...cacheData[idx], ...job, slug: cacheData[idx].slug || job.slug };
  return 'updated';
}

// ---------------------------------------------------------------------------
// 3. Shared utilities
// ---------------------------------------------------------------------------

function getOneWordRole(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('solidity')) return 'solidity';
  if (t.includes('rust')) return 'rust';
  if (t.includes('frontend') || /\b(ui|ux)\b/i.test(t)) return 'frontend';
  if (t.includes('backend')) return 'backend';
  if (t.includes('product') || /\bpm\b/i.test(t)) return 'product';
  if (t.includes('analyst') || t.includes('trader') || t.includes('quant')) return 'quant';
  if (t.includes('audit') || t.includes('security')) return 'security';
  if (t.includes('compliance') || t.includes('legal') || t.includes('risk') || t.includes('mlro') || t.includes('kyc')) return 'compliance';
  if (t.includes('recruiting') || t.includes('talent') || /\bhr\b/i.test(t)) return 'recruiter';
  if (t.includes('manager') || t.includes('lead')) return 'manager';
  if (t.includes('operations') || /\bops\b/i.test(t)) return 'operations';
  if (t.includes('support') || t.includes('associate')) return 'associate';
  return 'job';
}

function fetchUrl(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
  });
}

function buildLeverDescription(j: any): string {
  const parts: string[] = [];
  if (j.description) parts.push(j.description);
  if (j.descriptionBody) parts.push(j.descriptionBody);
  for (const list of j.lists || []) {
    if (list.text) parts.push(`<h3>${list.text}</h3>`);
    if (list.content) parts.push(`<ul>${list.content}</ul>`);
  }
  if (j.additional) parts.push(`<p>${j.additional}</p>`);
  return parts.filter(Boolean).join('\n');
}

const ARCHIVE_PATH = path.join(process.cwd(), 'content/legacy-slugs-archive.json');
let legacyArchive: Record<string, any> = {};
try {
  if (fs.existsSync(ARCHIVE_PATH)) {
    legacyArchive = JSON.parse(fs.readFileSync(ARCHIVE_PATH, 'utf8'));
  }
} catch {}

function findLegacySlug(id: string, link?: string): string | undefined {
  for (const [slug, entry] of Object.entries(legacyArchive)) {
    if (entry.id === id || (link && entry.link === link)) {
      return slug;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// 4. ATS fetchers
// ---------------------------------------------------------------------------

async function ingestAshbySimple(company: string, slug: string, defaultLoc: string, cacheData: any[], descData: Record<string, string>): Promise<void> {
  try {
    const encodedSlug = encodeURI(decodeURI(slug));
    const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${encodedSlug}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as any;
    let added = 0, updated = 0;
    for (const j of (json.jobs || [])) {
      if (!isConcreteJobOpening(j.title, j.jobUrl)) continue;
      const existingSlug = findLegacySlug(j.id, j.jobUrl);
      const job = {
        id: j.id, title: j.title.trim(), company,
        link: j.jobUrl || `https://jobs.ashbyhq.com/${encodedSlug}/${j.id}`,
        date: j.publishedAt ? new Date(j.publishedAt).toISOString().slice(0, 10) : TODAY,
        source: `Ashby: ${company} [${slug}]`,
        location: j.location || (j.secondaryLocations?.length ? j.secondaryLocations.join(', ') : defaultLoc),
        department: j.department || j.team || 'Engineering', active: true,
        slug: existingSlug || `role${j.id.replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase()}`
      };
      const r = upsertJob(cacheData, job);
      if (r === 'added') added++; else updated++;
      if (j.descriptionHtml) {
        descData[getJobContentKey(job)] = j.descriptionHtml;
        descData[job.id] = j.descriptionHtml;
        if (job.slug) descData[job.slug] = j.descriptionHtml;
      }
    }
    console.log(`  ✓ [Ashby] ${company}: ${added} added, ${updated} updated`);
  } catch (err: any) { console.warn(`  ⚠️ [Ashby] ${company}: ${err.message}`); }
}

async function ingestGreenhouse(company: string, slug: string, defaultLoc: string, cacheData: any[], descData: Record<string, string>): Promise<void> {
  try {
    const isEU = slug.startsWith('eu:');
    const realSlug = isEU ? slug.slice(3) : slug;
    const baseUrl = isEU ? 'https://job-boards.eu.greenhouse.io' : 'https://boards-api.greenhouse.io';
    const res = await fetch(`${baseUrl}/v1/boards/${realSlug}/jobs?content=true`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as any;
    let added = 0, updated = 0;
    for (const j of (json.jobs || [])) {
      if (!isConcreteJobOpening(j.title, j.absolute_url)) continue;
      const job = {
        id: String(j.id), title: j.title.trim(), company, link: j.absolute_url,
        date: j.updated_at ? new Date(j.updated_at).toISOString().slice(0, 10) : TODAY,
        source: `Greenhouse: ${company} [${realSlug}]`,
        location: j.location?.name || defaultLoc,
        department: j.departments?.[0]?.name || 'Engineering', active: true,
        slug: `role${String(j.id).slice(-5).toLowerCase()}`
      };
      const r = upsertJob(cacheData, job);
      if (r === 'added') added++; else updated++;
      if (j.content) descData[getJobContentKey(job)] = j.content;
    }
    console.log(`  ✓ [Greenhouse] ${company}: ${added} added, ${updated} updated`);
  } catch (err: any) { console.warn(`  ⚠️ [Greenhouse] ${company}: ${err.message}`); }
}

async function ingestLever(company: string, slug: string, cacheData: any[], descData: Record<string, string>): Promise<void> {
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const jobs = await res.json() as any[];
    let added = 0, updated = 0;
    for (const j of jobs) {
      const title = j.text?.trim();
      const link = j.hostedUrl || j.applyUrl;
      if (!title || !link || !isConcreteJobOpening(title, link)) continue;
      const job = {
        id: j.id, title, company, link,
        date: j.createdAt ? new Date(j.createdAt).toISOString().slice(0, 10) : TODAY,
        source: `Lever: ${company} [${slug}]`,
        location: j.categories?.location || j.categories?.allLocations?.join(', ') || 'Remote / Hybrid',
        department: j.categories?.department || j.categories?.team || 'Engineering', active: true,
        slug: `role${j.id.replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase()}`
      };
      const r = upsertJob(cacheData, job);
      if (r === 'added') added++; else updated++;
      const desc = buildLeverDescription(j);
      if (desc) descData[getJobContentKey(job)] = desc;
    }
    console.log(`  ✓ [Lever] ${company}: ${added} added, ${updated} updated`);
  } catch (err: any) { console.warn(`  ⚠️ [Lever] ${company}: ${err.message}`); }
}

async function ingestBambooHR(company: string, slug: string, cacheData: any[]): Promise<void> {
  try {
    const data = await fetchUrl(`https://${slug}.bamboohr.com/careers/list`);
    let added = 0, updated = 0;
    for (const j of (data.result || [])) {
      if (!isConcreteJobOpening(j.jobOpeningName)) continue;
      const roleWord = getOneWordRole(j.jobOpeningName);
      const shortId = String(j.id).replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase();
      const job = {
        id: `bamboo-${slug}-${j.id}`, title: j.jobOpeningName, company: cleanCompanyName(company),
        link: `https://${slug}.bamboohr.com/careers/${j.id}`, date: TODAY,
        source: `BambooHR: ${company} [${slug}]`,
        location: [j.atsLocation?.city, j.atsLocation?.country].filter(Boolean).join(', ') || 'Remote',
        department: j.departmentLabel || company, active: true, slug: `${roleWord}${shortId}`
      };
      const r = upsertJob(cacheData, job);
      if (r === 'added') added++; else updated++;
    }
    console.log(`  ✓ [BambooHR] ${company}: ${added} added, ${updated} updated`);
  } catch (err: any) { console.warn(`  ⚠️ [BambooHR] ${company}: ${err.message}`); }
}

async function ingestMokaHR(company: string, orgId: string, siteId: number, applyBaseUrl: string, cacheData: any[], descData: Record<string, string>): Promise<void> {
  try {
    const res = await fetch('https://hire-r1.mokahr.com/api/outer/ats-apply/website/jobs/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0', 'Referer': applyBaseUrl },
      body: JSON.stringify({ orgId, siteId, pageSize: 200, page: 1 })
    });
    const json = await res.json() as any;
    let added = 0, updated = 0;
    for (const r of (json.data?.jobs || [])) {
      if (!r.title || !isConcreteJobOpening(r.title)) continue;
      if (r.status !== undefined && r.status !== 'open') continue;
      const locs = (r.locations || []).map((l: any) => l.country || l.cityName || l.provinceName).filter(Boolean);
      const job = {
        id: r.id, title: r.title.trim(), company,
        link: `${applyBaseUrl}#/job/${r.id}`,
        date: r.publishedAt ? r.publishedAt.slice(0, 10) : TODAY,
        source: `MokaHR: ${company} [${orgId}]`,
        location: locs.length > 0 ? [...new Set(locs)].join(', ') : 'Remote / Global',
        department: r.department?.name || r.zhineng?.name || 'Operations', active: true,
        slug: `operations${r.id.replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase()}`
      };
      const rv = upsertJob(cacheData, job);
      if (rv === 'added') added++; else updated++;
      if (r.jobDescription) descData[getJobContentKey(job)] = r.jobDescription;
    }
    console.log(`  ✓ [MokaHR] ${company}: ${added} added, ${updated} updated`);
  } catch (err: any) { console.warn(`  ⚠️ [MokaHR] ${company}: ${err.message}`); }
}

/** Fan-out runner used for global / regional / untracked feeds. */
async function ingestFanOutFeeds(label: string, feeds: FeedConfig[], cacheData: any[]): Promise<void> {
  console.log(`\n--- ${label} ---`);
  let totalNew = 0;
  for (const feed of feeds) {
    try {
      const data = await fetchUrl(feed.url);
      let items: any[] = [];
      if (feed.type === 'bamboo') {
        items = (data.result || []).map((j: any) => ({
          id: `bamboo-${feed.slug}-${j.id}`, title: j.jobOpeningName, company: feed.company,
          link: `https://${feed.slug}.bamboohr.com/careers/${j.id}`,
          location: [j.atsLocation?.city, j.atsLocation?.country].filter(Boolean).join(', ') || 'Remote',
          type: j.employmentStatusLabel || 'Full-time', department: j.departmentLabel || feed.company,
          source: `bamboohr:${feed.slug}`, rawId: j.id,
        }));
      } else if (feed.type === 'ashby') {
        items = (data.jobs || []).map((j: any) => ({
          id: `ashby-${feed.slug}-${j.id}`, title: j.title, company: feed.company,
          link: j.jobUrl || `https://jobs.ashbyhq.com/${feed.slug}/${j.id}`,
          location: j.location || 'Remote', type: j.employmentType || 'Full-time',
          department: j.department || feed.company, source: `ashby:${feed.slug}`, rawId: j.id,
        }));
      } else if (feed.type === 'lever') {
        items = (Array.isArray(data) ? data : []).map((j: any) => ({
          id: `lever-${feed.slug}-${j.id}`, title: j.text, company: feed.company,
          link: j.hostedUrl, location: j.categories?.location || 'Remote',
          type: j.categories?.commitment || 'Full-time', department: j.categories?.department || feed.company,
          source: `lever:${feed.slug}`, rawId: j.id,
        }));
      } else if (feed.type === 'greenhouse') {
        items = (data.jobs || []).map((j: any) => ({
          id: `greenhouse-${feed.slug}-${j.id}`, title: j.title, company: feed.company,
          link: j.absolute_url, location: j.location?.name || 'Remote',
          type: 'Full-time', department: j.departments?.[0]?.name || feed.company,
          source: `greenhouse:${feed.slug}`, rawId: j.id,
        }));
      }
      let countForFeed = 0;
      for (const item of items) {
        if (!isConcreteJobOpening(item.title, item.link)) continue;
        const roleWord = getOneWordRole(item.title);
        const shortId = item.rawId.toString().replace(/[^a-z0-9]/gi, '').slice(-5).toLowerCase();
        const job = {
          id: item.id, title: item.title, company: cleanCompanyName(item.company),
          location: item.location, type: item.type, date: TODAY, source: item.source,
          link: item.link, applyUrl: item.link, department: item.department,
          skills: feed.skills || ['Web3', 'Blockchain', 'Crypto'],
          slug: `${roleWord}${shortId}`,
        };
        const exists = cacheData.some((e: any) => e.id === job.id || e.link === job.link);
        if (!exists) { cacheData.unshift(job); countForFeed++; totalNew++; }
      }
      console.log(`  ✓ [${feed.company}] (${feed.type.toUpperCase()}): ${countForFeed} new`);
    } catch (err: any) {
      console.error(`  ✗ [${feed.company}] failed: ${err.message}`);
    }
  }
  console.log(`  🎉 ${label}: ${totalNew} total new`);
}

// ---------------------------------------------------------------------------
// 5. Company lists
// ---------------------------------------------------------------------------

const GLOBAL_ECOSYSTEM_FEEDS: FeedConfig[] = [
  { company: 'Fireblocks',     type: 'greenhouse', slug: 'fireblocks',   url: 'https://boards-api.greenhouse.io/v1/boards/fireblocks/jobs?content=true',   skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'BitGo',          type: 'greenhouse', slug: 'bitgo',        url: 'https://boards-api.greenhouse.io/v1/boards/bitgo/jobs?content=true',        skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Gemini',         type: 'greenhouse', slug: 'gemini',       url: 'https://boards-api.greenhouse.io/v1/boards/gemini/jobs?content=true',       skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Flow Traders',   type: 'greenhouse', slug: 'flowtraders',  url: 'https://boards-api.greenhouse.io/v1/boards/flowtraders/jobs?content=true',  skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'CertiK',         type: 'lever',      slug: 'certik',       url: 'https://api.lever.co/v0/postings/certik?mode=json',                         skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'a16z crypto',    type: 'greenhouse', slug: 'a16z',         url: 'https://boards-api.greenhouse.io/v1/boards/a16z/jobs?content=true',         skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Injective',      type: 'ashby',      slug: 'injective',    url: 'https://api.ashbyhq.com/posting-api/job-board/injective',                   skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Ritual',         type: 'greenhouse', slug: 'ritual',       url: 'https://boards-api.greenhouse.io/v1/boards/ritual/jobs?content=true',       skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Arbitrum',       type: 'lever',      slug: 'offchainlabs', url: 'https://api.lever.co/v0/postings/offchainlabs?mode=json',                   skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Render Network', type: 'ashby',      slug: 'render',       url: 'https://api.ashbyhq.com/posting-api/job-board/render',                      skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Phantom',        type: 'ashby',      slug: 'phantom',      url: 'https://api.ashbyhq.com/posting-api/job-board/phantom',                     skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Morpho',         type: 'ashby',      slug: 'morpho',       url: 'https://api.ashbyhq.com/posting-api/job-board/morpho',                      skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Safe',           type: 'ashby',      slug: 'safe',         url: 'https://api.ashbyhq.com/posting-api/job-board/safe',                        skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Uniswap Labs',   type: 'ashby',      slug: 'uniswap',      url: 'https://api.ashbyhq.com/posting-api/job-board/uniswap',                     skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Ethena Labs',    type: 'lever',      slug: 'ethena',       url: 'https://api.lever.co/v0/postings/ethena?mode=json',                         skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Optimism',       type: 'ashby',      slug: 'oplabs',       url: 'https://api.ashbyhq.com/posting-api/job-board/oplabs',                      skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Consensys',      type: 'greenhouse', slug: 'consensys',    url: 'https://boards-api.greenhouse.io/v1/boards/consensys/jobs?content=true',    skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Compound',       type: 'ashby',      slug: 'compound',     url: 'https://api.ashbyhq.com/posting-api/job-board/compound',                   skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Jump Crypto',    type: 'greenhouse', slug: 'jumpcrypto',   url: 'https://boards-api.greenhouse.io/v1/boards/jumpcrypto/jobs?content=true',   skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'TRM Labs',       type: 'bamboo',     slug: 'trmlabs',      url: 'https://trmlabs.bamboohr.com/careers/list',                                 skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'OpenZeppelin',   type: 'greenhouse', slug: 'openzeppelin', url: 'https://boards-api.greenhouse.io/v1/boards/openzeppelin/jobs?content=true', skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Mysten Labs',    type: 'ashby',      slug: 'mystenlabs',   url: 'https://api.ashbyhq.com/posting-api/job-board/mystenlabs',                  skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Immunefi',       type: 'greenhouse', slug: 'immunefi',     url: 'https://boards-api.greenhouse.io/v1/boards/immunefi/jobs?content=true',     skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
  { company: 'Ramp Network',   type: 'greenhouse', slug: 'eu:rampnetwork', url: 'https://job-boards.eu.greenhouse.io/v1/boards/rampnetwork/jobs?content=true', skills: ['Web3','Blockchain','Crypto','DeFi','Infrastructure'] },
];

const REGIONAL_FEEDS: FeedConfig[] = [
  { company: 'Yellow Card',    type: 'bamboo',     slug: 'yellowcard',    url: 'https://yellowcard.bamboohr.com/careers/list',                                 skills: ['Web3','Blockchain','Crypto','Fintech'] },
  { company: 'Luno',           type: 'greenhouse', slug: 'luno',          url: 'https://boards-api.greenhouse.io/v1/boards/luno/jobs?content=true',            skills: ['Web3','Blockchain','Crypto','Fintech'] },
  { company: 'Bybit',          type: 'greenhouse', slug: 'bybit',         url: 'https://boards-api.greenhouse.io/v1/boards/bybit/jobs?content=true',           skills: ['Web3','Blockchain','Crypto','Fintech'] },
  { company: 'Coinhako',       type: 'ashby',      slug: 'coinhako',      url: 'https://api.ashbyhq.com/posting-api/job-board/coinhako',                      skills: ['Web3','Blockchain','Crypto','Fintech'] },
  { company: 'CoinGecko',      type: 'lever',      slug: 'coingecko',     url: 'https://api.lever.co/v0/postings/coingecko?mode=json',                        skills: ['Web3','Blockchain','Crypto','Fintech'] },
  { company: 'Amber Group',    type: 'bamboo',     slug: 'ambergroup',    url: 'https://ambergroup.bamboohr.com/careers/list',                                skills: ['Web3','Blockchain','Crypto','Fintech'] },
  { company: 'Animoca Brands', type: 'lever',      slug: 'animocabrands', url: 'https://api.lever.co/v0/postings/animocabrands?mode=json',                    skills: ['Web3','Blockchain','Crypto','Fintech'] },
];

const UNTRACKED_FEEDS: FeedConfig[] = [
  { company: 'Cantina',          type: 'ashby',  slug: 'cantina',          url: 'https://api.ashbyhq.com/posting-api/job-board/cantina',         skills: ['Web3','Blockchain','Crypto','AI','Security'] },
  { company: 'Turnkey',          type: 'ashby',  slug: 'turnkey',          url: 'https://api.ashbyhq.com/posting-api/job-board/turnkey',         skills: ['Web3','Blockchain','Crypto','AI','Security'] },
  { company: 'Hyperbolic',       type: 'ashby',  slug: 'hyperbolic',       url: 'https://api.ashbyhq.com/posting-api/job-board/hyperbolic',      skills: ['Web3','Blockchain','Crypto','AI','Security'] },
  { company: '0G Labs',          type: 'ashby',  slug: '0g',               url: 'https://api.ashbyhq.com/posting-api/job-board/0g',              skills: ['Web3','Blockchain','Crypto','AI','Security'] },
  { company: 'Grass',            type: 'ashby',  slug: 'wynd-labs',        url: 'https://api.ashbyhq.com/posting-api/job-board/wynd-labs',       skills: ['Web3','Blockchain','Crypto','AI','Security'] },
  { company: 'Sahara AI',        type: 'ashby',  slug: 'sahara',           url: 'https://api.ashbyhq.com/posting-api/job-board/sahara',          skills: ['Web3','Blockchain','Crypto','AI','Security'] },
  { company: 'Chainstack',       type: 'bamboo', slug: 'chainstack',       url: 'https://chainstack.bamboohr.com/careers/list',                  skills: ['Web3','Blockchain','Crypto','AI','Security'] },
  { company: 'Helius',           type: 'ashby',  slug: 'helius',           url: 'https://api.ashbyhq.com/posting-api/job-board/helius',          skills: ['Web3','Blockchain','Crypto','AI','Security'] },
  { company: 'Nomic Foundation', type: 'ashby',  slug: 'nomic.foundation', url: 'https://api.ashbyhq.com/posting-api/job-board/nomic.foundation', skills: ['Web3','Blockchain','Crypto','AI','Security'] },
  { company: 'Movement Labs',    type: 'ashby',  slug: 'movement',         url: 'https://api.ashbyhq.com/posting-api/job-board/movement',        skills: ['Web3','Blockchain','Crypto','AI','Security'] },
  { company: 'Symbiotic',        type: 'ashby',  slug: 'symbiotic',        url: 'https://api.ashbyhq.com/posting-api/job-board/symbiotic',       skills: ['Web3','Blockchain','Crypto','AI','Security'] },
  { company: 'Aztec Labs',       type: 'ashby',  slug: 'aztec-labs',       url: 'https://api.ashbyhq.com/posting-api/job-board/aztec-labs',      skills: ['Web3','Blockchain','Crypto','AI','Security'] },
  { company: 'Succinct Labs',    type: 'ashby',  slug: 'succinct',         url: 'https://api.ashbyhq.com/posting-api/job-board/succinct',        skills: ['Web3','Blockchain','Crypto','AI','Security'] },
  { company: 'Magic Eden',       type: 'ashby',  slug: 'magiceden',        url: 'https://api.ashbyhq.com/posting-api/job-board/magiceden',       skills: ['Web3','Blockchain','Crypto','AI','Security'] },
  { company: 'Foundation',       type: 'ashby',  slug: 'foundation',       url: 'https://api.ashbyhq.com/posting-api/job-board/foundation',      skills: ['Web3','Blockchain','Crypto','AI','Security'] },
];

// Fresh feeds with 30-day cutoff (formerly ingest-fresh-web3-companies + ingest-a16z-crypto-portfolio)
const FRESH_FEEDS: FeedConfig[] = [
  { company: 'Matter Labs (zkSync)', type: 'ashby',      slug: 'matter-labs',            url: 'https://api.ashbyhq.com/posting-api/job-board/matter-labs?includeCompensation=true' },
  { company: 'LayerZero',            type: 'greenhouse', slug: 'layerzerolabs',          url: 'https://api.greenhouse.io/v1/boards/layerzerolabs/jobs?content=true' },
  { company: 'Jito Labs',            type: 'ashby',      slug: 'jito-labs',              url: 'https://api.ashbyhq.com/posting-api/job-board/jito-labs?includeCompensation=true' },
  { company: 'OpenSea',              type: 'ashby',      slug: 'opensea',                url: 'https://api.ashbyhq.com/posting-api/job-board/opensea?includeCompensation=true' },
  { company: 'Aptos Labs',           type: 'greenhouse', slug: 'aptoslabs',              url: 'https://api.greenhouse.io/v1/boards/aptoslabs/jobs?content=true' },
  { company: 'EigenLayer',           type: 'ashby',      slug: 'eigen-labs',             url: 'https://api.ashbyhq.com/posting-api/job-board/eigen-labs?includeCompensation=true' },
  { company: 'Bastion',              type: 'ashby',      slug: 'Bastion',                url: 'https://api.ashbyhq.com/posting-api/job-board/Bastion?includeCompensation=true' },
  { company: 'Worldcoin',            type: 'ashby',      slug: 'Tools%20for%20Humanity', url: 'https://api.ashbyhq.com/posting-api/job-board/Tools%20for%20Humanity?includeCompensation=true' },
  { company: 'Alchemy',              type: 'ashby',      slug: 'alchemy',                url: 'https://api.ashbyhq.com/posting-api/job-board/alchemy?includeCompensation=true' },
  { company: 'Talos Trading',        type: 'ashby',      slug: 'Talos-Trading',          url: 'https://api.ashbyhq.com/posting-api/job-board/Talos-Trading?includeCompensation=true' },
];

// ---------------------------------------------------------------------------
// 6. Static job data
// ---------------------------------------------------------------------------

const STATIC_JOBS_PwC: any[] = [
  { id: 'pwc-digital-assets-crypto-director',            title: 'Digital Assets & Crypto Director (Consulting & Strategy)',            company: 'PwC', date: '2026-09-04', source: 'PwC Careers [pwc]', location: 'New York, NY / Hybrid',                         department: 'Web3 & Digital Assets Advisory',       active: true, slug: 'directorpwc08',  link: 'https://pwc.wd3.myworkdayjobs.com/US_Experienced_Careers/job/NY-New-York/Digital-Assets-Crypto-BlockChain-Director_758306WD?source=US_EXP_Careers' },
  { id: 'pwc-digital-assets-senior-manager-tech',        title: 'Digital Assets Senior Manager (Technology)',                          company: 'PwC', date: '2026-09-04', source: 'PwC Careers [pwc]', location: 'New York, NY / Hybrid',                         department: 'Web3 & Tech Consulting',               active: true, slug: 'seniorpwc01',    link: 'https://pwc.wd3.myworkdayjobs.com/US_Experienced_Careers/job/NY-New-York/Digital-Assets-Crypto-BlockChain-Senior-Manager_758288WD?source=US_EXP_Careers' },
  { id: 'pwc-digital-assets-crypto-manager-ny',          title: 'Digital Assets Manager (Technology)',                                  company: 'PwC', date: '2026-09-04', source: 'PwC Careers [pwc]', location: 'New York, NY / Hybrid',                         department: 'Web3 & Tech Consulting',               active: true, slug: 'managerpwc02',   link: 'https://pwc.wd3.myworkdayjobs.com/US_Experienced_Careers/job/NY-New-York/Digital-Assets--Crypto--Manager_757458WD?source=US_EXP_Careers' },
  { id: 'pwc-ai-blockchain-architect-senior-manager',    title: 'AI / Blockchain Architect Senior Manager',                            company: 'PwC', date: '2026-09-04', source: 'PwC Careers [pwc]', location: 'Tampa, FL / Hybrid',                            department: 'Platform Architecture & Blockchain',   active: true, slug: 'architectpwc03', link: 'https://pwc.wd3.myworkdayjobs.com/US_Experienced_Careers/job/FL-Tampa/AIT---AI-Blockchain-Architect-Senior-Manager_738313WD?source=US_EXP_Careers' },
  { id: 'pwc-digital-assurance-digital-assets-senior-associate', title: 'Digital Assurance & Transparency - Digital Assets Senior Associate', company: 'PwC', date: '2026-09-04', source: 'PwC Careers [pwc]', location: 'New York, NY / San Francisco, CA / Hybrid', department: 'Digital Asset Audit & Assurance',      active: true, slug: 'seniorpwc04',    link: 'https://pwc.wd3.myworkdayjobs.com/US_Experienced_Careers/job/NY-New-York/Digital-Assets-Crypto-BlockChain-Senior-Associate_758286WD?source=US_EXP_Careers' },
  { id: 'pwc-bcm-assurance-digital-assets-manager',     title: 'BCM - Assurance - Digital Assets Manager',                            company: 'PwC', date: '2026-09-04', source: 'PwC Careers [pwc]', location: 'San Francisco, CA / Hybrid',                    department: 'Banking & Capital Markets Assurance',  active: true, slug: 'managerpwc05',   link: 'https://pwc.wd3.myworkdayjobs.com/US_Experienced_Careers/job/CA-San-Francisco/BCM---Assurance---Digital-Assets-Manager_739440WD?source=US_EXP_Careers' },
  { id: 'pwc-awm-digital-assets-senior-manager',        title: 'BCM - Assurance - Digital Assets Senior Manager',                     company: 'PwC', date: '2026-09-04', source: 'PwC Careers [pwc]', location: 'San Francisco, CA / Hybrid',                    department: 'Banking & Capital Markets Assurance',  active: true, slug: 'seniorpwc06',    link: 'https://pwc.wd3.myworkdayjobs.com/US_Experienced_Careers/job/CA-San-Francisco/BCM---Assurance---Digital-Assets-Senior-Manager_739439WD?source=US_EXP_Careers' },
  { id: 'pwc-awm-assurance-digital-assets-manager',     title: 'AWM - Assurance - Digital Assets Manager',                            company: 'PwC', date: '2026-09-04', source: 'PwC Careers [pwc]', location: 'New York, NY / Hybrid',                         department: 'Asset & Wealth Management Assurance',  active: true, slug: 'managerpwc07',   link: 'https://pwc.wd3.myworkdayjobs.com/US_Experienced_Careers/job/NY-New-York/AWM---Assurance---Digital-Assets-Manager_739437WD?source=US_EXP_Careers' },
  { id: 'pwc-bcm-tax-manager-fintech-crypto',           title: 'Banking & Capital Markets Tax Manager (FinTech & Crypto)',             company: 'PwC', date: '2026-09-04', source: 'PwC Careers [pwc]', location: 'New York, NY / Chicago, IL / Hybrid',            department: 'FinTech & Crypto Tax Advisory',        active: true, slug: 'managerpwc09',   link: 'https://pwc.wd3.myworkdayjobs.com/US_Experienced_Careers/job/NY-New-York/Banking---Capital-Markets-Tax-Manager_725612WD-2?source=US_EXP_Careers' },
  { id: 'pwc-technology-consulting-associate-digital-assets', title: 'Technology Consulting Associate (Digital Assets & Payments)',  company: 'PwC', date: '2026-09-04', source: 'PwC Careers [pwc]', location: 'New York, NY / San Francisco, CA / Hybrid',     department: 'Digital Assets Consulting',            active: true, slug: 'associatepwc10', link: 'https://pwc.wd3.myworkdayjobs.com/US_Experienced_Careers/job/NY-New-York/Digital-Assets-Crypto-BlockChain-Senior-Associate_758286WD?source=US_EXP_Careers' },
];

const STATIC_JOBS_REVOLUT: any[] = [
  { id: 'b195b9c7-b517-4068-b9a4-f816f1c8b1f9', title: 'Information Security Specialist (Crypto)',       company: 'Revolut', date: '2026-09-02', source: 'Revolut Careers [revolut]', location: 'Remote: Cyprus',                                            department: 'Crypto Security & Engineering', active: true, slug: 'securityb195b',   link: 'https://www.revolut.com/careers/position/information-security-specialist-crypto-b195b9c7-b517-4068-b9a4-f816f1c8b1f9/' },
  { id: '1f673184-3fe0-4a7b-9593-d7ecbe0fcc09', title: 'Strategy & Operations Manager (Crypto)',          company: 'Revolut', date: '2026-09-02', source: 'Revolut Careers [revolut]', location: 'Bangalore, Barcelona, Dubai, London (Remote / Hybrid)',       department: 'Crypto & Digital Assets',       active: true, slug: 'operations1f673', link: 'https://www.revolut.com/careers/position/strategy-operations-manager-crypto-1f673184-3fe0-4a7b-9593-d7ecbe0fcc09/' },
  { id: 'c7078b70-e10b-4f47-b983-bbe6d08d098a', title: 'Product Owner (Crypto)',                          company: 'Revolut', date: '2026-09-02', source: 'Revolut Careers [revolut]', location: 'Barcelona, Dublin, London, Madrid (Remote)',                  department: 'Crypto Product',                active: true, slug: 'productc7078',    link: 'https://www.revolut.com/careers/position/product-owner-crypto-c7078b70-e10b-4f47-b983-bbe6d08d098a/' },
  { id: '7c9aa5ba-25c6-48bf-a06e-be2957f4818f', title: 'Head of Finance (Crypto)',                        company: 'Revolut', date: '2026-09-02', source: 'Revolut Careers [revolut]', location: 'Remote: Luxembourg',                                        department: 'Crypto Finance',                active: true, slug: 'manager7c9aa',    link: 'https://www.revolut.com/careers/position/head-of-finance-crypto-7c9aa5ba-25c6-48bf-a06e-be2957f4818f/' },
  { id: 'ef7bd853-526b-47ec-b506-d25ca9298dcc', title: 'Product Marketing Manager (Crypto)',               company: 'Revolut', date: '2026-09-02', source: 'Revolut Careers [revolut]', location: 'Barcelona, Dubai, London, Madrid (Remote: Portugal/Spain/UAE/UK)', department: 'Crypto Marketing',           active: true, slug: 'marketingef7bd',  link: 'https://www.revolut.com/careers/position/product-marketing-manager-crypto-ef7bd853-526b-47ec-b506-d25ca9298dcc/' },
  { id: 'e9df3602-32ec-4d89-a7cf-d5c811f961db', title: 'Head Financial Crime Compliance (Crypto)',         company: 'Revolut', date: '2026-09-02', source: 'Revolut Careers [revolut]', location: 'Remote: Poland, Portugal, Spain, UAE',                       department: 'Crypto Compliance',             active: true, slug: 'compliancee9df3', link: 'https://www.revolut.com/careers/position/head-financial-crime-compliance-crypto-e9df3602-32ec-4d89-a7cf-d5c811f961db/' },
];

const STATIC_JOBS_KAPPALAB: any[] = [
  { id: 'kappa-lab-quant-trader-297472',   title: 'Quant Trader',                           company: 'Kappa Lab Ltd', date: '2026-09-04', source: 'GoHire [gohire]', location: 'London, United Kingdom (Hybrid)', department: 'Quantitative Trading',  active: true, slug: 'trader', type: 'Full-time', skills: ['Quant Trading','Python','Rust','DeFi','Market Making'], link: 'https://jobs.gohire.io/kappa-lab-ltd-8jxmdnnt/quant-trader-297472/', applyUrl: 'https://jobs.gohire.io/kappa-lab-ltd-8jxmdnnt/quant-trader-297472/' },
  { id: 'kappa-lab-bd-manager-292292',     title: 'Business Development Manager - Market Making', company: 'Kappa Lab Ltd', date: '2026-09-04', source: 'GoHire [gohire]', location: 'London, United Kingdom (Hybrid)', department: 'Business Development', active: true, slug: 'bd',     type: 'Full-time', skills: ['Business Development','DeFi','Market Making','Partnerships','Crypto','Web3'], link: 'https://jobs.gohire.io/kappa-lab-ltd-8jxmdnnt/business-development-manager-market-making-292292/', applyUrl: 'https://jobs.gohire.io/kappa-lab-ltd-8jxmdnnt/business-development-manager-market-making-292292/' },
];

const STATIC_JOBS_MUDREX: any[] = [
  { id: 'mudrex-growth-marketing-lead', title: 'Growth Marketing Lead',       company: 'Mudrex', date: '2026-08-28', source: 'Manatal: Mudrex [mudrex]', location: 'Bengaluru, India (Hybrid)',     department: 'Marketing',           active: true, slug: 'growthb3d2b',     link: 'https://mudrex.com/careers/growth-marketing-lead' },
  { id: 'mudrex-compliance-officer',    title: 'Compliance & AML Officer',    company: 'Mudrex', date: '2026-08-28', source: 'Manatal: Mudrex [mudrex]', location: 'Bengaluru, India / Remote', department: 'Compliance & Legal',  active: true, slug: 'compliancer3c2cf', link: 'https://mudrex.com/careers/compliance-officer' },
];

const STATIC_JOBS_FRANKLIN: any[] = [
  { id: 'franklin-blockchain-engineer',          title: 'Blockchain Engineer',          company: 'Franklin Templeton', date: '2026-09-01', source: 'Franklin Templeton Careers [franklintempletonjobs]', location: 'San Mateo, CA / Hybrid', department: 'Digital Assets Engineering', active: true, slug: 'rolengineer01', link: 'https://franklintempleton.wd5.myworkdayjobs.com/en-US/External/job/Blockchain-Engineer' },
  { id: 'franklin-digital-assets-product-manager', title: 'Product Manager, Digital Assets', company: 'Franklin Templeton', date: '2026-09-01', source: 'Franklin Templeton Careers [franklintempletonjobs]', location: 'San Mateo, CA / Remote', department: 'Digital Assets Product', active: true, slug: 'roleproduct01',  link: 'https://franklintempleton.wd5.myworkdayjobs.com/en-US/External/job/Product-Manager-Digital-Assets' },
  { id: 'franklin-digital-assets-counsel',       title: 'Counsel, Digital Assets',      company: 'Franklin Templeton', date: '2026-09-01', source: 'Franklin Templeton Careers [franklintempletonjobs]', location: 'New York, NY / Hybrid',  department: 'Legal & Compliance',         active: true, slug: 'rolecounsel01', link: 'https://franklintempleton.wd5.myworkdayjobs.com/en-US/External/job/Counsel-Digital-Assets' },
  { id: 'franklin-blockchain-analyst',           title: 'Blockchain Analyst',            company: 'Franklin Templeton', date: '2026-09-01', source: 'Franklin Templeton Careers [franklintempletonjobs]', location: 'Remote',                 department: 'Digital Assets Research',    active: true, slug: 'roleanalyst01', link: 'https://franklintempleton.wd5.myworkdayjobs.com/en-US/External/job/Blockchain-Analyst' },
  { id: 'franklin-defi-portfolio-manager',       title: 'DeFi Portfolio Manager',       company: 'Franklin Templeton', date: '2026-09-01', source: 'Franklin Templeton Careers [franklintempletonjobs]', location: 'New York, NY / Remote',   department: 'Investment Management',      active: true, slug: 'roleportfolio01', link: 'https://franklintempleton.wd5.myworkdayjobs.com/en-US/External/job/DeFi-Portfolio-Manager' },
];

function ingestStaticJobs(label: string, staticJobs: any[], cacheData: any[], descData: Record<string, string>): void {
  let added = 0, updated = 0;
  for (const job of staticJobs) {
    const r = upsertJob(cacheData, job);
    if (r === 'added') added++; else updated++;
    if (job.description) descData[job.id] = job.description;
  }
  console.log(`  ✓ [Static] ${label}: ${added} added, ${updated} updated`);
}

// ---------------------------------------------------------------------------
// 7. Special cases
// ---------------------------------------------------------------------------

async function ingestCoinDCX(): Promise<void> {
  console.log('\n--- CoinDCX Official Portal (Python subprocess) ---');
  const pyCode = `import urllib.request, json, re, os
url = 'https://careers.coindcx.com/opportunities/openings'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')
bid_match = re.search(r'"buildId":"([^"]+)"', html)
bid = bid_match.group(1) if bid_match else 'GQbDBQVMYIBrxA3ondjW4'
data_url = f'https://careers.coindcx.com/_next/data/{bid}/opportunities/openings.json'
req2 = urllib.request.Request(data_url, headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json', 'x-nextjs-data': '1'})
with urllib.request.urlopen(req2) as resp:
    data = json.loads(resp.read().decode('utf-8'))
raw_jobs = data['pageProps']['initialNextHireState']['careersJobsList']
cache_path = os.path.join(os.getcwd(), 'content/jobs-cache.json')
with open(cache_path, 'r') as f:
    cache_data = json.load(f)
non_coindcx = [j for j in cache_data if j.get('company', '').lower() != 'coindcx']
ingested = []
for j in raw_jobs:
    req_id = j.get('requisitionId')
    if not req_id: continue
    title = j.get('requisitionTitle') or 'Role at CoinDCX'
    if re.search(r'general application|spontaneous application|open application|future opportunities|talent pool|talent network|expression of interest', title, re.I): continue
    dept = j.get('orgUnitName') or 'CoinDCX'
    locs = j.get('officeLocationNames') or []
    loc_str = ', '.join(locs) if locs else 'Bangalore, India'
    job_link = f'https://careers.coindcx.com/opportunities/openings?jobId={req_id}'
    ingested.append({'id': f'coindcx-{req_id}', 'title': title, 'company': 'CoinDCX', 'location': loc_str, 'type': 'Full-time', 'date': '${TODAY}', 'source': 'CoinDCX Official Portal [coindcx]', 'link': job_link, 'applyUrl': job_link, 'department': dept, 'skills': ['Web3', 'Crypto', 'Exchange', 'Fintech', 'Trading'], 'slug': f'coindcx{req_id}'})
updated = ingested + non_coindcx
with open(cache_path, 'w') as f:
    json.dump(updated, f, indent=2)
print(f'  * [CoinDCX]: Ingested {len(ingested)} official job openings!')
`;
  const pyPath = path.join(process.cwd(), 'scripts/_coindcx_fetch.py');
  try {
    fs.writeFileSync(pyPath, pyCode.trim());
    execFileSync('python3', [pyPath], { stdio: 'inherit' });
  } catch (err: any) {
    console.error(`  ✗ [CoinDCX] failed: ${err.message}`);
  } finally {
    if (fs.existsSync(pyPath)) fs.unlinkSync(pyPath);
  }
}

function ingestLongHash(cacheData: any[]): void {
  console.log('\n--- LongHash (offline Getro snapshot) ---');
  const filePath = path.join(process.cwd(), 'getro-success-0.json');
  if (!fs.existsSync(filePath)) { console.log('  getro-success-0.json not found, skipping.'); return; }
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')).results?.jobs || [];
  let added = 0;
  for (const j of raw) {
    const pubTime = (j.created_at || j.published_at || 0) * 1000;
    if (pubTime < CUTOFF) continue;
    const company = j.organization?.name || j.company_name || 'LongHash Portfolio';
    const jobUrl = j.url || j.apply_url;
    const uuidMatch = jobUrl?.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    const jobId = uuidMatch ? uuidMatch[1] : (j.id ? String(j.id) : jobUrl);
    const job = { id: jobId, title: j.title, company, link: jobUrl, date: new Date(pubTime).toISOString().slice(0, 10), source: `LongHash: ${company} [longhash]`, location: j.searchable_locations?.join(', ') || j.work_mode || 'Remote', department: j.job_function || j.department || 'Engineering', active: true, slug: `role${String(jobId).replace(/[^a-z0-9]/gi,'').slice(-5).toLowerCase()}` };
    if (!cacheData.some((e: any) => e.id === job.id || e.link === job.link)) { cacheData.unshift(job); added++; }
  }
  console.log(`  ✓ LongHash: ${added} added`);
}

function ingestXT(cacheData: any[]): void {
  console.log('\n--- XT.com (offline JSON snapshot) ---');
  const filePath = path.join(process.cwd(), 'xt-api-jobs.json');
  if (!fs.existsSync(filePath)) { console.log('  xt-api-jobs.json not found, skipping.'); return; }
  const items = JSON.parse(fs.readFileSync(filePath, 'utf8')).data?.items || [];
  let added = 0;
  for (const j of items) {
    const pubTime = j.publishedAt ? new Date(j.publishedAt).getTime() : 0;
    if (pubTime < CUTOFF) continue;
    const id = `xt-${j.id}`;
    const job = { id, title: j.title, company: 'XT.com Exchange', link: `https://www.xt.com/en/careers#position-${j.id}`, date: new Date(pubTime).toISOString().slice(0, 10), source: 'XT.com Careers [xt.com]', location: j.locations?.[0]?.address || j.locations?.[0]?.country || 'Remote / Dubai / Global', department: 'Exchange Operations', active: true, slug: `role${id.slice(-5).toLowerCase()}` };
    if (!cacheData.some((e: any) => e.id === job.id || e.link === job.link)) { cacheData.unshift(job); added++; }
  }
  console.log(`  ✓ XT.com: ${added} added`);
}

async function ingestMarketnode(cacheData: any[], descData: Record<string, string>): Promise<void> {
  console.log('\n--- Marketnode (OmniHR scrape) ---');
  try {
    const res = await fetch('https://marketnode.recruit.omnihr.co/careers', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
    if (!m) { console.warn('  Could not find __NEXT_DATA__ on Marketnode careers page'); return; }
    const jobs = JSON.parse(m[1]).props?.pageProps?.job_data?.jobs || [];
    let added = 0, updated = 0;
    for (const j of jobs) {
      const slug = j.slug || j.job_title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const id = `mn-${slug}`;
      const job = { id, title: j.job_title, company: 'Marketnode', link: `https://marketnode.recruit.omnihr.co/careers/${slug}`, date: j.location_attributes?.created_at?.slice(0, 10) || TODAY, source: 'OmniHR: Marketnode [omnihr]', location: j.location_attributes?.city ? `${j.location_attributes.city}, ${j.location_attributes.country}` : (j.city_country || 'Remote / Hybrid'), department: j.department?.name || 'Engineering', active: true, slug: `role${id.slice(-5).toLowerCase()}` };
      const r = upsertJob(cacheData, job);
      if (r === 'added') added++; else updated++;
      if (j.description) descData[job.id] = j.description;
    }
    console.log(`  ✓ Marketnode: ${added} added, ${updated} updated`);
  } catch (err: any) { console.error(`  ✗ Marketnode failed: ${err.message}`); }
}

// ---------------------------------------------------------------------------
// 8. main()
// ---------------------------------------------------------------------------

async function main() {
  console.log('🚀 Starting unified job ingestion pipeline...');
  const startTime = Date.now();

  const cacheData = readCache();
  const descData  = readDescCache();

  // Fan-out feeds
  await ingestFanOutFeeds('Global Ecosystem Feeds', GLOBAL_ECOSYSTEM_FEEDS, cacheData);
  await ingestFanOutFeeds('Regional Feeds (Africa, Asia, HK)', REGIONAL_FEEDS, cacheData);
  await ingestFanOutFeeds('Untracked Web3 & AI Feeds', UNTRACKED_FEEDS, cacheData);

  // Fresh feeds with 30-day cutoff
  console.log('\n--- Fresh Feeds (30-day cutoff) ---');
  for (const f of FRESH_FEEDS) {
    try {
      const res = await fetch(f.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      const json = await res.json() as any;
      const rawJobs = json.jobs || [];
      let added = 0;
      for (const j of rawJobs) {
        const pubStr = j.publishedAt || j.updated_at || j.created_at || '';
        const pubTime = pubStr ? new Date(pubStr).getTime() : 0;
        if (pubTime < CUTOFF) continue;
        const job = { id: String(j.id), title: (j.title || j.text || '').trim(), company: f.company, link: j.jobUrl || j.absolute_url || j.hostedUrl || `https://jobs.ashbyhq.com/${f.slug}/${j.id}`, date: pubStr ? new Date(pubTime).toISOString().slice(0, 10) : TODAY, source: `${f.type}: ${f.company} [${f.slug}]`, location: j.location?.name || j.location || j.categories?.location || 'Remote', department: j.departments?.[0]?.name || j.department || j.categories?.department || 'Engineering', active: true, slug: `role${String(j.id).replace(/[^a-z0-9]/gi,'').slice(-5).toLowerCase()}` };
        if (!cacheData.some((e: any) => e.id === job.id || e.link === job.link)) { cacheData.unshift(job); added++; }
      }
      if (added > 0) console.log(`  ✓ [${f.company}]: ${added} new`);
    } catch (err: any) { console.warn(`  ⚠️ [${f.company}] fresh feed failed: ${err.message}`); }
  }

  // Single-company boards (full upsert + descriptions)
  console.log('\n--- Single-company Ashby boards ---');
  await ingestAshbySimple('Monad Foundation',  'monad.foundation',      'New York City / Remote', cacheData, descData);
  await ingestAshbySimple('Sky Mavis',          'skymavis',              'Remote / APAC',          cacheData, descData);
  await ingestAshbySimple('Hyperliquid Labs',   'Hyperliquid%20Labs',    'APAC / Remote',          cacheData, descData);
  await ingestAshbySimple('Solana Foundation',  'Solana%20Foundation',   'Remote / Global',        cacheData, descData);
  await ingestAshbySimple('Solana Labs',        'solanalabs',            'San Francisco / Remote', cacheData, descData);

  console.log('\n--- Single-company Greenhouse boards ---');
  await ingestGreenhouse('Digital Asset',       'digitalassetcorp',      'New York City / Remote', cacheData, descData);
  await ingestGreenhouse('Ondo Finance',        'ondo',                  'New York, NY / Remote',  cacheData, descData);

  console.log('\n--- Lever boards ---');
  await ingestLever('Wintermute', 'wintermute-trading', cacheData, descData);
  await ingestLever('CertiK (detailed)', 'certik', cacheData, descData);

  console.log('\n--- BambooHR boards ---');
  await ingestBambooHR('Mercuryo', 'mercuryo', cacheData);

  console.log('\n--- MokaHR boards ---');
  await ingestMokaHR('KuCoin', 'kcareers', 100000192, 'https://hire-r1.mokahr.com/social-recruitment/kcareers/100000192?locale=en-US', cacheData, descData);
  await ingestMokaHR('Bitget', 'bitget',   100000079, 'https://hire-r1.mokahr.com/social-recruitment/bitget/100000079',                cacheData, descData);

  // OmniHR + offline snapshots
  await ingestMarketnode(cacheData, descData);
  ingestLongHash(cacheData);
  ingestXT(cacheData);

  // Static job arrays
  console.log('\n--- Static job arrays ---');
  ingestStaticJobs('PwC',              STATIC_JOBS_PwC,      cacheData, descData);
  ingestStaticJobs('Revolut',          STATIC_JOBS_REVOLUT,  cacheData, descData);
  ingestStaticJobs('KappaLab',         STATIC_JOBS_KAPPALAB, cacheData, descData);
  ingestStaticJobs('Mudrex',           STATIC_JOBS_MUDREX,   cacheData, descData);
  ingestStaticJobs('Franklin Templeton', STATIC_JOBS_FRANKLIN, cacheData, descData);

  // Flush cache & descriptions
  writeCache(cacheData);
  writeDescCache(descData);

  // CoinDCX uses Python and writes the cache itself
  await ingestCoinDCX();

  // Post-processing
  console.log('\n⏳ Prebaking slugs...');
  try { execSync('node scripts/prebake_slugs.js', { stdio: 'inherit' }); } catch {}

  console.log('\n⏳ Verifying integrity...');
  try { execSync('npx tsx scripts/verify-jobs-integrity.ts', { stdio: 'inherit' }); } catch {}

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✨ Pipeline finished in ${duration}s! Total jobs: ${readCache().length}`);
}

main().catch(err => { console.error('🔥 Pipeline failed:', err); process.exit(1); });