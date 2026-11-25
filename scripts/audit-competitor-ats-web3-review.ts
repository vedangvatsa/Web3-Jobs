#!/usr/bin/env tsx
/**
 * Review shortlisted competitor ATS boards: employer identity + web3 job signal.
 */
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import { getAuditPage } from './lib/ats-audit-http';

const TODAY = new Date().toISOString().slice(0, 10);
const IN_CSV =
  process.argv.find((a) => a.startsWith('--input='))?.slice(8) ||
  `docs/job-aggregator-outreach/competitor-employer-gaps-ats-probed-${TODAY}.csv`;
const OUT_BASENAME = process.argv.find((a) => a.startsWith('--out-basename='))?.slice(15) || 'competitor-ats-web3-review';
const OUT_DIR = 'docs/job-aggregator-outreach';
const OUT_JSON = path.join(OUT_DIR, `${OUT_BASENAME}-${TODAY}.json`);
const OUT_CSV = path.join(OUT_DIR, `${OUT_BASENAME}-${TODAY}.csv`);

type RowIn = {
  competitorName: string;
  competitorSlug: string;
  sources: string;
  atsProvider: 'greenhouse' | 'lever' | 'ashby';
  atsBoard: string;
  atsJobCount: string;
  atsIngestUrl: string;
};

type JobSnippet = { title: string; web3Score: number; terms: string[] };

type ReviewRow = RowIn & {
  atsOrgName: string;
  atsWebsite: string;
  liveJobCount: number;
  web3JobCount: number;
  web3JobPct: number;
  orgLooksWeb3: boolean;
  nameAlignment: 'match' | 'partial' | 'mismatch' | 'unknown';
  verdict:
    | 'ingest_candidate'
    | 'web3_but_verify_identity'
    | 'wrong_board'
    | 'not_web3'
    | 'already_obvious_skip';
  notes: string;
  sampleWeb3Jobs: JobSnippet[];
  sampleOtherJobs: JobSnippet[];
  checkedAt: string;
};

const WEB3_TERMS = [
  'web3',
  'web 3',
  'blockchain',
  'crypto',
  'cryptocurrency',
  'bitcoin',
  'btc',
  'ethereum',
  'eth',
  'solana',
  'defi',
  'de-fi',
  'nft',
  'smart contract',
  'solidity',
  'rust engineer',
  'zero knowledge',
  'zk-',
  ' zk ',
  'layer 2',
  'layer2',
  'l2 ',
  'on-chain',
  'onchain',
  'tokenization',
  'tokenisation',
  'digital asset',
  'stablecoin',
  'wallet',
  'metamask',
  'dapp',
  'dapps',
  'decentralized',
  'decentralised',
  'validator',
  'staking',
  'protocol',
  'rollup',
  'mev',
  'dex',
  'dao',
  'cefi',
  'web3.',
];

const ORG_WEB3_TERMS = [...WEB3_TERMS, 'fintech', 'trading firm', 'market maker', 'venture'];

function parseCsv(file: string): RowIn[] {
  const text = fs.readFileSync(file, 'utf8').trim();
  const lines = text.split('\n').slice(1);
  return lines.map((line) => {
    const cells: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = !inQ;
        continue;
      }
      if (ch === ',' && !inQ) {
        cells.push(cur);
        cur = '';
        continue;
      }
      cur += ch;
    }
    cells.push(cur);
    return {
      competitorName: cells[0] || '',
      competitorSlug: cells[1] || '',
      sources: cells[2] || '',
      atsProvider: cells[4] as RowIn['atsProvider'],
      atsBoard: cells[5] || '',
      atsJobCount: cells[6] || '',
      atsIngestUrl: cells[7] || '',
    };
  });
}

