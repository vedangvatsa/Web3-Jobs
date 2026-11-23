/**
 * Lists ATS boards from portfolio JSON that are not yet in configured ingestion,
 * then probes live job counts on Greenhouse / Lever / Ashby.
 */
import fs from 'node:fs';
import rejected from '../content/rejected-ats-boards.json';
import { atsBoardKey } from '../src/lib/ats-board-identity';
import { configuredAtsBoards } from './lib/ats-source-inventory';

const SOURCE_FILES = [
  'content/sources/galaxy-venturecareers-companies.json',
  'content/sources/blockchain-capital-companies.json',
  'content/sources/cyberfund-companies.json',
  'content/sources/blockchain-assoc-companies.json',
  'content/top100-employers.json',
];

type CompanyRow = {
  name?: string;
  domain?: string;
  website?: string;
  company?: string;
  ats_job_links?: string[];
  careersUrl?: string;
};

function parseAtsLink(url: string): { provider: string; board: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const segments = u.pathname.split('/').filter(Boolean);
    if (host.includes('greenhouse.io')) {
      const board =
        segments[0] === 'v1' && segments[1] === 'boards'
          ? segments[2]
          : segments.find((s) => s !== 'jobs' && s !== 'embed') || segments[0];
      if (board) return { provider: 'greenhouse', board };
    }
    if (host.includes('lever.co')) {
      const board = segments[0] === 'v0' ? segments[2] : segments[0];
      if (board) return { provider: 'lever', board };
    }
    if (host.includes('ashbyhq.com')) {
      const board =
        segments[0] === 'posting-api' && segments[1] === 'job-board'
          ? segments[2]
          : segments[segments.length - 1];
      if (board && !['application', 'api'].includes(board)) return { provider: 'ashby', board };
    }
    if (host.includes('workable.com') && segments[0] && segments[0] !== 'api') {
      return { provider: 'workable', board: segments[0] };
    }
    if (host.includes('smartrecruiters.com')) {
      const board = segments[segments.length - 1];
      if (board) return { provider: 'smartrecruiters', board };
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function countJobs(provider: string, board: string): Promise<number | null> {
  const encoded = encodeURIComponent(board);
  try {
    if (provider === 'greenhouse') {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${encoded}/jobs?content=false`);
      if (!res.ok) return null;
      const data = (await res.json()) as { jobs?: unknown[] };
      return data.jobs?.length ?? 0;
    }
    if (provider === 'lever') {
      const res = await fetch(`https://api.lever.co/v0/postings/${encoded}?mode=json`);
      if (!res.ok) return null;
      const data = (await res.json()) as unknown[];
      return Array.isArray(data) ? data.length : null;
    }
    if (provider === 'ashby') {
      const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${encoded}`);
      if (!res.ok) return null;
      const data = (await res.json()) as { jobs?: unknown[] };
      return data.jobs?.length ?? 0;
    }
  } catch {
    return null;
  }
  return null;
}

async function main() {
  const configured = new Set(
    configuredAtsBoards().map((b) => atsBoardKey(b.provider, b.board).toLowerCase()),
  );

  const rows: Array<{ name: string; provider: string; board: string; link: string }> = [];
  const seen = new Set<string>();

  for (const file of SOURCE_FILES) {
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as CompanyRow[] | Record<string, unknown>;
    const list = Array.isArray(data) ? data : Object.values(data);
    for (const co of list) {
      if (!co || typeof co !== 'object') continue;
      const name = co.name || co.company || co.domain || '?';
      const links = [...(co.ats_job_links || [])];
      if (co.careersUrl) links.push(co.careersUrl);
      for (const link of links) {
        const parsed = parseAtsLink(link);
        if (!parsed) continue;
        const key = atsBoardKey(parsed.provider, parsed.board);
        if (key in rejected) continue;
        if (configured.has(key.toLowerCase())) continue;
        const dedupe = `${key}|${name}`;
        if (seen.has(dedupe)) continue;
        seen.add(dedupe);
        rows.push({ name: String(name), ...parsed, link });
      }
    }
  }

  console.log(`Unconfigured ATS links from source lists: ${rows.length}`);
  const hits: typeof rows & { jobs: number }[] = [];
  for (const row of rows) {
    const jobs = await countJobs(row.provider, row.board);
    if (jobs && jobs > 0) {
      hits.push({ ...row, jobs } as typeof row & { jobs: number });
      console.log(`  ✅ ${row.provider}/${row.board} (${row.name}): ${jobs} jobs`);
    }
  }
  console.log(`\nActive unconfigured boards: ${hits.length}`);
  fs.writeFileSync('.cache/discovered-unconfigured-ats.json', JSON.stringify(hits, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});