#!/usr/bin/env tsx
/**
 * Strict ingest gate for competitor ATS web3 shortlists.
 * Reads review JSON; emits INGEST | ALREADY | REJECT for each web3-tier board.
 * Does not modify refresh-jobs-cache (wire approved rows manually).
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const inputArg = args.find((a) => a.startsWith('--input='))?.split('=')[1];
const outArg = args.find((a) => a.startsWith('--out='))?.split('=')[1];
const REVIEW_JSON = inputArg || 'docs/job-aggregator-outreach/competitor-ats-web3-review-1745-2026-11-25.json';
const OUT =
  outArg || 'docs/job-aggregator-outreach/competitor-ats-ingest-approved-1745-2026-11-25.csv';

/** Boards already wired in refresh-jobs-cache from the prior gap pass. */
const PRIOR_WIRED: Array<{ slug: string; company: string; provider: string; board: string }> = [
  { slug: 'ledger', company: 'Ledger', provider: 'ashby', board: 'ledger' },
  { slug: 'arca', company: 'Arca', provider: 'ashby', board: 'arca' },
  { slug: 'nibiru', company: 'Nibiru', provider: 'lever', board: 'nibiru' },
  { slug: 'burnt-finance', company: 'XION', provider: 'greenhouse', board: 'burnt' },
  { slug: 'sfox', company: 'SFOX', provider: 'greenhouse', board: 'sfox' },
];

/** New net-positive feeds (ownership-verified, crypto-primary). */
const NEW_INGEST: Array<{
  slug: string;
  company: string;
  provider: string;
  board: string;
  note: string;
}> = [
  { slug: 'dtcpay', company: 'dtcpay', provider: 'greenhouse', board: 'dtcpay', note: 'Payments / stablecoin employer' },
  { slug: 'chaincode-labs', company: 'Chaincode Labs', provider: 'greenhouse', board: 'chaincodelabs', note: 'Bitcoin research' },
  { slug: '3commas', company: '3Commas', provider: 'ashby', board: '3commas', note: 'Crypto trading tools' },
  { slug: 'geo-browser', company: 'Geo Browser', provider: 'ashby', board: 'geobrowser', note: 'Web3 consumer browser' },
  { slug: 'aptos-foundation', company: 'Aptos Foundation', provider: 'ashby', board: 'aptosfoundation', note: 'Foundation careers (separate from Aptos Labs GH)' },
  { slug: 'hivemind-capital-partners', company: 'Hivemind Capital', provider: 'lever', board: 'hivemind-capital', note: 'Crypto VC' },
  { slug: 'overmind', company: 'Overmind', provider: 'lever', board: 'overmind', note: 'On-chain infra (100% crypto titles)' },
];

const NON_CRYPTO_WEBSITE_HOSTS = [
  'apollo.io',
  'sentilink.com',
  'f.energy',
  'phoenix.ca',
  'nomic.bio',
  'dapper.agency',
  'ambersearch.de',
  'sentry.io',
  'collective.com',
  'reservoir-media.com',
  'titan.com',
  'kodexglobal.com',
  'novel.shop',
  'neon.com.br',
  'constellationlab.io',
  'analog.io',
  'brincdrones.com',
  'onefootprint.com',
  'linear.app',
  'zeta.tech',
];

const SLUG_REJECT: Record<string, string> = {
  analog: 'Ashby analog is analog.io robotics, not a crypto-native employer.',
  'morph-labs': 'Greenhouse morph is hardware/robotics; not Morph L2.',
  roofstacks: 'Roofstacks board is Turkish core banking IT, not web3.',
  'trace-labs': 'tracelabs.ai is robotics/ML, not OriginTrail.',
  'space-id': 'Greenhouse space is Space Programs, not SPACE ID.',
  'virtu-swap': 'Greenhouse virtu board does not match VirtuSwap.',
  'blue-sky': 'Lever blue is not BlueSky (partial slug collision).',
  'fuse-energy': 'Ashby fuse is f.energy (energy), not Fuse Network.',
  amber: 'Ashby amber is ambersearch.de recruiting, not Amber Group.',
  'alumni-ventures': 'Org metadata only; zero crypto-titled roles on board.',
};

const DUPLICATE_COMPANY_SLUGS = new Set([
  'binance', // lever:binance already configured
  'layerzero-labs', // greenhouse:layerzerolabs already configured
  'consensys-diligence',
  'consensys-mesh', // greenhouse:consensys has more jobs than Ashby
]);

function loadConfiguredAts(): Map<string, string> {
  const src = fs.readFileSync('scripts/refresh-jobs-cache.ts', 'utf8');
  const map = new Map<string, string>();
  for (const [prov, constName] of [
    ['greenhouse', 'GREENHOUSE_BOARDS'],
    ['lever', 'LEVER_BOARDS'],
    ['ashby', 'ASHBY_BOARDS'],
  ] as const) {
    const start = src.indexOf(`const ${constName}`);
    if (start < 0) continue;
    const end = src.indexOf('];', start);
    const block = src.slice(start, end);
    const re = /\{\s*board:\s*'([^']+)',\s*company:\s*'([^']+)'/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(block))) {
      map.set(`${prov}:${m[1].toLowerCase()}`, m[2]);
    }
  }
  return map;
}

