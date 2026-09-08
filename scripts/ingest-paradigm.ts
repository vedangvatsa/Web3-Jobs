import fs from 'fs';
import path from 'path';
import { cleanCompanyName, isConcreteJobOpening } from '../src/lib/job-filters';
import { getOneWordRole, getJobContentKey } from '../src/lib/job-slugs';

const CACHE_PATH = path.join(process.cwd(), 'content/jobs-cache.json');
const DESC_PATH = path.join(process.cwd(), 'content/job-descriptions.json');
const TODAY = new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// Companies covered by DIRECT ATS feeds in ingest-all.ts.
// We skip these in the Paradigm scraper to avoid duplicates — their jobs are
// already ingested at source via Ashby / Greenhouse / Lever APIs.
// ---------------------------------------------------------------------------
const DIRECTLY_COVERED_COMPANIES = new Set([
  // GLOBAL_ECOSYSTEM_FEEDS
  'fireblocks', 'bitgo', 'gemini', 'flow traders', 'certik', 'a16z crypto',
  'injective', 'ritual', 'arbitrum', 'render network', 'phantom', 'morpho',
  'safe', 'uniswap labs', 'uniswap', 'ethena labs', 'optimism', 'consensys',
  'compound', 'jump crypto', 'trm labs', 'openzeppelin', 'mysten labs',
  'immunefi', 'ramp', 'ramp network',
  // REGIONAL_FEEDS
  'yellow card', 'luno', 'bybit', 'coinhako', 'coingecko', 'amber group',
  'animoca brands',
  // UNTRACKED_FEEDS
  'cantina', 'turnkey', 'hyperbolic', '0g labs', 'grass', 'sahara ai',
  'chainstack', 'helius', 'nomic foundation', 'movement labs', 'symbiotic',
  'aztec labs', 'succinct labs', 'magic eden', 'foundation',
  // FRESH_FEEDS
  'matter labs', 'layerzero', 'jito labs', 'opensea', 'aptos labs',
  'eigenlayer', 'bastion', 'worldcoin', 'alchemy', 'talos trading',
  // Other direct feeds in the pipeline
  'chainalysis', 'moonpay', 'lightspark', 'kalshi', 'monad foundation',
  'monad', 'ellipsis labs', 'sky mavis', 'hyperliquid labs', 'hyperliquid',
  'gauntlet', 'coinswitch', 'coinswitch kuber',
]);

// ---------------------------------------------------------------------------
// Paradigm portfolio — crypto/web3 companies NOT already in direct feeds.
// These are the companies we will add via the Paradigm HTML scrape.
// ---------------------------------------------------------------------------
const PARADIGM_WEB3_COMPANIES = new Set([
  // Not in direct feeds — worth scraping from Paradigm
  'taxbit',
  'privy',
  'bitso',
  'axiom',
  'babylon labs',
  'babylon',
  '3jane',
  'sorella labs',
  'sorella',
  'exponential.fi',
  'exponential',
  'lido',
  'vana',
  'succinct',    // note: succinct labs is in direct feeds but "succinct" alone is ok
  'conduit',
  'cosmos network',
  'cosmos',
  'paradigm',
  'andromeda',
  'd3',
  'agora',
  'category labs',
  'matrixport',
  'nous research',
  'mad realities',
  'lootrush',
  'loot rush',
  'rift',
  'n3xt',
  'plural',
  'crown',
  'divine',
  'noise',
  'ventuals',
  'hang',
  'mesh',
  'limit break',
]);

function isParadigmWeb3Company(company: string): boolean {
  const c = company.toLowerCase().trim();
  // Skip if already covered by a direct ATS feed
  if (DIRECTLY_COVERED_COMPANIES.has(c)) return false;
  for (const covered of DIRECTLY_COVERED_COMPANIES) {
    if (c === covered || c.startsWith(covered + ' ') || covered.startsWith(c + ' ')) return false;
  }
  // Include if in our paradigm-only whitelist
  if (PARADIGM_WEB3_COMPANIES.has(c)) return true;
  for (const known of PARADIGM_WEB3_COMPANIES) {
    if (c.startsWith(known) || known.startsWith(c)) return true;
  }
  return false;
}

