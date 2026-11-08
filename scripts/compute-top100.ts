import fs from 'node:fs';
import path from 'node:path';
import type { Top100Employer, Top100IndexData } from '../src/types/top100';

const ROOT = process.cwd();
const COMPANIES_RUNTIME_PATH = path.join(ROOT, 'content/companies-runtime.json');
const JOBS_RUNTIME_PATH = path.join(ROOT, 'content/jobs-runtime.json');
const COMPANIES_MD_DIR = path.join(ROOT, 'content/companies');
const OUTPUT_PATH = path.join(ROOT, 'content/top100-employers.json');

interface CompanyRuntime {
  slug: string;
  name: string;
  website?: string;
  description?: string;
  jobCount?: number;
}

interface JobRuntime {
  id: string;
  title: string;
  company: string;
  location?: string;
  isRemote?: boolean;
  salary?: string;
  department?: string;
  slug?: string;
}

interface MarkdownMeta {
  name?: string;
  website?: string;
  founded?: number;
  category?: string;
  headquarters?: string;
  description?: string;
}

function parseMarkdownFrontmatter(filePath: string): MarkdownMeta {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};
    const lines = match[1].split('\n');
    const result: Record<string, string> = {};
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx > -1) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        result[key] = val;
      }
    }
    return {
      name: result.name,
      website: result.website,
      founded: result.founded ? parseInt(result.founded, 10) : undefined,
      category: result.category,
      headquarters: result.headquarters,
      description: result.description,
    };
  } catch {
    return {};
  }
}

// Clean sector mapping for clean UI categorization
function normalizeSector(rawCategory = '', name = '', description = '', slug = ''): string {
  const s = slug.toLowerCase();
  const c = rawCategory.toLowerCase();
  const t = `${rawCategory} ${name} ${description}`.toLowerCase();

  // 1. Explicit high-priority overrides by slug
  if (['certik', 'openzeppelin', 'trm-labs', 'chainalysis', 'elliptic', 'complyadvantage', 'notabene'].includes(s)) return 'Security & Auditing';
  if (['polymarket', 'kalshi'].includes(s)) return 'Prediction Markets';
  if (['jane-street', 'drw', 'flow-traders', 'dv-trading', 'falconx', 'keyrock', 'b2c2'].includes(s)) return 'Trading & Quant';
  if (['prime-intellect', '0g-labs', 'ritual', 'grass', 'gomining'].includes(s)) return 'AI & DePIN';
  if (['a16z-crypto', 'galaxy-digital', 'brevan-howard', 'pantera-capital'].includes(s)) return 'Venture & Research';
  if (['stripe', 'ramp', 'ripple', 'circle', 'tether', 'bvnk', 'moonpay', 'sardine', 'straitsx', 'breeze-cash'].includes(s)) return 'Fintech & Payments';
  if (['coinbase', 'kraken', 'okx', 'bybit', 'robinhood', 'bitgo', 'crypto-com', 'bitdeer', 'bitpanda', 'gemini', 'bitvavo', 'bullish', 'coinhako', 'coins-ph', 'localcoin', 'shakepay', 'xapo-bank', 'phantom'].includes(s)) return 'Exchanges & Custody';
  if (['uniswap', 'uniswap-labs', 'aave', 'aave-labs', 'morpho', 'ether-fi', 'ondo-finance', '1inch', 'kamino', '0x', 'solflare', 'orderly-network'].includes(s)) return 'DeFi Protocols';
  if (['alchemy', 'consensys', 'fireblocks', 'helius', 'turnkey', 'dune', 'allium', 'blockdaemon', 'quicknode', 'paxos'].includes(s)) return 'Infrastructure & Tooling';
  if (['polygon-labs', 'arbitrum', 'arbitrum-opco', 'optimism', 'optimism-foundation', 'mysten-labs', 'sei-labs', 'stellar', 'hedera', 'monad'].includes(s)) return 'L1 / L2 Protocols';

  // 2. Category matching
  if (/security|audit|compliance|investigation|intelligence/i.test(c)) return 'Security & Auditing';
  if (/prediction/i.test(c)) return 'Prediction Markets';
  if (/quant|market making|proprietary trading|trading/i.test(c)) return 'Trading & Quant';
  if (/exchange|custody|brokerage|wallet/i.test(c)) return 'Exchanges & Custody';
  if (/payment|fintech|stablecoin|banking/i.test(c)) return 'Fintech & Payments';
  if (/defi|dex|lending|staking|liquid/i.test(c)) return 'DeFi Protocols';
  if (/ai|compute|depin/i.test(c)) return 'AI & DePIN';
  if (/tooling|infrastructure|rpc|data|analytics/i.test(c)) return 'Infrastructure & Tooling';
  if (/layer 1|layer 2|l1|l2|protocol|rollup/i.test(c)) return 'L1 / L2 Protocols';

  // 3. Fallback on description
  if (/security|audit/i.test(t)) return 'Security & Auditing';
  if (/trading|market maker/i.test(t)) return 'Trading & Quant';
  if (/exchange|custody/i.test(t)) return 'Exchanges & Custody';
  if (/fintech|payment/i.test(t)) return 'Fintech & Payments';
  if (/defi|lending/i.test(t)) return 'DeFi Protocols';
  if (/l1|l2|layer 1|layer 2|rollup/i.test(t)) return 'L1 / L2 Protocols';
  return 'Web3 Infrastructure';
}

