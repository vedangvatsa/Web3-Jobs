#!/usr/bin/env tsx
/**
 * Mine ATS links from content JSON corpora, probe live job counts,
 * emit unconfigured boards for refresh-jobs-cache expansion.
 */
import fs from 'node:fs';
import path from 'node:path';
import rejected from '../content/rejected-ats-boards.json';
import { configuredAtsBoards } from './lib/ats-source-inventory';
import { atsBoardKey } from '../src/lib/ats-board-identity';

const configured = new Set(configuredAtsBoards().map((b) => atsBoardKey(b.provider, b.board).toLowerCase()));

const refreshSrc = fs.readFileSync('scripts/refresh-jobs-cache.ts', 'utf8');
const RETIRED = new Set(
  [...refreshSrc.matchAll(/'([^']+:\s*[^']+)'/g)]
    .map((m) => m[1].replace(/\s+/g, '').toLowerCase())
    .filter((k) => k.includes(':'))
);

function parseUrl(url: string): { provider: string; board: string } | null {
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    const s = u.pathname.split('/').filter(Boolean);
    if (h.includes('boards.greenhouse.io') || h.includes('job-boards.greenhouse.io')) {
      const board = s[s.length - 1] === 'jobs' ? s[s.length - 2] : s[0];
      return board ? { provider: 'greenhouse', board } : null;
    }
    if (h.includes('greenhouse.io')) {
      const board = s[0] === 'v1' && s[1] === 'boards' ? s[2] : s.find((x) => x !== 'jobs' && x !== 'embed') || s[0];
      return board ? { provider: 'greenhouse', board } : null;
    }
    if (h.includes('lever.co')) {
      const board = s[0] === 'v0' ? s[2] : s[0];
      return board ? { provider: 'lever', board } : null;
    }
    if (h.includes('ashbyhq.com')) {
      const board = s[0] === 'posting-api' && s[1] === 'job-board' ? s[2] : s[s.length - 1];
      if (board && !['application', 'api'].includes(board)) return { provider: 'ashby', board };
    }
    if (h.includes('workable.com') && s[0]) return { provider: 'workable', board: s[0] };
    if (h.endsWith('.breezy.hr')) return { provider: 'breezy', board: h.split('.')[0] };
    if (h.includes('smartrecruiters.com') && s.length) {
      return { provider: 'smartrecruiters', board: s[s.length - 1] };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function walk(obj: unknown, out: string[]) {
  if (!obj) return;
  if (typeof obj === 'string' && /^https?:\/\//.test(obj)) out.push(obj);
  else if (Array.isArray(obj)) obj.forEach((v) => walk(v, out));
  else if (typeof obj === 'object') Object.values(obj as object).forEach((v) => walk(v, out));
}

function scanDir(dir: string, files: string[]) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) scanDir(p, files);
    else if (ent.name.endsWith('.json')) files.push(p);
  }
}

function companyFromRecord(data: unknown, url: string): string {
  if (Array.isArray(data)) {
    for (const row of data) {
      if (!row || typeof row !== 'object') continue;
      const r = row as Record<string, unknown>;
      const links = JSON.stringify(r);
      if (links.includes(url)) return String(r.company || r.name || r.employer || '');
    }
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const v of Object.values(data as Record<string, unknown>)) {
      if (v && typeof v === 'object' && 'company' in (v as object)) {
        return String((v as { company?: string }).company);
      }
    }
  }
  return '';
}

async function countJobs(provider: string, board: string): Promise<number> {
  const enc = encodeURIComponent(board);
  try {
    if (provider === 'greenhouse') {
      const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${enc}/jobs?content=false`, {
        signal: AbortSignal.timeout(12_000),
      });
      if (!r.ok) return 0;
      return ((await r.json()) as { jobs?: unknown[] }).jobs?.length ?? 0;
    }
    if (provider === 'lever') {
      const r = await fetch(`https://api.lever.co/v0/postings/${enc}?mode=json`, { signal: AbortSignal.timeout(12_000) });
      if (!r.ok) return 0;
      const d = await r.json();
      return Array.isArray(d) ? d.length : 0;
    }
    if (provider === 'ashby') {
      const r = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${enc}`, { signal: AbortSignal.timeout(12_000) });
      if (!r.ok) return 0;
      return ((await r.json()) as { jobs?: unknown[] }).jobs?.length ?? 0;
    }
    if (provider === 'breezy') {
      const r = await fetch(`https://${board}.breezy.hr/json`, { signal: AbortSignal.timeout(12_000) });
      if (!r.ok) return 0;
      const d = await r.json();
      return Array.isArray(d) ? d.length : 0;
    }
    if (provider === 'workable') {
      const r = await fetch(`https://apply.workable.com/api/v3/accounts/${enc}/jobs`, { signal: AbortSignal.timeout(12_000) });
      if (!r.ok) return 0;
      return ((await r.json()) as { jobs?: unknown[] }).jobs?.length ?? 0;
    }
  } catch {
    return 0;
  }
  return 0;
}

async function main() {
  const sourceFiles: string[] = [];
  for (const d of ['content/sources', 'content']) {
    if (fs.existsSync(d)) scanDir(d, sourceFiles);
  }

  const uniq = new Map<string, { name: string; provider: string; board: string; url: string }>();

  for (const file of sourceFiles) {
    if (/job-description|legacy-slugs|jobs-cache|jobs-runtime|companies-runtime|sitemap|description-shards/i.test(file)) continue;
    let data: unknown;
    try {
      data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      continue;
    }
    const urls: string[] = [];
    walk(data, urls);
    for (const url of urls) {
      const p = parseUrl(url);
      if (!p) continue;
      const key = atsBoardKey(p.provider, p.board).toLowerCase();
      if (key in rejected || configured.has(key) || RETIRED.has(key)) continue;
      if (!uniq.has(key)) {
        const name = companyFromRecord(data, url) || p.board.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        uniq.set(key, { name, ...p, url });
      }
    }
  }

  const candidates = [...uniq.values()];
  console.log(`Unconfigured boards in corpora: ${candidates.length}`);

  const active: Array<{ name: string; provider: string; board: string; jobs: number; url: string }> = [];
  const batch = 30;
  for (let i = 0; i < candidates.length; i += batch) {
    const slice = candidates.slice(i, i + batch);
    const counts = await Promise.all(
      slice.map(async (c) => ({ ...c, jobs: await countJobs(c.provider, c.board) }))
    );
    for (const c of counts) if (c.jobs > 0) active.push(c);
    process.stdout.write(`\rProbed ${Math.min(i + batch, candidates.length)}/${candidates.length}, active ${active.length}`);
  }
  console.log('\n');

  active.sort((a, b) => b.jobs - a.jobs);
  fs.mkdirSync('.cache', { recursive: true });
  fs.writeFileSync('.cache/batch-web3-board-discovery.json', JSON.stringify(active, null, 2));
  console.log(`Active unconfigured boards: ${active.length}`);
  for (const c of active.slice(0, 60)) {
    console.log(`${String(c.jobs).padStart(4)}\t${c.provider}\t${c.board}\t${c.name}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});