function hostOf(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

type Row = {
  competitorName: string;
  competitorSlug: string;
  atsProvider: string;
  atsBoard: string;
  atsOrgName: string;
  atsWebsite: string;
  web3JobCount: number;
  liveJobCount: number;
  verdict: string;
  nameAlignment: string;
  atsIngestUrl: string;
};

function decide(
  row: Row,
  configured: Map<string, string>,
  ingestKeys: Set<string>,
): { decision: 'INGEST' | 'ALREADY' | 'REJECT'; reason: string; company?: string } {
  const key = `${row.atsProvider}:${row.atsBoard}`.toLowerCase();
  const wired = [...PRIOR_WIRED, ...NEW_INGEST].find(
    (a) => a.slug === row.competitorSlug || (`${a.provider}:${a.board}`.toLowerCase() === key),
  );

  if (wired && ingestKeys.has(key)) {
    return { decision: 'INGEST', reason: wired.note || 'Approved competitor gap feed', company: wired.company };
  }

  if (configured.has(key)) {
    return {
      decision: 'ALREADY',
      reason: `Already in refresh-jobs-cache as ${configured.get(key)}`,
      company: configured.get(key),
    };
  }

  const slugReason = SLUG_REJECT[row.competitorSlug];
  if (slugReason) return { decision: 'REJECT', reason: slugReason };

  const host = hostOf(row.atsWebsite);
  if (host && NON_CRYPTO_WEBSITE_HOSTS.some((h) => host.includes(h))) {
    return { decision: 'REJECT', reason: `Careers site ${host} is not the crypto employer.` };
  }

  if (DUPLICATE_COMPANY_SLUGS.has(row.competitorSlug)) {
    return { decision: 'REJECT', reason: 'Duplicate provider/company already configured on another ATS.' };
  }

  if (row.nameAlignment === 'partial') {
    return { decision: 'REJECT', reason: 'Partial ATS slug match; wrong employer likely.' };
  }

  if (row.verdict !== 'ingest_candidate' && row.verdict !== 'web3_but_verify_identity') {
    return { decision: 'REJECT', reason: `Verdict ${row.verdict}.` };
  }

  const pct = row.liveJobCount ? row.web3JobCount / row.liveJobCount : 0;
  if (row.web3JobCount < 2 && pct < 0.2) {
    return { decision: 'REJECT', reason: `Insufficient crypto roles (${row.web3JobCount}/${row.liveJobCount}).` };
  }
  if (pct < 0.12 && row.liveJobCount > 20) {
    return { decision: 'REJECT', reason: `Mixed employer (${row.web3JobCount}/${row.liveJobCount} crypto-tagged).` };
  }

  return { decision: 'REJECT', reason: 'Failed strict ingest bar; manual review only.' };
}

function main(): void {
  const data = JSON.parse(fs.readFileSync(REVIEW_JSON, 'utf8')) as { results: Row[] };
  const configured = loadConfiguredAts();
  const ingestList = [...PRIOR_WIRED.map((p) => ({ ...p, note: 'Prior gap pass' })), ...NEW_INGEST];
  const ingestKeys = new Set(ingestList.map((a) => `${a.provider}:${a.board}`.toLowerCase()));

  const tierRows = data.results.filter(
    (r) => r.verdict === 'ingest_candidate' || r.verdict === 'web3_but_verify_identity',
  );

  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    [
      'decision',
      'competitorName',
      'competitorSlug',
      'atsProvider',
      'atsBoard',
      'atsOrgName',
      'atsWebsite',
      'web3Jobs',
      'liveJobs',
      'reason',
      'atsIngestUrl',
    ].join(','),
  ];

  const summary = { INGEST: 0, ALREADY: 0, REJECT: 0 };
  const seenIngest = new Set<string>();

  for (const approved of ingestList) {
    const row = tierRows.find(
      (r) =>
        r.competitorSlug === approved.slug ||
        (`${r.atsProvider}:${r.atsBoard}`.toLowerCase() === `${approved.provider}:${approved.board}`.toLowerCase()),
    );
    if (!row) continue;
    seenIngest.add(`${approved.provider}:${approved.board}`.toLowerCase());
    summary.INGEST++;
    lines.push(
      [
        esc('INGEST'),
        esc(approved.company),
        esc(row.competitorSlug),
        esc(approved.provider),
        esc(approved.board),
        esc(row.atsOrgName),
        esc(row.atsWebsite),
        row.web3JobCount,
        row.liveJobCount,
        esc('note' in approved ? approved.note : ''),
        esc(row.atsIngestUrl),
      ].join(','),
    );
  }

  for (const row of tierRows) {
    const key = `${row.atsProvider}:${row.atsBoard}`.toLowerCase();
    if (seenIngest.has(key)) continue;
    const { decision, reason, company } = decide(row, configured, ingestKeys);
    summary[decision]++;
    lines.push(
      [
        esc(decision),
        esc(company || row.competitorName),
        esc(row.competitorSlug),
        esc(row.atsProvider),
        esc(row.atsBoard),
        esc(row.atsOrgName),
        esc(row.atsWebsite),
        row.web3JobCount,
        row.liveJobCount,
        esc(reason),
        esc(row.atsIngestUrl),
      ].join(','),
    );
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join('\n'));
  console.log(JSON.stringify({ out: OUT, web3Tier: tierRows.length, summary }, null, 2));
}

main();