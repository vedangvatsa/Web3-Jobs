/**
 * Verify grant program URLs are reachable before they stay in the public catalog.
 *
 * Usage:
 *   npx tsx scripts/verify-grant-liveness.ts [--apply] [--id=slug] [--concurrency=8]
 */
import fs from 'node:fs';
import path from 'node:path';
import type { GrantProgram } from '../src/types';
import { grantFetchUserAgent } from './lib/grant-page-extract';

const GRANTS_PATH = path.join(process.cwd(), 'content', 'grants', 'grants.json');
const REMOVED_PATH = path.join(process.cwd(), 'content', 'grants', 'removed-grants.json');
const REPORT_PATH = path.join(process.cwd(), '.cache', 'grant-liveness-report.json');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const idArg = args.find((a) => a.startsWith('--id='));
const onlyId = idArg?.split('=').slice(1).join('=');
const concurrencyArg = args.find((a) => a.startsWith('--concurrency='));
const concurrency = concurrencyArg ? Math.min(12, Math.max(1, Number(concurrencyArg.split('=')[1]))) : 8;

export type GrantUrlLive = {
  checkedAt: string;
  ok: boolean;
  status?: number;
  finalUrl?: string;
  error?: string;
};

export type RemovedGrantListing = {
  removedAt: string;
  reason: 'url-unreachable' | 'stale-url' | 'program-closed' | 'thin-content';
  url: string;
  name: string;
  grant: GrantProgram;
};

type GrantRecord = GrantProgram & { urlLive?: GrantUrlLive };

const FETCH_HEADERS = {
  'user-agent': grantFetchUserAgent(),
  accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
};

function isReachableStatus(status: number): boolean {
  if (status >= 200 && status < 400) return true;
  // Blocked by bot protection but host is up
  if (status === 401 || status === 403 || status === 405) return true;
  return false;
}

async function fetchWithProbe(url: string, method: 'HEAD' | 'GET'): Promise<Response> {
  return fetch(url, {
    method,
    redirect: 'follow',
    headers: FETCH_HEADERS,
    signal: AbortSignal.timeout(25_000),
  });
}

async function probeUrl(url: string): Promise<GrantUrlLive> {
  const checkedAt = new Date().toISOString();
  try {
    let res: Response | null = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1500 * attempt));

      res = await fetchWithProbe(url, 'HEAD');
      if (res.status === 429) continue;

      if (!isReachableStatus(res.status) || res.status === 405) {
        res = await fetchWithProbe(url, 'GET');
        if (res.status === 429) continue;
      }
      break;
    }

    if (!res) {
      return { checkedAt, ok: false, error: 'fetch-failed' };
    }

    if (res.status === 429) {
      return {
        checkedAt,
        ok: true,
        status: 429,
        finalUrl: res.url,
        error: 'rate-limited-assumed-live',
      };
    }

    const ok = isReachableStatus(res.status);
    return {
      checkedAt,
      ok,
      status: res.status,
      finalUrl: res.url,
      ...(ok ? {} : { error: `HTTP ${res.status}` }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'fetch-failed';
    return { checkedAt, ok: false, error: message };
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
  const grants: GrantRecord[] = JSON.parse(fs.readFileSync(GRANTS_PATH, 'utf-8'));
  const targets = onlyId ? grants.filter((g) => g.id === onlyId) : grants;
  if (onlyId && targets.length === 0) {
    throw new Error(`Grant id not found: ${onlyId}`);
  }

  console.log(`Probing ${targets.length} grant URL(s) (concurrency=${concurrency})…`);

  const probes = await pool(targets, async (grant) => {
    const urlLive = await probeUrl(grant.url);
    return { id: grant.id, urlLive, grant };
  }, concurrency);

  const byId = new Map(probes.map((p) => [p.id, p]));
  const dead = probes.filter((p) => !p.urlLive.ok);
  const live = probes.filter((p) => p.urlLive.ok);

  for (const grant of grants) {
    const hit = byId.get(grant.id);
    if (hit) grant.urlLive = hit.urlLive;
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        total: targets.length,
        live: live.length,
        dead: dead.length,
        deadIds: dead.map((d) => d.id),
      },
      null,
      2,
    ),
  );

  console.log(`Live: ${live.length}, unreachable: ${dead.length}`);
  if (dead.length > 0) {
    console.log('Unreachable:', dead.map((d) => `${d.id} (${d.urlLive.error || d.urlLive.status})`).join(', '));
  }

  if (!apply) {
    if (dead.length > 0) {
      console.log('\nRe-run with --apply to remove unreachable programs from grants.json and archive them.');
    }
    return;
  }

  const removed = loadRemoved();
  const removedAt = new Date().toISOString();
  const deadIds = new Set(dead.map((d) => d.id));
  const kept: GrantRecord[] = [];

  for (const grant of grants) {
    if (deadIds.has(grant.id)) {
      const probe = byId.get(grant.id)!;
      removed[grant.id] = {
        removedAt,
        reason: 'url-unreachable',
        url: grant.url,
        name: grant.name,
        grant: { ...grant },
      };
      continue;
    }
    kept.push(grant);
  }

  fs.writeFileSync(GRANTS_PATH, `${JSON.stringify(kept, null, 2)}\n`);
  fs.writeFileSync(REMOVED_PATH, `${JSON.stringify(removed, null, 2)}\n`);
  console.log(`\nPublished grants: ${kept.length} (removed ${deadIds.size} → content/grants/removed-grants.json)`);
  console.log('Run: npx tsx scripts/generate-slug-types.ts');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});