function normName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b(?:inc|llc|ltd|labs|lab|foundation|technologies|technology|network|protocol|group|dao|ventures|capital|the)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function nameAlignment(expected: string, actual: string): ReviewRow['nameAlignment'] {
  const a = normName(expected);
  const b = normName(actual);
  if (!b) return 'unknown';
  if (a === b || a.includes(b) || b.includes(a)) return 'match';
  const aTokens = expected.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  const hit = aTokens.filter((t) => b.includes(t.replace(/[^a-z0-9]/g, ''))).length;
  if (hit >= Math.max(1, Math.ceil(aTokens.length * 0.5))) return 'partial';
  return 'mismatch';
}

function scoreWeb3(text: string): { score: number; terms: string[] } {
  const lower = text.toLowerCase();
  const terms: string[] = [];
  let score = 0;
  for (const term of WEB3_TERMS) {
    if (lower.includes(term)) {
      terms.push(term);
      score += term.length > 6 || term.includes(' ') ? 2 : 1;
    }
  }
  if (/\b(solidity|defi|blockchain|web3|smart contract)\b/i.test(text)) score += 2;
  return { score, terms: [...new Set(terms)] };
}

function isWeb3Job(title: string, body: string): { web3: boolean; score: number; terms: string[] } {
  const titleScore = scoreWeb3(title);
  const bodyScore = scoreWeb3(body);
  const score = titleScore.score * 2 + bodyScore.score;
  const terms = [...new Set([...titleScore.terms, ...bodyScore.terms])];
  const web3 = score >= 3 || (titleScore.score >= 2 && bodyScore.score >= 1);
  return { web3, score, terms };
}

function orgLooksWeb3(name: string, website: string, extra = ''): boolean {
  const blob = `${name} ${website} ${extra}`.toLowerCase();
  return ORG_WEB3_TERMS.some((t) => blob.includes(t));
}

function stripHtml(html: string): string {
  return load(html).text().replace(/\s+/g, ' ').trim();
}

async function fetchGreenhouse(board: string): Promise<{
  orgName: string;
  website: string;
  jobs: Array<{ title: string; body: string }>;
}> {
  const boardUrl = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}`;
  const boardRes = await getAuditPage(boardUrl);
  let orgName = '';
  if (boardRes.status === 200) {
    try {
      orgName = (JSON.parse(boardRes.body) as { name?: string }).name || '';
    } catch {
      /* ignore */
    }
  }
  const jobsRes = await getAuditPage(`${boardUrl}/jobs?content=true`);
  const jobs: Array<{ title: string; body: string }> = [];
  let website = '';
  if (jobsRes.status === 200) {
    const data = JSON.parse(jobsRes.body) as {
      jobs?: Array<{ title: string; content?: string; departments?: Array<{ name: string }> }>;
    };
    for (const job of data.jobs || []) {
      const dept = (job.departments || []).map((d) => d.name).join(' ');
      jobs.push({ title: job.title || '', body: `${dept} ${stripHtml(job.content || '')}`.slice(0, 8000) });
    }
    if (jobsRes.body.includes('http')) {
      const link = jobsRes.body.match(/"company_url"\s*:\s*"([^"]+)"/)?.[1];
      if (link) website = link;
    }
  }
  if (!website && jobs.length) {
    const detailId = JSON.parse(jobsRes.body).jobs?.[0]?.id;
    if (detailId) {
      try {
        const detail = await getAuditPage(`${boardUrl}/jobs/${detailId}`);
        const ex = stripHtml(JSON.parse(detail.body).content || '').slice(0, 2000);
        website = ex.match(/https?:\/\/[^\s)"']+/i)?.[0] || website;
      } catch {
        /* ignore */
      }
    }
  }
  return { orgName, website, jobs };
}

async function fetchLever(board: string): Promise<{
  orgName: string;
  website: string;
  jobs: Array<{ title: string; body: string }>;
}> {
  const res = await getAuditPage(`https://api.lever.co/v0/postings/${encodeURIComponent(board)}?mode=json`);
  const jobs: Array<{ title: string; body: string }> = [];
  let orgName = '';
  let website = '';
  if (res.status === 200) {
    const list = JSON.parse(res.body) as Array<{
      text?: string;
      descriptionPlain?: string;
      categories?: { team?: string; department?: string; commitment?: string; location?: string };
      hostedUrl?: string;
    }>;
    for (const job of list) {
      const cats = job.categories || {};
      jobs.push({
        title: job.text || '',
        body: `${cats.team || ''} ${cats.department || ''} ${job.descriptionPlain || ''}`.slice(0, 8000),
      });
    }
    const page = await getAuditPage(`https://jobs.lever.co/${encodeURIComponent(board)}`);
    if (page.status === 200) {
      const $ = load(page.body);
      const title = $('title').text().replace(/\s+[-|]\s+.*$/, '').trim();
      const og = $('meta[property="og:site_name"]').attr('content') || '';
      orgName = title || og.replace(/^Jobs at\s*/i, '') || board;
      website =
        $('a[href^="http"]').filter((_, el) => /website|home/i.test($(el).text())).first().attr('href')
        || $('.main-header-logo a').attr('href')
        || '';
    }
  }
  return { orgName, website, jobs };
}