function main() {
  const companiesRuntime: Record<string, CompanyRuntime> = JSON.parse(
    fs.readFileSync(COMPANIES_RUNTIME_PATH, 'utf8')
  );
  const jobsRuntime: JobRuntime[] = JSON.parse(
    fs.readFileSync(JOBS_RUNTIME_PATH, 'utf8')
  );

  // Group active jobs by company slug
  const jobsBySlug = new Map<string, JobRuntime[]>();
  for (const j of jobsRuntime) {
    const cName = (j.company || '').trim();
    let matchedSlug: string | null = null;
    for (const [slug, c] of Object.entries(companiesRuntime)) {
      if ((c.name || '').toLowerCase() === cName.toLowerCase()) {
        matchedSlug = slug;
        break;
      }
    }
    if (!matchedSlug) {
      matchedSlug = cName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (!jobsBySlug.has(matchedSlug)) jobsBySlug.set(matchedSlug, []);
    jobsBySlug.get(matchedSlug)!.push(j);
  }

  // Load markdown metadata
  const mdMetaBySlug = new Map<string, MarkdownMeta>();
  if (fs.existsSync(COMPANIES_MD_DIR)) {
    for (const file of fs.readdirSync(COMPANIES_MD_DIR)) {
      if (file.endsWith('.md')) {
        const slug = file.replace(/\.md$/, '');
        mdMetaBySlug.set(slug, parseMarkdownFrontmatter(path.join(COMPANIES_MD_DIR, file)));
      }
    }
  }

  // Non-native / general tech & TradFi firms excluded from the pure Web3 ranking
  const EXCLUDED_NON_NATIVE_SLUGS = new Set([
    'stripe',       // Traditional payments processor
    'ramp',         // Traditional corporate card & spend management (ramp.com)
    'robinhood',    // Traditional retail stock brokerage
    'block',        // Traditional payments (Square / Cash App)
    'alpaca',       // Traditional API stock brokerage
    'drivewealth',  // Traditional embedded equity brokerage
    'kalshi',       // CFTC regulated TradFi prediction market
  ]);

  // Filter candidate pool to active Web3 employers with at least 1 verified active job
  const activeEntries: Array<{ slug: string; jobs: JobRuntime[] }> = [];
  for (const [slug, cJobs] of jobsBySlug.entries()) {
    if (EXCLUDED_NON_NATIVE_SLUGS.has(slug.toLowerCase())) {
      continue;
    }
    if (cJobs.length === 0) {
      continue;
    }
    activeEntries.push({ slug, jobs: cJobs });
  }

  const maxJobs = Math.max(...activeEntries.map(e => e.jobs.length), 1);

  const candidates: Top100Employer[] = [];

  for (const { slug, jobs: cJobs } of activeEntries) {
    const cRuntime = companiesRuntime[slug] || {};
    const mdMeta = mdMetaBySlug.get(slug) || {};
    const name = cRuntime.name || mdMeta.name || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const website = cRuntime.website || mdMeta.website || `https://${slug}.com`;
    const headquarters = mdMeta.headquarters || 'Remote / Global';
    const founded = mdMeta.founded;
    const category = normalizeSector(mdMeta.category, name, cRuntime.description || mdMeta.description || '', slug);

    const jobCount = cJobs.length;

    // Real department breadth
    const departments = new Set(
      cJobs.map(j => String(j.department || 'General').trim()).filter(Boolean)
    );
    const departmentCount = departments.size;

    // Real remote work percentage
    const remoteCount = cJobs.filter(j => j.isRemote === true || /\bremote\b/i.test(j.location || '')).length;
    const remotePercentage = Math.round((remoteCount / jobCount) * 100);

    // Real salary disclosure percentage
    const salaryCount = cJobs.filter(j => Boolean(j.salary)).length;
    const salaryTransparencyPct = Math.round((salaryCount / jobCount) * 100);

    // Extract salary benchmark from jobs if available
    let salaryBenchmark: string | undefined;
    const firstWithSalary = cJobs.find(j => j.salary);
    if (firstWithSalary?.salary) {
      salaryBenchmark = firstWithSalary.salary;
    }

    // 100% Verifiable Hiring Index Score (0 - 100)
    // 1. Hiring Volume (0 - 60): Logarithmic scale of verified open roles
    const sVolume = Number(((Math.log(1 + jobCount) / Math.log(1 + maxJobs)) * 60).toFixed(1));

    // 2. Department Diversity (0 - 20): Hiring across distinct disciplines (1 to 10+ depts)
    const sBreadth = Number(Math.min(20, (departmentCount / 10) * 20).toFixed(1));

    // 3. Remote Availability (0 - 10): % of roles offering remote work
    const sRemote = Number(((remotePercentage / 100) * 10).toFixed(1));

    // 4. Salary Transparency (0 - 10): % of roles with published pay ranges
    const sSalary = Number(((salaryTransparencyPct / 100) * 10).toFixed(1));

    const composite = Number((sVolume + sBreadth + sRemote + sSalary).toFixed(1));

    // Objective highlight badges based on verified facts
    const highlightBadges: string[] = [];
    if (remotePercentage >= 95) {
      highlightBadges.push('100% Remote');
    } else if (remotePercentage >= 80) {
      highlightBadges.push(`${remotePercentage}% Remote`);
    }
    if (salaryTransparencyPct >= 50) {
      highlightBadges.push('Salary Transparency');
    }
    if (departmentCount >= 5) {
      highlightBadges.push('Multi-Department');
    }

    const summary = cRuntime.description || mdMeta.description || `${name} is an active Web3 organization hiring across engineering, product, and operations.`;

    candidates.push({
      rank: 0,
      slug,
      name,
      category,
      website,
      headquarters,
      founded,
      activeJobs: jobCount,
      departmentCount,
      remotePercentage,
      salaryTransparencyPct,
      salaryBenchmark,
      scores: {
        hiringVolume: sVolume,
        departmentBreadth: sBreadth,
        remoteFlexibility: sRemote,
        salaryTransparency: sSalary,
        composite,
      },
      highlightBadges,
      summary: summary.slice(0, 320) + (summary.length > 320 ? '...' : ''),
    });
  }

  // Sort primarily by active job count, then by verified hiring index score, then department breadth
  candidates.sort((a, b) => {
    if (b.activeJobs !== a.activeJobs) {
      return b.activeJobs - a.activeJobs;
    }
    if (b.scores.composite !== a.scores.composite) {
      return b.scores.composite - a.scores.composite;
    }
    return b.departmentCount - a.departmentCount;
  });

  // Take Top 100
  const top100 = candidates.slice(0, 100).map((emp, index) => ({
    ...emp,
    rank: index + 1,
  }));

  // Calculate macro statistics
  const totalActiveJobs = top100.reduce((acc, emp) => acc + emp.activeJobs, 0);
  const avgRemotePct = Math.round(top100.reduce((acc, emp) => acc + emp.remotePercentage, 0) / top100.length);
  const avgSalaryTransparencyPct = Math.round(top100.reduce((acc, emp) => acc + emp.salaryTransparencyPct, 0) / top100.length);

  const sectorCounts = new Map<string, number>();
  for (const emp of top100) {
    sectorCounts.set(emp.category, (sectorCounts.get(emp.category) || 0) + 1);
  }
  const sectors = Array.from(sectorCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const payload: Top100IndexData = {
    generatedAt: new Date().toISOString(),
    year: 2026,
    snapshotLabel: 'Q4 2026 Index',
    totalEmployers: top100.length,
    totalActiveJobs,
    avgRemotePct,
    avgSalaryTransparencyPct,
    employers: top100,
    sectors,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`[top100] Successfully generated ${OUTPUT_PATH}`);
  console.log(`[top100] Total active jobs represented: ${totalActiveJobs}`);
  console.log(`[top100] Avg remote rate: ${avgRemotePct}%`);
  console.log(`[top100] Top 5 employers:`);
  top100.slice(0, 5).forEach(e => console.log(`  #${e.rank} ${e.name} (${e.activeJobs} jobs, ${e.scores.composite} pts)`));
  console.log(`[top100] #100 employer: #${top100[99].rank} ${top100[99].name} (${top100[99].activeJobs} jobs, ${top100[99].scores.composite} pts)`);
}

main();
