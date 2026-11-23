/**
 * Live scan: are published grants accepting applications right now?
 *
 * Usage: npx tsx scripts/verify-grant-applications.ts [--concurrency=6] [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { load } from 'cheerio';
import type { GrantProgram } from '../src/types';
import { grantApplicationStatus, classifyLiveApplicationPage } from './lib/grant-application-status';
import { grantFetchUserAgent } from './lib/grant-page-extract';
import type { RemovedGrantListing } from './verify-grant-liveness';

const GRANTS_PATH = path.join(process.cwd(), 'content', 'grants', 'grants.json');
const REMOVED_PATH = path.join(process.cwd(), 'content', 'grants', 'removed-grants.json');
const REPORT_PATH = path.join(process.cwd(), '.cache', 'grant-application-scan.json');
const CACHE_DIR = path.join('.cache', 'grant-application-scan');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const concurrencyArg = args.find((a) => a.startsWith('--concurrency='));
const concurrency = concurrencyArg ? Math.min(10, Math.max(1, Number(concurrencyArg.split('=')[1]))) : 6;

const sha = (v: string) => crypto.createHash('sha256').update(v).digest('hex');

function htmlToText(html: string): string {
  const $ = load(html);
  $('script,style,noscript,svg').remove();
  return $('body').text().replace(/\s+/g, ' ').trim();
}

async function fetchPage(url: string, attempt = 0): Promise<{ html: string; finalUrl: string } | null> {
  const cacheFile = path.join(CACHE_DIR, `${sha(url)}.json`);
  if (fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8')) as { html: string; finalUrl: string };
    if (cached.html?.length > 100) return { html: cached.html, finalUrl: cached.finalUrl };
  }
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent': grantFetchUserAgent(),
        accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (res.status === 429 && attempt < 2) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      return fetchPage(url, attempt + 1);
    }
    if (res.status >= 400) return null;
    const html = await res.text();
    const payload = { html, finalUrl: res.url, fetchedAt: new Date().toISOString() };
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify(payload));
    return { html, finalUrl: res.url };
  } catch {
    return null;
  }
}

async function pool<T, R>(items: T[], worker: (item: T) => Promise<R>, size: number): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  async function run() {
    while (index < items.length) {
      const i = index++;
      results[i] = await worker(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => run()));
  return results;
}

function loadRemoved(): Record<string, RemovedGrantListing> {
  if (!fs.existsSync(REMOVED_PATH)) return {};
  return JSON.parse(fs.readFileSync(REMOVED_PATH, 'utf-8')) as Record<string, RemovedGrantListing>;
}

async function main() {
  const grants: GrantProgram[] = JSON.parse(fs.readFileSync(GRANTS_PATH, 'utf-8'));

  const catalogBlocked = grants
    .map((g) => ({ id: g.id, status: grantApplicationStatus(g) }))
    .filter((x) => !x.status.ok);

  let done = 0;
  const results = await pool(
    grants,
    async (grant) => {
      const catalog = grantApplicationStatus(grant);
      if (!catalog.ok) {
        return { id: grant.id, url: grant.url, verdict: 'closed' as const, detail: `catalog-${catalog.reason}` };
      }

      const page = await fetchPage(grant.url);
      if (!page) {
        return { id: grant.id, url: grant.url, verdict: 'unreachable' as const, detail: 'fetch-failed' };
      }

      const text = htmlToText(page.html);
      const { verdict, detail } = classifyLiveApplicationPage({
        grant,
        pageText: text,
        finalUrl: page.finalUrl,
      });
      const row = { id: grant.id, url: grant.url, finalUrl: page.finalUrl, verdict, detail };
      done++;
      if (done % 25 === 0 || done === grants.length) console.error(`[scan] ${done}/${grants.length}`);
      return row;
    },
    concurrency,
  );

  const closed = results.filter((r) => r.verdict === 'closed');
  const open = results.filter((r) => r.verdict === 'open');
  const unknown = results.filter((r) => r.verdict === 'unknown');
  const unreachable = results.filter((r) => r.verdict === 'unreachable');

  const report = {
    scannedAt: new Date().toISOString(),
    total: grants.length,
    catalogBlocked: catalogBlocked.length,
    live: { open: open.length, closed: closed.length, unknown: unknown.length, unreachable: unreachable.length },
    closed,
    unknown,
    unreachable,
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`Scanned ${grants.length} grants:`);
  console.log(`  open (live signals): ${open.length}`);
  console.log(`  closed: ${closed.length}`);
  console.log(`  unknown (needs review): ${unknown.length}`);
  console.log(`  unreachable: ${unreachable.length}`);

  if (closed.length) {
    console.log('\nClosed:');
    for (const row of closed.slice(0, 40)) console.log(`  ${row.id}: ${row.detail}`);
    if (closed.length > 40) console.log(`  ... +${closed.length - 40} more`);
  }

  if (unknown.length) {
    console.log('\nUnknown (manual review):');
    for (const row of unknown.slice(0, 25)) console.log(`  ${row.id}: ${row.detail}`);
    if (unknown.length > 25) console.log(`  ... +${unknown.length - 25} more (see ${REPORT_PATH})`);
  }

  if (!apply || closed.length === 0) return;

  const toRemove = new Set(closed.map((c) => c.id));
  const removed = loadRemoved();
  const removedAt = new Date().toISOString();
  const kept = grants.filter((g) => !toRemove.has(g.id));

  for (const grant of grants) {
    if (!toRemove.has(grant.id)) continue;
    removed[grant.id] = {
      removedAt,
      reason: 'program-closed',
      url: grant.url,
      name: grant.name,
      grant: { ...grant },
    };
  }

  fs.writeFileSync(GRANTS_PATH, `${JSON.stringify(kept, null, 2)}\n`);
  fs.writeFileSync(REMOVED_PATH, `${JSON.stringify(removed, null, 2)}\n`);
  console.log(`\nRemoved ${toRemove.size} closed grants from catalog. Run: npx tsx scripts/generate-slug-types.ts`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});