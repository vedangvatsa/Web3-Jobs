/**
 * Offline hiring-report metrics (jobs cache + description shards).
 * Writes content/hiring-report-stats.json — run in CI after jobs cache refresh, not at request time.
 *
 * Run: npm run hiring-report:stats
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { getJobs } from '../src/lib/jobs';
import { getCachedRawContent } from '../src/lib/job-guides';
import * as cheerio from 'cheerio';
import type { Job } from '../src/types';

const OUT_PATH = path.join(process.cwd(), 'content/hiring-report-stats.json');
const writeMode = process.argv.includes('--write');

function plainText(job: Job): string {
  const html = getCachedRawContent(job);
  return cheerio.load(html).text().replace(/\s+/g, ' ').trim();
}

function blob(job: Job): string {
  return `${job.title} ${String(job.department ?? '')} ${job.location || ''} ${plainText(job)}`.toLowerCase();
}

function pct(v: number, n: number): number {
  if (!n) return 0;
  return Math.round((1000 * v) / n) / 10;
}

function classifyDept(j: Job): string {
  const d = String(j.department ?? '').toLowerCase();
  const t = j.title.toLowerCase();
  const rules: [string, string[]][] = [
    ['Engineering', ['engineer', 'engineering', 'software', 'developer', 'devops', 'sre', 'protocol', 'backend', 'frontend', 'solidity']],
    ['Product & Design', ['product', 'design', 'ux']],
    ['Marketing', ['marketing', 'growth', 'brand', 'communications', 'content', 'community']],
    ['Sales & BD', ['sales', 'business development', 'partnership', 'account executive']],
    ['Compliance & Legal', ['compliance', 'legal', 'counsel', 'aml', 'kyc', 'regulatory']],
    ['Finance', ['finance', 'accountant', 'controller', 'treasury', 'fp&a']],
    ['Human Resources', ['people', 'talent', 'recruit', 'human resources']],
    ['Trading', ['trading', 'trader', 'quant']],
    ['Operations', ['operations', 'ops', 'support', 'customer success']],
  ];
  for (const [name, keys] of rules) {
    if (keys.some((k) => d.includes(k))) return name;
  }
  for (const [name, keys] of rules) {
    if (keys.some((k) => t.includes(k))) return name;
  }
  return 'Other';
}

function classifySeniority(title: string): 'entry' | 'executive' | 'senior' | 'mid' {
  const t = title.toLowerCase();
  if (/\b(intern|internship|graduate|entry[- ]level|junior|jr\.)\b/.test(t)) return 'entry';
  if (/\b(director|vp |vice president|chief |ceo|cto|cfo|cpo|head of|svp|evp|president|coo|cmo)\b/.test(t)) return 'executive';
  if (/\b(senior|sr\.|staff |lead |principal)\b/.test(t)) return 'senior';
  return 'mid';
}

function classifyLocationRegion(loc: string): string {
  const l = (loc || '').toLowerCase().trim();
  if (!l) return 'Other';
  if (/\bremote\b/.test(l)) return 'Remote';
  if (
    /\b(united states|u\.s\.|usa\b|san francisco|new york|california|texas|seattle|austin|boston|chicago|denver|miami|los angeles|brooklyn|manhattan|washington dc|district of columbia|portland|atlanta|philadelphia|san diego|san jose|palo alto|mountain view|sunnyvale|cupertino|remote.*us|us remote)\b/.test(
      l
    )
  ) {
    return 'USA';
  }
  if (
    /\b(london|united kingdom|\buk\b|germany|berlin|france|paris|amsterdam|netherlands|dublin|ireland|spain|portugal|zurich|sweden|europe|poland|warsaw|lisbon|madrid|barcelona|munich|frankfurt|vienna|italy|milan|rome|belgium|brussels|norway|oslo|denmark|copenhagen|finland|helsinki|estonia|tallinn|prague|czech)\b/.test(
      l
    )
  ) {
    return 'Europe';
  }
  if (/\bsingapore\b/.test(l)) return 'Singapore';
  if (/\b(hong kong|\bhk\b)\b/.test(l)) return 'Hong Kong';
  if (/\b(dubai|uae|abu dhabi|middle east|bahrain|saudi|qatar|riyadh)\b/.test(l)) return 'Middle East';
  if (/\b(brazil|mexico|argentina|latam|latin america|colombia|chile|peru|buenos aires|são paulo|sao paulo)\b/.test(l)) return 'LATAM';
  if (/\b(nigeria|kenya|south africa|africa|lagos|nairobi|johannesburg)\b/.test(l)) return 'Africa';
  return 'Other';
}

function classifyEmployerType(company: string): 'exchange' | 'infrastructure' | 'payments' | 'trading' | 'defi' | 'other' {
  const c = company.toLowerCase();
  const exchanges = ['binance', 'okx', 'bybit', 'coinbase', 'kraken', 'kucoin', 'gate.io', 'bitfinex', 'crypto.com', 'htx', 'mexc'];
  const payments = ['stripe', 'ramp', 'moonpay', 'circle', 'paypal', 'visa', 'mastercard', 'block', 'square', 'robinhood', 'revolut'];
  const trading = ['jane street', 'jump', 'wintermute', 'flow traders', 'cumberland', 'drw', 'virtu', 'citadel', 'two sigma'];
  const infra = ['fireblocks', 'bitgo', 'alchemy', 'infura', 'chainalysis', 'consensys', 'ripple', 'tangem', 'ledger', 'phantom', 'uniswap labs', 'polygon', 'solana', 'avalanche'];
  const defi = ['uniswap', 'aave', 'compound', 'makerdao', 'curve', 'lido', 'eigenlayer'];
  if (exchanges.some((x) => c.includes(x))) return 'exchange';
  if (defi.some((x) => c.includes(x))) return 'defi';
  if (payments.some((x) => c.includes(x))) return 'payments';
  if (trading.some((x) => c.includes(x))) return 'trading';
  if (infra.some((x) => c.includes(x))) return 'infrastructure';
  return 'other';
}

function parseSalaryMid(s: string): number | null {
  const text = s.replace(/,/g, '');
  const kRe = /(?:USD|US\$|\$)\s*(\d{2,3})\s*[kK](?:\s*[-–to]+\s*(?:USD|US\$|\$)?\s*(\d{2,3})\s*[kK])?/g;
  const numRe = /(?:USD|US\$|\$)\s*(\d{4,6})(?:\s*[-–to]+\s*(?:USD|US\$|\$)?\s*(\d{4,6})?)?/g;
  const mids: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = kRe.exec(text)) !== null) {
    const a = Number(m[1]) * 1000;
    const b = m[2] ? Number(m[2]) * 1000 : a;
    if (a >= 30000 && a <= 900000) mids.push((a + b) / 2);
  }
  while ((m = numRe.exec(text)) !== null) {
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    if (a >= 30000 && a <= 900000) mids.push((a + b) / 2);
  }
  if (!mids.length) return null;
  mids.sort((x, y) => x - y);
  return mids[Math.floor(mids.length / 2)];
}

function dateKey(iso: string): string | null {
  if (!iso) return null;
  const d = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

async function main() {
  const jobs = await getJobs();
  const n = jobs.length;
  const companyCount = new Set(jobs.map((j) => j.company)).size;

  let withDesc = 0;
  for (const j of jobs) {
    if (plainText(j).length >= 100) withDesc++;
  }

  const patterns: Record<string, RegExp> = {
    dataAnalysis: /\bdata (analyst|analysis|analytics|scientist)\b|\bdata-driven\b/,
    python: /\bpython\b/,
    sql: /\bsql\b/,
    projectMgmt: /\bproject manag/,
    java: /\bjava\b/,
    blockchain: /\bblockchain\b/,
    ai: /\b(ai|machine learning|\bml\b|llm|large language model|generative ai|artificial intelligence)\b/,
    typescript: /\btypescript\b/,
    javascript: /\bjavascript\b/,
    react: /\breact\b/,
    aws: /\baws\b|\bamazon web services\b/,
    go: /\bgolang\b|\bgo programming language\b|\bexperience in go\b|\bproficiency in go\b/,
    communication: /\bcommunication\b/,
    compliance: /\bcompliance\b|\bregulatory compliance\b/,
    stakeholder: /\bstakeholder manag/,
    risk: /\brisk manag/,
    aml: /\baml\b|anti-money laundering/,
    negotiation: /\bnegotiation\b/,
    analytical: /\banalytical skills\b|\bstrong analytical\b/,
    productMgmt: /\bproduct manag/,
    rust: /\brust\b/,
    solidity: /\bsolidity\b/,
    smartContract: /\bsmart contract/,
    tokenComp: /\btoken(?:omics)?\b|\bcrypto token|\bgovernance token|\btoken grant|\btoken allocation|\bpaid in tokens\b/,
    equity: /\bequity\b|\bstock option|\biso\b|\bincentive stock|\brsus?\b/,
    remote: /\bremote\b|\bwork from home\b|\bfully remote\b|\bwork remotely\b/,
    hybrid: /\bhybrid\b/,
    fullTime: /\bfull.?time\b/,
    contract: /\bcontract\b|\bfreelance\b/,
  };

  const counts: Record<string, number> = {};
  for (const k of Object.keys(patterns)) counts[k] = 0;
  for (const j of jobs) {
    const s = blob(j);
    for (const [k, pat] of Object.entries(patterns)) {
      if (pat.test(s)) counts[k]++;
    }
  }

  const compContext = jobs.filter((j) =>
    /\bcompensation\b|\bbenefits\b|\bpackage\b|\bequity\b|\btoken\b|\bstock\b|\bsalary\b|\bremuneration\b/i.test(blob(j))
  );
  let equityMention = 0;
  let tokenMention = 0;
  for (const j of compContext) {
    const s = blob(j);
    if (patterns.equity.test(s)) equityMention++;
    if (patterns.tokenComp.test(s)) tokenMention++;
  }
  const compN = compContext.length;
  const payMixTotal = equityMention + tokenMention;
  const equityShareOfPayMix = payMixTotal ? pct(equityMention, payMixTotal) : 0;
  const tokenShareOfPayMix = payMixTotal ? pct(tokenMention, payMixTotal) : 0;

  const salaries: number[] = [];
  let salaryFieldRows = 0;
  for (const j of jobs) {
    if (j.salary && j.salary.trim()) salaryFieldRows++;
    const mid = parseSalaryMid(`${j.salary || ''} ${plainText(j)}`);
    if (mid) salaries.push(mid);
  }
  salaries.sort((a, b) => a - b);
  const medianSalary = salaries.length ? salaries[Math.floor(salaries.length / 2)] : 0;
  const minSalary = salaries.length ? salaries[0] : 0;
  const maxSalary = salaries.length ? salaries[salaries.length - 1] : 0;

  const salaryBandCounts = {
    under100: salaries.filter((v) => v < 100_000).length,
    b100_150: salaries.filter((v) => v >= 100_000 && v < 150_000).length,
    b150_200: salaries.filter((v) => v >= 150_000 && v < 200_000).length,
    over200: salaries.filter((v) => v >= 200_000).length,
  };
  const salaryN = salaries.length;

  const deptCounts = new Map<string, number>();
  for (const j of jobs) {
    const name = classifyDept(j);
    deptCounts.set(name, (deptCounts.get(name) || 0) + 1);
  }
  const deptChartOrder = [
    'Engineering',
    'Sales & BD',
    'Product & Design',
    'Marketing',
    'Operations',
    'Compliance & Legal',
    'Finance',
  ] as const;
  const departments = deptChartOrder.map((label) => ({
    label,
    count: deptCounts.get(label) || 0,
    pct: pct(deptCounts.get(label) || 0, n),
  }));
  const otherDeptCount = deptCounts.get('Other') || 0;
  const otherDeptPct = pct(otherDeptCount, n);

  const seniorityCounts = { mid: 0, senior: 0, executive: 0, entry: 0 };
  let internTitles = 0;
  for (const j of jobs) {
    const tier = classifySeniority(j.title);
    seniorityCounts[tier]++;
    if (/\bintern\b/i.test(j.title)) internTitles++;
  }

  const locationCounts = new Map<string, number>();
  for (const j of jobs) {
    const region = classifyLocationRegion(j.location || '');
    locationCounts.set(region, (locationCounts.get(region) || 0) + 1);
  }

  const employerTypeCounts = { exchange: 0, infrastructure: 0, payments: 0, trading: 0, defi: 0, other: 0 };
  for (const j of jobs) {
    const t = classifyEmployerType(j.company);
    employerTypeCounts[t]++;
  }
  const taggedEmployer = n - employerTypeCounts.other;

  const companies = new Map<string, number>();
  for (const j of jobs) {
    companies.set(j.company, (companies.get(j.company) || 0) + 1);
  }
  const topCompanies = [...companies.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  const top10Share = pct(topCompanies.reduce((a, c) => a + c.count, 0), n);

  const velocityDays = ['2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11'];
  const velocityByDate: Record<string, number> = Object.fromEntries(velocityDays.map((d) => [d, 0]));
  for (const j of jobs) {
    const dk = dateKey(j.date);
    if (dk && dk in velocityByDate) velocityByDate[dk]++;
  }
  const weekdayVel = velocityDays.filter((d) => !['2026-09-05', '2026-09-06'].includes(d));
  const avgWeekdayVelocity =
    weekdayVel.length > 0
      ? Math.round(weekdayVel.reduce((a, d) => a + velocityByDate[d], 0) / weekdayVel.length)
      : 0;

  const locRemote = jobs.filter((j) => (j.location || '').toLowerCase().includes('remote')).length;

  const payload = {
    generatedAt: new Date().toISOString(),
    snapshotLabel: 'September 2026',
    listings: n,
    companies: companyCount,
    withDesc,
    withDescPct: pct(withDesc, n),
    top10SharePct: top10Share,
    topCompanies,
    departments,
    otherDeptPct,
    engineeringCount: deptCounts.get('Engineering') || 0,
    seniority: {
      mid: { count: seniorityCounts.mid, pct: pct(seniorityCounts.mid, n) },
      senior: { count: seniorityCounts.senior, pct: pct(seniorityCounts.senior, n) },
      executive: { count: seniorityCounts.executive, pct: pct(seniorityCounts.executive, n) },
      entry: { count: seniorityCounts.entry, pct: pct(seniorityCounts.entry, n) },
      internTitlePct: pct(internTitles, n),
    },
    location: {
      usa: { count: locationCounts.get('USA') || 0, pct: pct(locationCounts.get('USA') || 0, n) },
      europe: { count: locationCounts.get('Europe') || 0, pct: pct(locationCounts.get('Europe') || 0, n) },
      singapore: { count: locationCounts.get('Singapore') || 0, pct: pct(locationCounts.get('Singapore') || 0, n) },
      hongKong: { count: locationCounts.get('Hong Kong') || 0, pct: pct(locationCounts.get('Hong Kong') || 0, n) },
      remoteField: { count: locRemote, pct: pct(locRemote, n) },
      middleEast: { count: locationCounts.get('Middle East') || 0, pct: pct(locationCounts.get('Middle East') || 0, n) },
      latam: { count: locationCounts.get('LATAM') || 0, pct: pct(locationCounts.get('LATAM') || 0, n) },
      africa: { count: locationCounts.get('Africa') || 0, pct: pct(locationCounts.get('Africa') || 0, n) },
      other: { count: locationCounts.get('Other') || 0, pct: pct(locationCounts.get('Other') || 0, n) },
      remoteBucket: { count: locationCounts.get('Remote') || 0, pct: pct(locationCounts.get('Remote') || 0, n) },
    },
    jdRemote: { count: counts.remote, pct: pct(counts.remote, n) },
    jdHybrid: { count: counts.hybrid, pct: pct(counts.hybrid, n) },
    jdContract: { count: counts.contract, pct: pct(counts.contract, n) },
    jdFullTime: { count: counts.fullTime, pct: pct(counts.fullTime, n) },
    keywords: Object.fromEntries(
      Object.entries(counts).map(([k, v]) => [k, { count: v, pct: pct(v, n) }])
    ),
    compensation: {
      compContextN: compN,
      equityMention,
      tokenMention,
      equityPctOfCompContext: pct(equityMention, compN),
      tokenPctOfCompContext: pct(tokenMention, compN),
      equityShareOfPayMix,
      tokenShareOfPayMix,
    },
    salary: {
      n: salaryN,
      pctOfListings: pct(salaryN, n),
      median: medianSalary,
      min: minSalary,
      max: maxSalary,
      salaryFieldRows,
      bands: {
        under100: { count: salaryBandCounts.under100, pct: pct(salaryBandCounts.under100, salaryN) },
        b100_150: { count: salaryBandCounts.b100_150, pct: pct(salaryBandCounts.b100_150, salaryN) },
        b150_200: { count: salaryBandCounts.b150_200, pct: pct(salaryBandCounts.b150_200, salaryN) },
        over200: { count: salaryBandCounts.over200, pct: pct(salaryBandCounts.over200, salaryN) },
      },
    },
    employerTypes: {
      exchange: { count: employerTypeCounts.exchange, pct: pct(employerTypeCounts.exchange, n) },
      infrastructure: { count: employerTypeCounts.infrastructure, pct: pct(employerTypeCounts.infrastructure, n) },
      payments: { count: employerTypeCounts.payments, pct: pct(employerTypeCounts.payments, n) },
      trading: { count: employerTypeCounts.trading, pct: pct(employerTypeCounts.trading, n) },
      defi: { count: employerTypeCounts.defi, pct: pct(employerTypeCounts.defi, n) },
      other: { count: employerTypeCounts.other, pct: pct(employerTypeCounts.other, n) },
      taggedSharePct: pct(taggedEmployer, n),
    },
    velocity: {
      byDate: velocityByDate,
      avgWeekday: avgWeekdayVelocity,
    },
  };

  const json = JSON.stringify(payload, null, 2) + '\n';

  if (writeMode) {
    writeFileSync(OUT_PATH, json, 'utf8');
    console.error(`Wrote ${OUT_PATH}`);
  } else {
    console.log(json);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