async function fetchAshby(board: string): Promise<{
  orgName: string;
  website: string;
  jobs: Array<{ title: string; body: string }>;
}> {
  const api = await getAuditPage(
    `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}?includeCompensation=true`,
  );
  const jobs: Array<{ title: string; body: string }> = [];
  let orgName = '';
  let website = '';
  if (api.status === 200) {
    const data = JSON.parse(api.body) as {
      jobs?: Array<{ title: string; descriptionHtml?: string; department?: string; team?: string }>;
    };
    for (const job of data.jobs || []) {
      jobs.push({
        title: job.title || '',
        body: `${job.department || ''} ${job.team || ''} ${stripHtml(job.descriptionHtml || '')}`.slice(0, 8000),
      });
    }
  }
  const page = await getAuditPage(`https://jobs.ashbyhq.com/${encodeURIComponent(board)}`);
  if (page.status === 200) {
    const match = page.body.match(/window\.__appData\s*=\s*(\{[\s\S]*?\});/);
    if (match) {
      try {
        const app = JSON.parse(match[1]) as {
          organization?: { name?: string; publicWebsite?: string };
        };
        orgName = app.organization?.name || orgName;
        website = app.organization?.publicWebsite || website;
      } catch {
        /* ignore */
      }
    }
  }
  return { orgName: orgName || board, website, jobs };
}

const KNOWN_WRONG_WEBSITES: Record<string, string[]> = {
  'amber-group': ['ambersearch.de'],
  'dapper-labs': ['dapper.agency'],
  sentry: ['sentry.io'],
  'collective-shift': ['collective.com'],
  'nomic-foundation': ['nomic.bio'],
  reservoir: ['reservoir-media.com'],
  brinc: ['brincdrones.com'],
  titan: ['titan.com'],
  kodex: ['kodexglobal.com'],
  novel: ['novel.shop'],
  proto: ['proto.xyz', 'proto.network'], // proto.xyz is us; greenhouse proto often wrong
  apollo: ['apollo.io'],
  fuse: ['f.energy'],
};

const KNOWN_RIGHT_WEBSITES: Record<string, string[]> = {
  ledger: ['ledger.com'],
  'layerzero-labs': ['layerzero.network'],
  analog: ['analog.io'],
  arca: ['arcawealth.com'],
  sfox: ['sfox.com'],
  nibiru: ['nibiru.fi'],
  'burnt-finance': ['xion', 'burnt'],
  grayscale: ['grayscale.com'],
  'gateway-fm': ['gateway.fm'],
  reserve: ['reserve.org'],
  'constellation-network': ['constellationnetwork.io', 'constellationlabs.io'],
  'safe-global': ['safe.global'],
};

