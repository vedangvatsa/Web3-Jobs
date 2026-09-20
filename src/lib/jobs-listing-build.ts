import type { Job } from '@/types';
import { cleanPublishText } from '@/lib/noslop';
import { getJobIdentity } from './job-slugs';
import { isConcreteJobOpening, cleanCompanyName } from './job-filters';

const BLOCKED_COMPANIES = new Set([
  'notion', 'ashby', 'merge', 'salt ai', 'workable',
  'button', 'breeze', 'citadel securities', 'zipline',
  'greenhouse', 'lever', 'greenhouse io', 'ad-shield', 'adshield', 'vivident', 'hyperithm',
]);

const BLOCKED_JOB_TITLE = /\b(technician|driver|maid|cleaner|janitor|custodian|housekeeper|warehouse|forklift|security guard|receptionist|plumber|electrician|mechanic|repair|hvac|data centre mechanical|data center mechanical|maintenance|assembly technician|quality technician|field service technician)\b/i;

function cleanJobTitle(title: string, company?: string): string {
  let cleaned = title.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

  if (company) {
    const escaped = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prefixPattern = new RegExp(`^${escaped}\\s*[-\\u2013:]\\s*`, 'i');
    const withoutPrefix = cleaned.replace(prefixPattern, '').trim();
    if (withoutPrefix.length > 0) {
      cleaned = withoutPrefix;
    }
  }

  cleaned = cleaned
    .replace(/\s*[\(\[]\s*Partner\s+\d+(?:\s*,\s*Partner\s+\d+)*\s*[\)\]]/gi, '')
    .replace(/^Partner\s+\d+\s*(?:,\s*|[-\u2013:]\s*|\s+)/i, '')
    .replace(/(?:\s*,\s*|\s*[-\u2013:]\s*|\s+)Partner\s+\d+(?:\s*,\s*Partner\s+\d+)*/gi, '')
    .trim();

  cleaned = cleaned.replace(/^Software Engineer,\s*Software Factory$/i, 'Software Engineer');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  cleaned = cleaned
    .replace(/\bUx\b/g, 'UX')
    .replace(/\bUi\b/g, 'UI')
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bMl\b/g, 'ML')
    .replace(/\bSeo\b/g, 'SEO')
    .replace(/\bQa\b/g, 'QA')
    .replace(/\bVp\b/g, 'VP')
    .replace(/\bCto\b/g, 'CTO')
    .replace(/\bCeo\b/g, 'CEO')
    .replace(/\bCfo\b/g, 'CFO')
    .replace(/\bCoo\b/g, 'COO')
    .replace(/\bBd\b/g, 'BD')
    .replace(/\bPr\b/g, 'PR')
    .replace(/\bIr\b/g, 'IR')
    .replace(/\bRwa\b/g, 'RWA')
    .replace(/\bAmm\b/g, 'AMM')
    .replace(/\bDex\b/g, 'DEX')
    .replace(/\bCex\b/g, 'CEX')
    .replace(/\bSdk\b/g, 'SDK')
    .replace(/\bApi\b/g, 'API')
    .replace(/\bApis\b/g, 'APIs')
    .replace(/\bDefi\b/g, 'DeFi')
    .replace(/\bNft\b/g, 'NFT')
    .replace(/\bNfts\b/g, 'NFTs')
    .replace(/\bDao\b/g, 'DAO')
    .replace(/\bEvm\b/g, 'EVM')
    .replace(/\bZk\b/g, 'ZK')
    .replace(/\bSre\b/g, 'SRE')
    .replace(/\bDevops\b/g, 'DevOps');

  return cleanPublishText(cleaned.length > 0 ? cleaned : title.trim());
}

function sourceQuality(job: Job): number {
  const source = job.source.toLowerCase();
  if (/^(greenhouse|lever|ashby|workable|recruitee|workday|smartrecruiters|breezy|bamboohr|comeet|teamtailor|rippling|firstparty|superteam):/.test(source)) return 3;
  if (!source.startsWith('http')) return 2;
  return 1;
}

function deduplicateJobs(jobs: Job[]): Job[] {
  const byIdentity = new Map<string, Job>();

  for (const job of jobs) {
    const identity = getJobIdentity(job);
    const existing = byIdentity.get(identity);
    if (!existing || sourceQuality(job) > sourceQuality(existing)) {
      byIdentity.set(identity, job);
    }
  }

  return [...byIdentity.values()];
}

function distributeJobsByCompany(jobs: Job[]): Job[] {
  const MAX_CONSECUTIVE = 2;

  const groups = new Map<string, Job[]>();
  for (const job of jobs) {
    const key = job.company.toLowerCase();
    const arr = groups.get(key);
    if (arr) arr.push(job);
    else groups.set(key, [job]);
  }

  const sorted = Array.from(groups.values()).sort(
    (a, b) => new Date(b[0].date).getTime() - new Date(a[0].date).getTime(),
  );

  const result: Job[] = [];
  const pointers = new Array(sorted.length).fill(0);
  let hasMore = true;

  while (hasMore) {
    hasMore = false;
    for (let i = 0; i < sorted.length; i++) {
      const group = sorted[i];
      const start = pointers[i];
      const end = Math.min(start + MAX_CONSECUTIVE, group.length);
      for (let j = start; j < end; j++) result.push(group[j]);
      pointers[i] = end;
      if (end < group.length) hasMore = true;
    }
  }

  return result;
}

/** Build the listing order used by the site/API (run at build/refresh time on Node). */
export function buildJobsListing(rawJobs: Job[]): Job[] {
  const jobs: Job[] = rawJobs.map((job: Job) => {
    let loc = job.location || '';
    if (typeof loc === 'string' && loc.includes(',')) {
      const parts = loc.split(',').map((p) => p.trim()).filter(Boolean);
      const unique: string[] = [];
      for (const p of parts) {
        if (!unique.some((u) => u.toLowerCase() === p.toLowerCase())) {
          unique.push(p);
        }
      }
      loc = unique.join(', ');
    }
    return {
      ...job,
      location: loc,
      title: cleanJobTitle(job.title, job.company),
      company: cleanCompanyName(cleanPublishText(job.company)),
    };
  });

  const web3Jobs = jobs.filter((job) => {
    if (job.active === false) return false;
    if (BLOCKED_COMPANIES.has(job.company.toLowerCase())) return false;
    if (BLOCKED_JOB_TITLE.test(job.title)) return false;
    if (!isConcreteJobOpening(job.title, job.link)) return false;
    return true;
  });

  const uniqueJobs = deduplicateJobs(web3Jobs);
  return distributeJobsByCompany(uniqueJobs);
}