/** Normalize a job link: strip UTM params and trailing slash for dedup comparison. */
function normalizeLink(link: string): string {
  if (!link) return '';
  try {
    const u = new URL(link);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'source'].forEach(p => u.searchParams.delete(p));
    return u.toString().replace(/\/$/, '').toLowerCase();
  } catch {
    return link.split('?')[0].replace(/\/$/, '').toLowerCase();
  }
}

function readCache(): any[] {
  return fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')) : [];
}
function writeCache(data: any[]): void {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2) + '\n');
}
function readDescCache(): Record<string, string> {
  return fs.existsSync(DESC_PATH) ? JSON.parse(fs.readFileSync(DESC_PATH, 'utf8')) : {};
}
function writeDescCache(data: Record<string, string>): void {
  fs.writeFileSync(DESC_PATH, JSON.stringify(data, null, 2) + '\n');
}

function upsertJob(cacheData: any[], job: any): 'added' | 'updated' | 'skipped' {
  const normNew = normalizeLink(job.link);
  const idx = cacheData.findIndex((e: any) => {
    if (e.id === job.id) return true;
    if (normNew && normalizeLink(e.link) === normNew) return true;
    return false;
  });
  if (idx === -1) {
    cacheData.unshift(job);
    return 'added';
  }
  // If existing job is from a direct feed (non-Paradigm), don't overwrite it
  const existing = cacheData[idx];
  if (existing.source && !existing.source.includes('Paradigm Portfolio')) {
    // Already covered by a direct feed — skip silently
    return 'skipped';
  }
  cacheData[idx] = { ...existing, ...job, slug: existing.slug || job.slug };
  return 'updated';
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function extractSpanText(html: string, className: string): string {
  const m = html.match(new RegExp(`<span[^>]*class="[^"]*${className}[^"]*"[^>]*>([\\s\\S]*?)</span>`));
  return m ? stripHtml(m[1]) : '';
}

function parsePostedDate(posted: string): string {
  if (!posted) return TODAY;
  const m = posted.match(/(\d+)\s*day/i);
  if (m) {
    const d = new Date();
    d.setDate(d.getDate() - parseInt(m[1]));
    return d.toISOString().slice(0, 10);
  }
  if (/today|just now/i.test(posted)) return TODAY;
  if (/yesterday/i.test(posted)) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  return TODAY;
}

function deriveDepartment(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('engineer') || t.includes('developer') || t.includes('solidity') || t.includes('rust') || t.includes('protocol') || t.includes('blockchain')) return 'Engineering';
  if (t.includes('design') || t.includes('ui') || t.includes('ux')) return 'Design';
  if (t.includes('product') || t.includes(' pm ') || t.startsWith('pm ') || t.endsWith(' pm')) return 'Product';
  if (t.includes('marketing') || t.includes('growth') || t.includes('brand')) return 'Marketing';
  if (t.includes('sales') || t.includes('business development') || t.includes(' bd ') || t.includes('partnership')) return 'Business Development';
  if (t.includes('research') || t.includes('analyst') || t.includes('quant')) return 'Research';
  if (t.includes('legal') || t.includes('compliance') || t.includes('counsel')) return 'Legal & Compliance';
  if (t.includes('operations') || t.includes(' ops')) return 'Operations';
  if (t.includes('recruit') || t.includes('talent') || t.includes('people') || t.includes(' hr ')) return 'People & HR';
  if (t.includes('finance') || t.includes('accounting') || t.includes('treasury')) return 'Finance';
  if (t.includes('security') || t.includes('audit')) return 'Security';
  if (t.includes('data') || t.includes('analytics')) return 'Data & Analytics';
  if (t.includes('devrel') || t.includes('developer relations') || t.includes('community') || t.includes('ecosystem')) return 'Community & DevRel';
  return 'Web3';
}

