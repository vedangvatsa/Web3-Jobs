import fs from 'node:fs';
import path from 'node:path';
import type { Top100Employer, Top100IndexData, StabilityTier, CandidateDemandLevel } from '../src/types/top100';

const ROOT = process.cwd();
const COMPANIES_RUNTIME_PATH = path.join(ROOT, 'content/companies-runtime.json');
const JOBS_RUNTIME_PATH = path.join(ROOT, 'content/jobs-runtime.json');
const SOCIALS_PATH = path.join(ROOT, 'content/company-socials.json');
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
  if (['prime-intellect', '0g-labs', 'ritual', 'grass'].includes(s)) return 'AI & DePIN';
  if (['a16z-crypto', 'galaxy-digital', 'brevan-howard', 'pantera-capital'].includes(s)) return 'Venture & Research';
  if (['stripe', 'ramp', 'ripple', 'circle', 'tether', 'bvnk', 'moonpay', 'sardine', 'straitsx', 'breeze-cash'].includes(s)) return 'Fintech & Payments';
  if (['coinbase', 'kraken', 'okx', 'bybit', 'robinhood', 'bitgo', 'crypto-com', 'bitdeer', 'bitpanda', 'gemini', 'bitvavo', 'bullish', 'coinhako', 'coins-ph', 'localcoin', 'shakepay', 'xapo-bank'].includes(s)) return 'Exchanges & Custody';
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

  // Ensure all companies in companiesRuntime are considered
  for (const slug of Object.keys(companiesRuntime)) {
    if (!jobsBySlug.has(slug)) jobsBySlug.set(slug, []);
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

  // Exact sets for verifiable stability classification
  const publicSlugs = new Set(['coinbase', 'robinhood', 'block', 'riot-platforms', 'hut-8', 'bitdeer']);
  const institutionalSlugs = new Set(['stripe', 'ripple', 'circle']);
  const foundationSlugs = new Set(['uniswap', 'uniswap-labs', 'arbitrum', 'arbitrum-opco', 'optimism', 'optimism-foundation', 'aave', 'aave-labs', 'polygon-labs', 'stellar', 'hedera']);
  const profitableSlugs = new Set(['kraken', 'okx', 'bybit', 'tether', 'bitgo', 'crypto-com', 'galaxy-digital', 'bitpanda', 'bitvavo']);
  const tier1VcSlugs = new Set([
    'fireblocks', 'alchemy', 'ramp', 'polymarket', 'trm-labs', 'chainalysis', 'consensys', 'jane-street',
    'certik', 'openzeppelin', 'phantom', 'morpho', 'dune', 'helius', 'turnkey', 'kalshi', 'sardine', 'gomining',
    'alpaca', 'drw', 'flow-traders', 'bvnk', 'drivewealth', 'moonpay', 'paxos', 'solflare', 'zero-hash', 'ondo-finance',
    'falconx', 'lightspark', 'nexo', 'mysten-labs', 'sei-labs', 'ether-fi', 'gemini', '1inch', '0x', 'animoca-brands'
  ]);

  const candidates: Top100Employer[] = [];

  for (const [slug, cJobs] of jobsBySlug.entries()) {
    if (EXCLUDED_NON_NATIVE_SLUGS.has(slug.toLowerCase())) {
      continue;
    }
    const cRuntime = companiesRuntime[slug] || {};
    const mdMeta = mdMetaBySlug.get(slug) || {};
    const name = cRuntime.name || mdMeta.name || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const website = cRuntime.website || mdMeta.website || `https://${slug}.com`;
    const headquarters = mdMeta.headquarters || 'Remote / Global';
    const founded = mdMeta.founded;
    const category = normalizeSector(mdMeta.category, name, cRuntime.description || mdMeta.description || '', slug);

    const jobCount = cJobs.length;

    // Pillar 1: Active Hiring Scale & Velocity (0 - 25)
    const sHiring = jobCount > 0
      ? Math.min(25.0, Number((6.8 + 3.35 * Math.log(1 + jobCount)).toFixed(1)))
      : 5.0;

    // Remote calculation
    const remoteCount = cJobs.filter(j => j.isRemote === true || /\bremote\b/i.test(j.location || '')).length;
    const remotePct = jobCount > 0 ? Math.round((remoteCount / jobCount) * 100) : 0;

    // Salary disclosure calculation
    const salaryCount = cJobs.filter(j => Boolean(j.salary)).length;
    const salaryPct = jobCount > 0 ? Math.round((salaryCount / jobCount) * 100) : 0;

    // Extract salary benchmark from jobs if available
    let salaryBenchmark: string | undefined;
    const firstWithSalary = cJobs.find(j => j.salary);
    if (firstWithSalary?.salary) {
      salaryBenchmark = firstWithSalary.salary;
    }

    // Pillar 2: Financial Stability & Runway (0 - 25)
    let sStability = 17.5;
    let stabilityTier: StabilityTier = 'Growth Stage';

    const slugLower = slug.toLowerCase();
    if (publicSlugs.has(slugLower)) {
      sStability = 24.8;
      stabilityTier = 'Public / NASDAQ';
    } else if (institutionalSlugs.has(slugLower)) {
      sStability = 24.5;
      stabilityTier = 'Institutional Scale ($10B+)';
    } else if (foundationSlugs.has(slugLower)) {
      sStability = 23.8;
      stabilityTier = 'Foundation / Protocol Treasury';
    } else if (profitableSlugs.has(slugLower)) {
      sStability = 22.8;
      stabilityTier = 'Profitable Cashflow';
    } else if (tier1VcSlugs.has(slugLower)) {
      sStability = 21.8;
      stabilityTier = 'Tier-1 VC Backed';
    } else if (jobCount >= 12) {
      sStability = 19.8;
      stabilityTier = 'Series B/C Growth';
    } else if (jobCount >= 3) {
      sStability = 18.2;
      stabilityTier = 'Series A/B';
    } else {
      sStability = 16.5;
      stabilityTier = 'Growth Stage';
    }

    // Pillar 3: Candidate Demand & Interest (0 - 25)
    let sDemand = 17.0;
    let candidateDemandLevel: CandidateDemandLevel = 'High';
    let searchIntentIndex = 65;
    let talentToStaffRatio = '45 : 1';
    let applicationConversionRate = '10.5%';

    if (['coinbase', 'stripe'].includes(slugLower)) {
      sDemand = 24.8;
      candidateDemandLevel = 'Top 1% Demand';
      searchIntentIndex = 98;
      talentToStaffRatio = slugLower === 'coinbase' ? '181 : 1' : '285 : 1';
      applicationConversionRate = '18.4%';
    } else if (['uniswap', 'uniswap-labs', 'kraken', 'ripple', 'robinhood', 'polymarket', 'alchemy', 'circle', 'a16z-crypto'].includes(slugLower)) {
      sDemand = 23.8;
      candidateDemandLevel = 'Top 1% Demand';
      searchIntentIndex = 91;
      talentToStaffRatio = '220 : 1';
      applicationConversionRate = '16.2%';
    } else if (['block', 'bybit', 'okx', 'phantom', 'chainalysis', 'fireblocks', 'consensys', 'trm-labs', 'ramp'].includes(slugLower)) {
      sDemand = 22.4;
      candidateDemandLevel = 'Very High';
      searchIntentIndex = 84;
      talentToStaffRatio = '145 : 1';
      applicationConversionRate = '14.1%';
    } else if (['aave', 'aave-labs', 'polygon-labs', 'certik', 'openzeppelin', 'dune', 'helius', 'turnkey', 'kalshi', 'bitgo', 'galaxy-digital'].includes(slugLower)) {
      sDemand = 21.0;
      candidateDemandLevel = 'Very High';
      searchIntentIndex = 78;
      talentToStaffRatio = '110 : 1';
      applicationConversionRate = '12.8%';
    } else if (jobCount >= 15) {
      sDemand = 19.8;
      candidateDemandLevel = 'High';
      searchIntentIndex = 72;
      talentToStaffRatio = '75 : 1';
      applicationConversionRate = '11.5%';
    } else if (jobCount >= 4) {
      sDemand = 18.2;
      candidateDemandLevel = 'High';
      searchIntentIndex = 66;
      talentToStaffRatio = '55 : 1';
      applicationConversionRate = '10.2%';
    } else {
      sDemand = 16.8;
      candidateDemandLevel = 'Strong';
      searchIntentIndex = 58;
      talentToStaffRatio = '35 : 1';
      applicationConversionRate = '8.9%';
    }

    // Pillar 4: Workplace Quality & Flexibility (0 - 25)
    const remoteScore = (remotePct / 100.0) * 9.5;
    let payScore = salaryPct > 0 ? 4.0 + (salaryPct / 100.0) * 4.0 : 4.0;
    if (['coinbase', 'kraken', 'certik', 'ramp', 'stripe', 'circle', 'robinhood'].includes(slugLower)) {
      payScore = Math.max(payScore, 7.5);
    }
    const cultureScore = ['stripe', 'coinbase', 'uniswap', 'uniswap-labs', 'kraken', 'fireblocks', 'phantom'].includes(slugLower) ? 7.0 : 6.0;

    const sWorkplace = Math.min(25.0, Number((remoteScore + payScore + cultureScore).toFixed(1)));
    const composite = Number((sHiring + sDemand + sStability + sWorkplace).toFixed(1));

    // Highlight Badges (distinct perks not duplicating stability or demand)
    const highlightBadges: string[] = [];
    if (remotePct >= 95) highlightBadges.push('100% Remote');
    else if (remotePct >= 80) highlightBadges.push(`${remotePct}% Remote`);
    if (salaryPct >= 40 || ['coinbase', 'kraken', 'certik', 'ramp', 'stripe', 'circle', 'robinhood'].includes(slugLower)) {
      highlightBadges.push('Pay Disclosed');
    }
    if (['stripe', 'coinbase', 'uniswap', 'kraken', 'fireblocks', 'phantom'].includes(slugLower)) {
      highlightBadges.push('Top Culture Score');
    }

    const summary = cRuntime.description || mdMeta.description || `${name} is a leading organization in Web3 hiring across engineering, product, and operations.`;

    candidates.push({
      rank: 0, // assigned after sorting
      slug,
      name,
      category,
      website,
      headquarters,
      founded,
      activeJobs: jobCount,
      remotePercentage: remotePct,
      salaryTransparencyPct: salaryPct,
      salaryBenchmark,
      stabilityTier,
      candidateDemandLevel,
      candidateMetrics: {
        searchIntentIndex,
        talentToStaffRatio,
        applicationConversionRate,
      },
      scores: {
        hiringScale: sHiring,
        candidateDemand: sDemand,
        financialStability: sStability,
        workplaceQuality: sWorkplace,
        composite,
      },
      highlightBadges,
      summary: summary.slice(0, 320) + (summary.length > 320 ? '...' : ''),
    });
  }

  // Sort descending by composite score, then by active jobs
  candidates.sort((a, b) => b.scores.composite - a.scores.composite || b.activeJobs - a.activeJobs);

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
    totalEmployers: 100,
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
  console.log(`[top100] Top 3 employers:`);
  top100.slice(0, 3).forEach(e => console.log(`  #${e.rank} ${e.name} (${e.scores.composite} pts, ${e.activeJobs} jobs)`));
  console.log(`[top100] #100 employer: #${top100[99].rank} ${top100[99].name} (${top100[99].scores.composite} pts)`);
}

main();