function hostOf(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function websiteBrandMismatch(slug: string, website: string): string | undefined {
  const host = hostOf(website);
  if (!host) return;
  for (const bad of KNOWN_WRONG_WEBSITES[slug] || []) {
    if (host.includes(bad.replace(/^www\./, ''))) return `Website ${host} is a known slug collision (not ${slug}).`;
  }
  return;
}

function websiteBrandConfirmed(slug: string, website: string): boolean {
  const host = hostOf(website);
  if (!host) return false;
  return (KNOWN_RIGHT_WEBSITES[slug] || []).some((ok) => host.includes(ok.replace(/^www\./, '')));
}

function decideVerdict(
  row: RowIn,
  alignment: ReviewRow['nameAlignment'],
  web3JobCount: number,
  liveJobCount: number,
  orgWeb3: boolean,
  atsOrgName: string,
  website: string,
): { verdict: ReviewRow['verdict']; notes: string } {
  const pct = liveJobCount ? web3JobCount / liveJobCount : 0;
  const notes: string[] = [];

  const siteMismatch = websiteBrandMismatch(row.competitorSlug, website);
  if (siteMismatch) {
    notes.push(siteMismatch);
    return { verdict: 'wrong_board', notes: notes.join(' ') };
  }

  if (alignment === 'mismatch' && !websiteBrandConfirmed(row.competitorSlug, website)) {
    notes.push(`ATS org "${atsOrgName}" does not align with competitor "${row.competitorName}".`);
    return { verdict: 'wrong_board', notes: notes.join(' ') };
  }

  const strongWeb3 = web3JobCount >= 3 || pct >= 0.25 || (web3JobCount >= 1 && liveJobCount <= 4);
  const anyWeb3 = web3JobCount >= 1 || orgWeb3;

  if (!anyWeb3) {
    notes.push('No web3/crypto/blockchain signals in job titles/descriptions or org metadata.');
    return { verdict: 'not_web3', notes: notes.join(' ') };
  }

  if (websiteBrandConfirmed(row.competitorSlug, website)) {
    notes.push(`Careers site domain matches expected brand (${hostOf(website)}).`);
  }

  if (alignment === 'partial' && !websiteBrandConfirmed(row.competitorSlug, website)) {
    notes.push('Partial name match — confirm board ownership before ingest.');
    return { verdict: 'web3_but_verify_identity', notes: notes.join(' ') };
  }

  if (strongWeb3) {
    notes.push(`${web3JobCount}/${liveJobCount} jobs (${Math.round(pct * 100)}%) flagged web3-related.`);
    if (alignment === 'partial') notes.push('Name match is partial; confirm ATS board ownership.');
    return {
      verdict: websiteBrandConfirmed(row.competitorSlug, website) && alignment !== 'partial'
        ? 'ingest_candidate'
        : 'web3_but_verify_identity',
      notes: notes.join(' '),
    };
  }

  notes.push(`Only ${web3JobCount}/${liveJobCount} web3-tagged jobs; employer may be mixed/non-crypto.`);
  return { verdict: 'web3_but_verify_identity', notes: notes.join(' ') };
}

function toCsv(rows: ReviewRow[]): string {
  const header = [
    'competitorName',
    'competitorSlug',
    'atsProvider',
    'atsBoard',
    'atsOrgName',
    'atsWebsite',
    'liveJobCount',
    'web3JobCount',
    'web3JobPct',
    'nameAlignment',
    'verdict',
    'notes',
    'sampleWeb3Titles',
    'sampleOtherTitles',
    'atsIngestUrl',
  ];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        esc(r.competitorName),
        esc(r.competitorSlug),
        esc(r.atsProvider),
        esc(r.atsBoard),
        esc(r.atsOrgName),
        esc(r.atsWebsite),
        r.liveJobCount,
        r.web3JobCount,
        Math.round(r.web3JobPct * 100),
        esc(r.nameAlignment),
        esc(r.verdict),
        esc(r.notes),
        esc(r.sampleWeb3Jobs.map((j) => j.title).slice(0, 5).join(' | ')),
        esc(r.sampleOtherJobs.map((j) => j.title).slice(0, 5).join(' | ')),
        esc(r.atsIngestUrl),
      ].join(','),
    );
  }
  return lines.join('\n');
}

