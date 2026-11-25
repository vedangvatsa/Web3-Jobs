#!/usr/bin/env tsx
/**
 * Strict ingest gate for competitor ATS shortlist (71 boards).
 * Outputs approved vs rejected CSV; does not modify refresh-jobs-cache.
 */
import fs from 'node:fs';
import path from 'node:path';

const REVIEW_JSON = 'docs/job-aggregator-outreach/competitor-ats-web3-review-2026-11-25.json';
const OUT = 'docs/job-aggregator-outreach/competitor-ats-ingest-approved-2026-11-25.csv';

const APPROVED_INGEST: Array<{
  slug: string;
  company: string;
  provider: string;
  board: string;
  action: 'add' | 'fix';
  note: string;
}> = [
  { slug: 'ledger', company: 'Ledger', provider: 'ashby', board: 'ledger', action: 'fix', note: 'Move from Lever to Ashby' },
  { slug: 'arca', company: 'Arca', provider: 'ashby', board: 'arca', action: 'add', note: 'Crypto asset manager' },
  { slug: 'nibiru', company: 'Nibiru', provider: 'lever', board: 'nibiru', action: 'add', note: 'L1 nibiru.fi' },
  { slug: 'burnt-finance', company: 'XION', provider: 'greenhouse', board: 'burnt', action: 'add', note: 'GH board branded XION' },
  { slug: 'sfox', company: 'SFOX', provider: 'greenhouse', board: 'sfox', action: 'add', note: 'Crypto prime broker' },
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
];

function hostOf(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function rejectReason(row: {
  competitorSlug: string;
  verdict: string;
  atsWebsite: string;
  web3JobCount: number;
  liveJobCount: number;
  competitorName: string;
  atsProvider: string;
  atsBoard: string;
}): string {
  const approved = APPROVED_INGEST.find(
    (a) => a.slug === row.competitorSlug || (a.provider === row.atsProvider && a.board === row.atsBoard),
  );
  if (approved) return '';

  const host = hostOf(row.atsWebsite);
  if (host && NON_CRYPTO_WEBSITE_HOSTS.some((h) => host.includes(h))) {
    return `Careers site ${host} is not the crypto employer (e.g. apollo.io / f.energy).`;
  }
  if (row.verdict === 'wrong_board') return 'Wrong ATS board (slug collision or org mismatch).';
  if (row.verdict === 'not_web3') return 'No material web3/crypto roles on board.';
  if (row.competitorSlug === 'analog') return 'Ashby analog is analog.io robotics, not Web3 Analog.';

  const pct = row.liveJobCount ? row.web3JobCount / row.liveJobCount : 0;
  if (row.web3JobCount < 2 && pct < 0.2) {
    return `Insufficient web3 roles (${row.web3JobCount}/${row.liveJobCount}).`;
  }
  if (pct < 0.12 && row.liveJobCount > 20) {
    return `Employer not primarily web3 (${row.web3JobCount}/${row.liveJobCount} web3-tagged).`;
  }
  if (['binance', 'layerzero-labs'].includes(row.competitorSlug)) {
    return 'Already configured in refresh-jobs-cache; no duplicate feed.';
  }
  return 'Failed strict ingest bar; manual review only.';
}

function main(): void {
  const data = JSON.parse(fs.readFileSync(REVIEW_JSON, 'utf8')) as {
    results: Array<{
      competitorName: string;
      competitorSlug: string;
      atsProvider: string;
      atsBoard: string;
      atsOrgName: string;
      atsWebsite: string;
      web3JobCount: number;
      liveJobCount: number;
      verdict: string;
      atsIngestUrl: string;
    }>;
  };

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

  for (const approved of APPROVED_INGEST) {
    const row = data.results.find(
      (r) => r.competitorSlug === approved.slug || (r.atsProvider === approved.provider && r.atsBoard === approved.board),
    );
    lines.push(
      [
        esc('INGEST'),
        esc(approved.company),
        esc(approved.slug),
        esc(approved.provider),
        esc(approved.board),
        esc(row?.atsOrgName || approved.company),
        esc(row?.atsWebsite || ''),
        row?.web3JobCount ?? '',
        row?.liveJobCount ?? '',
        esc(approved.note),
        esc(row?.atsIngestUrl || ''),
      ].join(','),
    );
  }

  const approvedKeys = new Set(APPROVED_INGEST.map((a) => `${a.provider}:${a.board}`));
  for (const row of data.results) {
    const key = `${row.atsProvider}:${row.atsBoard}`;
    if (approvedKeys.has(key)) continue;
    const reason = rejectReason(row);
    lines.push(
      [
        esc('REJECT'),
        esc(row.competitorName),
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
  console.log(`Wrote ${OUT} (${lines.length - 1} rows)`);
}

main();