import fs from 'fs';
import path from 'path';
import { cleanCompanyName, isConcreteJobOpening } from '../src/lib/job-filters';
import { getOneWordRole, getJobContentKey } from '../src/lib/job-slugs';

const CACHE_PATH = path.join(process.cwd(), 'content/jobs-cache.json');
const DESC_PATH = path.join(process.cwd(), 'content/job-descriptions.json');
const TODAY = new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// Paradigm portfolio — crypto/web3 companies only.
// Non-web3 companies in the portfolio (Stripe, Revolut, Zipline, True Anomaly,
// Citadel Securities, SendCutSend, Antares, etc.) are deliberately excluded.
// ---------------------------------------------------------------------------
const PARADIGM_WEB3_COMPANIES = new Set([
  'fireblocks',
  'chainalysis',
  'moonpay',
  'mesh',
  'phantom',
  'morpho labs',
  'ellipsis labs',
  'coinswitch kuber',
  'coinswitch',
  'taxbit',
  'uniswap',
  'limit break',
  'gauntlet',
  'monad foundation',
  'monad',
  'privy',
  'bitso',
  'sky mavis',
  'symbiotic',
  'magic eden',
  'axiom',
  'babylon labs',
  'babylon',
  'lightspark',
  'opensea',
  '3jane',
  'hyperliquid',
  'sorella labs',
  'sorella',
  'exponential.fi',
  'exponential',
  'lido',
  'vana',
  'succinct',
  'conduit',
  'cosmos network',
  'cosmos',
  'paradigm',
  'andromeda',
  'd3',
  'agora',
  'category labs',
  'kalshi',
  'matrixport',
  'amber group',
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
]);

function isParadigmWeb3Company(company: string): boolean {
  const c = company.toLowerCase().trim();
  if (PARADIGM_WEB3_COMPANIES.has(c)) return true;
  for (const known of PARADIGM_WEB3_COMPANIES) {
    if (c.startsWith(known) || known.startsWith(c)) return true;
  }
  return false;
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
function upsertJob(cacheData: any[], job: any): 'added' | 'updated' {
  const idx = cacheData.findIndex((e: any) => e.id === job.id || e.link === job.link);
  if (idx === -1) { cacheData.unshift(job); return 'added'; }
  cacheData[idx] = { ...cacheData[idx], ...job, slug: cacheData[idx].slug || job.slug };
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
): Promise<{ added: number; updated: number; total: number }> {
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
    return { added: 0, updated: 0, total: 0 };
  }

  // Parse all <li class="job-row ..."> blocks
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
  let filteredCount = 0;

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

    // Filter 1: only web3 companies
    if (!isParadigmWeb3Company(company)) {
      filteredCount++;
      continue;
    }

    // Filter 2: skip general/placeholder/unrelated titles
    if (!isConcreteJobOpening(title, link)) {
      filteredCount++;
      continue;
    }

    const locationRaw = extractSpanText(row, 'meta-item--location');
    const postedRaw = extractSpanText(row, 'meta-item--posted');
    const salaryRaw = extractSpanText(row, 'meta-item--salary');

    const location = locationRaw || 'Remote / Global';
    const date = parsePostedDate(postedRaw);

    // Unique slug from ATS link segments
    const linkId = link
      .replace(/[?#].*$/, '')
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
    if (res === 'added') addedCount++;
    else updatedCount++;

    descData[slug] = descHtml;
    descData[getJobContentKey(jobEntry)] = descHtml;
  }

  if (!passedCache) {
    writeCache(cacheData);
    writeDescCache(descData);
  }

  const web3Total = addedCount + updatedCount;
  console.log(`\n========================================`);
  console.log(`Paradigm Ingestion Complete:`);
  console.log(`- Total rows on page: ${rows.length}`);
  console.log(`- Filtered out (non-web3 / invalid): ${filteredCount}`);
  console.log(`- Web3 roles processed: ${web3Total}`);
  console.log(`- Added: ${addedCount}`);
  console.log(`- Updated: ${updatedCount}`);
  console.log(`- Total Jobs in Cache: ${cacheData.length}`);
  console.log(`========================================\n`);

  return { added: addedCount, updated: updatedCount, total: web3Total };
}

if (require.main === module) {
  ingestParadigm().catch(console.error);
}