async function reviewOne(row: RowIn): Promise<ReviewRow> {
  const fetched =
    row.atsProvider === 'greenhouse'
      ? await fetchGreenhouse(row.atsBoard)
      : row.atsProvider === 'lever'
        ? await fetchLever(row.atsBoard)
        : await fetchAshby(row.atsBoard);

  const classified = fetched.jobs.map((job) => {
    const result = isWeb3Job(job.title, job.body);
    return { title: job.title, web3Score: result.score, terms: result.terms, web3: result.web3 };
  });

  const web3Jobs = classified.filter((j) => j.web3);
  const otherJobs = classified.filter((j) => !j.web3);
  const alignment = nameAlignment(row.competitorName, fetched.orgName);
  const orgWeb3 = orgLooksWeb3(fetched.orgName, fetched.website);

  const { verdict, notes } = decideVerdict(
    row,
    alignment,
    web3Jobs.length,
    classified.length,
    orgWeb3,
    fetched.orgName,
    fetched.website,
  );

  return {
    ...row,
    atsOrgName: fetched.orgName,
    atsWebsite: fetched.website,
    liveJobCount: classified.length,
    web3JobCount: web3Jobs.length,
    web3JobPct: classified.length ? web3Jobs.length / classified.length : 0,
    orgLooksWeb3: orgWeb3,
    nameAlignment: alignment,
    verdict,
    notes,
    sampleWeb3Jobs: web3Jobs.sort((a, b) => b.web3Score - a.web3Score).slice(0, 8),
    sampleOtherJobs: otherJobs.slice(0, 5).map((j) => ({ title: j.title, web3Score: j.web3Score, terms: j.terms })),
    checkedAt: new Date().toISOString(),
  };
}

async function main(): Promise<void> {
  if (!fs.existsSync(IN_CSV)) {
    console.error(`Missing ${IN_CSV}; run competitor gap audit first.`);
    process.exitCode = 1;
    return;
  }
  const input = parseCsv(IN_CSV);
  const results: ReviewRow[] = [];
  for (let i = 0; i < input.length; i++) {
    const row = input[i];
    process.stderr.write(`[${i + 1}/${input.length}] ${row.competitorName} (${row.atsProvider}/${row.atsBoard})\n`);
    results.push(await reviewOne(row));
  }

  const summary = {
    ingest_candidate: results.filter((r) => r.verdict === 'ingest_candidate').length,
    web3_but_verify_identity: results.filter((r) => r.verdict === 'web3_but_verify_identity').length,
    wrong_board: results.filter((r) => r.verdict === 'wrong_board').length,
    not_web3: results.filter((r) => r.verdict === 'not_web3').length,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify({ generatedAt: new Date().toISOString(), summary, results }, null, 2));
  fs.writeFileSync(OUT_CSV, toCsv(results));

  console.log(
    JSON.stringify(
      {
        outJson: OUT_JSON,
        outCsv: OUT_CSV,
        summary,
        ingestCandidates: results
          .filter((r) => r.verdict === 'ingest_candidate')
          .map((r) => ({
            name: r.competitorName,
            ats: `${r.atsProvider}/${r.atsBoard}`,
            atsOrgName: r.atsOrgName,
            website: r.atsWebsite,
            web3Jobs: `${r.web3JobCount}/${r.liveJobCount}`,
          })),
        wrongBoards: results
          .filter((r) => r.verdict === 'wrong_board')
          .map((r) => ({
            name: r.competitorName,
            expected: r.competitorName,
            actual: r.atsOrgName,
            ats: `${r.atsProvider}/${r.atsBoard}`,
          })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});