export async function ingestParadigm(
  passedCache?: any[],
  passedDesc?: Record<string, string>
): Promise<{ added: number; updated: number; skipped: number; total: number }> {
  console.log('Fetching paradigm.xyz/careers...');

  let html = '';
  try {
    const res = await fetch('https://www.paradigm.xyz/careers', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    html = await res.text();
  } catch (e) {
    console.error('Failed to fetch Paradigm careers page:', e);
    return { added: 0, updated: 0, skipped: 0, total: 0 };
  }

  const rowPattern = /<li[^>]*class="job-row[^"]*"[^>]*>([\s\S]*?)<\/li>/g;
  const rows: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = rowPattern.exec(html)) !== null) {
    rows.push(m[0]);
  }

  console.log(`Found ${rows.length} total job rows on Paradigm careers page.`);

  const cacheData = passedCache || readCache();
  const descData = passedDesc || readDescCache();

  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let filteredCount = 0;

  // Build a set of normalized links already in the cache (for fast dedup)
  const existingLinks = new Set(cacheData.map((j: any) => normalizeLink(j.link)));

  for (const row of rows) {
    const linkMatch = row.match(/href="([^"]+)"/);
    const ariaMatch = row.match(/aria-label="([^"]+)"/);
    if (!linkMatch || !ariaMatch) continue;

    const link = linkMatch[1];
    const ariaLabel = ariaMatch[1].replace(/&amp;/g, '&');

    // aria-label format: "Company – Title" (uses en-dash U+2013)
    const dashIdx = ariaLabel.indexOf(' \u2013 ');
    if (dashIdx === -1) continue;
    const company = ariaLabel.slice(0, dashIdx).trim();
    const title = ariaLabel.slice(dashIdx + 3).trim();

    // Filter 1: only web3 companies not already in direct feeds
    if (!isParadigmWeb3Company(company)) {
      filteredCount++;
      continue;
    }

    // Filter 2: skip general/placeholder/unrelated titles
    if (!isConcreteJobOpening(title, link)) {
      filteredCount++;
      continue;
    }

    // Filter 3: skip if this exact link (normalized) already exists in cache
    const normLink = normalizeLink(link);
    if (existingLinks.has(normLink)) {
      skippedCount++;
      continue;
    }

    const locationRaw = extractSpanText(row, 'meta-item--location');
    const postedRaw = extractSpanText(row, 'meta-item--posted');
    const salaryRaw = extractSpanText(row, 'meta-item--salary');

    const location = locationRaw || 'Remote / Global';
    const date = parsePostedDate(postedRaw);

    // Unique slug from ATS link segments (strip utm first)
    const cleanLink = link.replace(/[?#].*$/, '');
    const linkId = cleanLink
      .split('/')
      .filter(Boolean)
      .slice(-2)
      .join('-')
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase()
      .slice(0, 40);

    const roleWord = getOneWordRole(title);
    const slug = `${roleWord}-${linkId}`.replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

    const cleanedCompany = cleanCompanyName(company);
    const department = deriveDepartment(title);

    const descHtml = [
      `<p>Role at <strong>${cleanedCompany}</strong> via the Paradigm portfolio.</p>`,
      salaryRaw ? `<p><strong>Compensation:</strong> ${salaryRaw}</p>` : '',
      `<p><strong>Location:</strong> ${location}</p>`,
      `<p>This is a direct link to the company's application page.</p>`,
    ].filter(Boolean).join('\n');

    const jobEntry = {
      id: `paradigm-${slug}`,
      title: title,
      company: cleanedCompany,
      link: link,
      date: date,
      source: `Paradigm Portfolio: ${cleanedCompany}`,
      location: location,
      department: department,
      active: true,
      slug: slug,
      tags: [],
      skills: [],
      type: 'Full-time',
    };

    const res = upsertJob(cacheData, jobEntry);
    if (res === 'added') {
      addedCount++;
      existingLinks.add(normLink);
    } else if (res === 'updated') {
      updatedCount++;
    } else {
      skippedCount++;
    }

    if (res !== 'skipped') {
      descData[slug] = descHtml;
      descData[getJobContentKey(jobEntry)] = descHtml;
    }
  }

  if (!passedCache) {
    writeCache(cacheData);
    writeDescCache(descData);
  }

  const web3Total = addedCount + updatedCount + skippedCount;
  console.log(`\n========================================`);
  console.log(`Paradigm Ingestion Complete:`);
  console.log(`- Total rows on page: ${rows.length}`);
  console.log(`- Filtered out (non-web3 or directly covered): ${filteredCount}`);
  console.log(`- Web3 roles seen: ${web3Total}`);
  console.log(`- Added (net new): ${addedCount}`);
  console.log(`- Updated (Paradigm→Paradigm): ${updatedCount}`);
  console.log(`- Skipped (already in cache): ${skippedCount}`);
  console.log(`- Total Jobs in Cache: ${cacheData.length}`);
  console.log(`========================================\n`);

  return { added: addedCount, updated: updatedCount, skipped: skippedCount, total: web3Total };
}

if (require.main === module) {
  ingestParadigm().catch(console.error);
}
