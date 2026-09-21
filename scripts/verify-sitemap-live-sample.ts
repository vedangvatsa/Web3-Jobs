#!/usr/bin/env tsx
/**
 * Throttled live HTTP checks: sitemap ↔ slug-types gate + sample URLs.
 * Run: npx tsx scripts/verify-sitemap-live-sample.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE = 'https://hashtagweb3.com';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/** Removed job slugs (pre Sep 2026 sitemap cleanup) — must not reappear at site root. */
const FORMER_STALE_JOB_SLUGS = ['eng153', 'hackindia', 'hcah', 'mgr2'];

function loadSitemapPaths(): string[] {
  const routes = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'content', 'sitemap-routes.json'), 'utf8'),
  ) as { url: string }[];
  return routes.map((r) => new URL(r.url).pathname.replace(/\/+$/, '') || '/');
}

async function head(pathname: string): Promise<number> {
  const res = await fetch(`${SITE}${pathname}`, {
    method: 'HEAD',
    redirect: 'follow',
    headers: {
      'User-Agent': UA,
      Accept: 'text/html',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-dest': 'document',
      'sec-fetch-user': '?1',
    },
  });
  return res.status;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const paths = loadSitemapPaths();
  const set = new Set(paths);

  for (const stale of FORMER_STALE_JOB_SLUGS) {
    if (set.has(`/${stale}`)) {
      console.error(`[verify-sitemap-live] Removed job slug still in sitemap: /${stale}`);
      process.exit(1);
    }
  }

  const picks = [
    '/',
    '/jobs',
    '/events',
    '/amagi',
    '/4seas',
    '/arc',
    '/sas',
    '/india',
    '/sales386',
  ];
  const randomRoots = paths
    .filter((p) => p.startsWith('/') && !p.includes('/', 2) && p !== '/')
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);
  const toCheck = [...new Set([...picks, ...randomRoots])];

  console.log(`[verify-sitemap-live] Checking ${toCheck.length} URLs (throttled)…`);
  const failures: string[] = [];
  for (const p of toCheck) {
    const status = await head(p);
    const ok = status === 200;
    console.log(`  ${ok ? 'OK' : 'BAD'}\t${status}\t${p}`);
    if (!ok) failures.push(`${p} → ${status}`);
    await sleep(350);
  }

  if (failures.length) {
    console.error('[verify-sitemap-live] Failures:', failures.join(', '));
    process.exit(1);
  }
  console.log('[verify-sitemap-live] Sample checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
