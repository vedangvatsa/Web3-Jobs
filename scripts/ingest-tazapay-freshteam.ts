import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { isConcreteJobOpening } from '../src/lib/job-filters';
import { jobAgeExclusionReason } from '../src/lib/job-age-policy.mjs';
import { getOneWordRole, getJobContentKey } from '../src/lib/job-slugs';
import { sanitizeDescriptionHtml } from '../src/lib/sanitize-html';
import {
  readJobDescriptionStore,
  writeJobDescriptionStore,
  buildJobDescriptionAliases,
} from './lib/job-description-store';

const TODAY = new Date().toISOString().slice(0, 10);
const FRESHTEAM_BOARD_URL = 'https://tazapay.freshteam.com/jobs';
const FRESHTEAM_ORIGIN = 'https://tazapay.freshteam.com';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface ParsedFreshteamJob {
  id: string;
  title: string;
  link: string;
  datePosted: string;
  employmentType?: string;
  location?: string;
  department?: string;
  descriptionHtml?: string;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

async function getFreshteamJobLinks(): Promise<string[]> {
  const html = await fetchHtml(FRESHTEAM_BOARD_URL);
  const $ = cheerio.load(html);
  const links: string[] = [];

  $('a[href*="/jobs/"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('/jobs/') && href !== '/jobs' && href !== '/jobs/') {
      const fullUrl = new URL(href, FRESHTEAM_ORIGIN).href;
      if (!links.includes(fullUrl)) {
        links.push(fullUrl);
      }
    }
  });

  return links;
}

function parseLdJsonSafely(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    // Attempt clean-up of unescaped control chars / newlines in JSON strings
    try {
      const cleaned = raw.replace(/[\u0000-\u001F]+/g, (match) => {
        if (match === '\n') return '\\n';
        if (match === '\r') return '\\r';
        if (match === '\t') return '\\t';
        return '';
      });
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
}

async function parseFreshteamJob(link: string): Promise<ParsedFreshteamJob | null> {
  try {
    const html = await fetchHtml(link);
    const $ = cheerio.load(html);

    let ldJson: any = null;
    let fallbackDate = '';

    $('script[type="application/ld+json"]').each((_, el) => {
      const text = $(el).text() || '';
      const dateMatch = text.match(/"datePosted"\s*:\s*"([^"]+)"/);
      if (dateMatch && !fallbackDate) {
        fallbackDate = dateMatch[1];
      }

      const parsed = parseLdJsonSafely(text);
      if (parsed && parsed['@type'] === 'JobPosting') {
        ldJson = parsed;
      }
    });

    const urlParts = new URL(link).pathname.split('/').filter(Boolean);
    const jobId = urlParts[1] || ''; // /jobs/<id>/<slug>

    if (ldJson) {
      const title = ldJson.title || $('h1, .job-title, .heading').first().text().trim();
      const datePosted = ldJson.datePosted || fallbackDate;
      const descriptionHtml = ldJson.description || $('.job-description, .description').html() || '';
      const employmentType = ldJson.employmentType || 'Full Time';

      let locationStr = 'Remote';
      if (ldJson.jobLocation?.address) {
        const addr = ldJson.jobLocation.address;
        const locality = addr.addressRegion || addr.addressLocality || '';
        const country = addr.addressCountry || '';
        locationStr = [locality, country].filter(Boolean).join(', ') || 'Remote';
      }

      return {
        id: jobId,
        title,
        link,
        datePosted,
        employmentType,
        location: locationStr,
        department: ldJson.occupationalCategory || 'Fintech & Payments',
        descriptionHtml,
      };
    }

    // Fallback if full JSON-LD parse failed
    const title = $('h1, .heading, .job-title').first().text().trim();
    if (!title) return null;

    return {
      id: jobId,
      title,
      link,
      datePosted: fallbackDate,
      employmentType: 'Full Time',
      location: 'Remote',
      department: 'Fintech & Payments',
      descriptionHtml: $('.job-description, .description').html() || '',
    };
  } catch (err) {
    console.warn(`[Freshteam] Failed to parse job page ${link}:`, err);
    return null;
  }
}

async function main() {
  console.log(`[Tazapay Freshteam] Scanning job board: ${FRESHTEAM_BOARD_URL}`);
  const jobLinks = await getFreshteamJobLinks();
  console.log(`[Tazapay Freshteam] Found ${jobLinks.length} job postings on main board.`);

  const cachePath = path.join(process.cwd(), 'content/jobs-cache.json');
  let cacheData: any[] = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : [];
  const store = readJobDescriptionStore();

  let addedCount = 0;
  let excludedCount = 0;

  for (const link of jobLinks) {
    const parsed = await parseFreshteamJob(link);
    if (!parsed || !parsed.title) continue;

    const company = 'Tazapay';
    const job_id = `tazapay-${parsed.id}`;

    if (!isConcreteJobOpening(parsed.title, parsed.link)) {
      console.log(`[Tazapay Freshteam] Skipping non-concrete title: "${parsed.title}"`);
      continue;
    }

    // Convert datePosted to ISO YYYY-MM-DD
    let jobDate = '';
    if (parsed.datePosted) {
      try {
        const d = new Date(parsed.datePosted);
        if (!isNaN(d.getTime())) {
          jobDate = d.toISOString().slice(0, 10);
        }
      } catch {
        jobDate = '';
      }
    }

    const roleWord = getOneWordRole(parsed.title);
    const shortId = (parsed.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5) || 'job').toLowerCase();
    const slug = `${roleWord}-${shortId}`;

    const candidateJob = {
      id: job_id,
      title: parsed.title,
      company,
      location: parsed.location || 'Remote',
      type: parsed.employmentType || 'Full-time',
      date: jobDate,
      source: 'Freshteam: Tazapay',
      link: parsed.link,
      applyUrl: parsed.link,
      department: parsed.department || 'Fintech & Payments',
      skills: ['Payments', 'Web3', 'Crypto Infrastructure', 'Stablecoins', 'Cross-Border Payments', 'Fintech'],
      slug,
    };

    // Check age exclusion
    const exclusion = jobAgeExclusionReason(candidateJob, Date.now());
    if (exclusion) {
      excludedCount++;
      // console.log(`[Tazapay Freshteam] Excluded "${candidateJob.title}" (${candidateJob.date}): ${exclusion}`);
      continue;
    }

    const exists = cacheData.some(
      (existing: any) => existing.id === candidateJob.id || existing.link === candidateJob.link
    );

    if (!exists) {
      cacheData.unshift(candidateJob);
      if (parsed.descriptionHtml) {
        const cleanDesc = sanitizeDescriptionHtml(parsed.descriptionHtml);
        if (cleanDesc) {
          const contentKey = getJobContentKey(candidateJob);
          store.descriptions[contentKey] = cleanDesc;
        }
      }
      addedCount++;
      console.log(`[Tazapay Freshteam] Added fresh job: "${candidateJob.title}" (${candidateJob.date})`);
    }
  }

  console.log(`[Tazapay Freshteam] Processed ${jobLinks.length} jobs: ${addedCount} added fresh, ${excludedCount} excluded as aged/expired.`);

  if (addedCount > 0) {
    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2), 'utf8');
    store.aliases = buildJobDescriptionAliases(cacheData, store.descriptions);
    writeJobDescriptionStore(store);
    console.log(`[Tazapay Freshteam] Updated cache and description shards.`);
  }
}

main().catch((err) => {
  console.error('[Tazapay Freshteam] Fatal error:', err);
  process.exit(1);
});
