import fs from 'node:fs';
import path from 'node:path';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { canonicalLumaUrl } from './luma-source-record';

const ACTOR = 'solidcode~luma-scraper';
const CACHE = path.join(process.cwd(), '.cache/event-verification');
const token = process.env.APIFY_TOKEN;
const args = process.argv.slice(2);
const option = (name: string) => args.find((arg) => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=');

async function api(endpoint: string, init: RequestInit = {}) {
  if (!token) throw new Error('Set APIFY_TOKEN in the environment. Never put it in source files.');
  const response = await fetch(`https://api.apify.com/v2/${endpoint}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = String(body?.error?.message || '').replaceAll(token, '[redacted]');
    throw new Error(`Apify returned HTTP ${response.status}: ${detail}`);
  }
  return response.json();
}

async function main() {
  fs.mkdirSync(CACHE, { recursive: true });
  const abortId = option('abort');
  if (abortId) {
    if (!/^[\w-]+$/.test(abortId)) throw new Error('Invalid run ID');
    const { data } = await api(`actor-runs/${abortId}/abort`, { method: 'POST' });
    console.log(JSON.stringify({ id: data.id, status: data.status }));
    return;
  }
  const runId = option('collect');
  if (runId) {
    if (!/^[\w-]+$/.test(runId)) throw new Error('Invalid run ID');
    const { data: run } = await api(`actor-runs/${runId}`);
    console.log(JSON.stringify({ id: run.id, status: run.status, datasetId: run.defaultDatasetId, usageUsd: run.usageTotalUsd }));
    fs.writeFileSync(path.join(CACHE, `${runId}-run.json`), JSON.stringify(run, null, 2));
    if (!['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.status) && !args.includes('--partial')) return;
    const items: unknown[] = [];
    for (let offset = 0; ; offset += 1000) {
      const page = await api(`datasets/${run.defaultDatasetId}/items?format=json&clean=true&offset=${offset}&limit=1000`) as unknown[];
      items.push(...page);
      if (page.length < 1000) break;
    }
    fs.writeFileSync(path.join(CACHE, `${runId}-items.json`), JSON.stringify(items, null, 2));
    console.log(`Saved ${items.length} complete source records to .cache/event-verification/${runId}-items.json`);
    return;
  }

  const byUrl = new Map<string, { url: string; name: string; ids: string[] }>();
  for (const { events } of EVENT_SOURCES) {
    for (const event of events) {
      const url = [event.registrationUrl, event.url, event.website].map(canonicalLumaUrl).find(Boolean);
      if (!url) continue;
      const existing = byUrl.get(url);
      if (existing) existing.ids.push(event.id);
      else byUrl.set(url, { url, name: event.name, ids: [event.id] });
    }
  }
  const limit = Number(option('limit') || byUrl.size);
  if (!Number.isInteger(limit) || limit < 1) throw new Error('limit must be a positive integer');
  const targets = [...byUrl.values()].slice(0, limit);
  const input = {
    lumaUrls: targets.map(({ url }) => url),
    scrapeEventDetails: true,
    includeFeaturedGuests: true,
    maxEventsPerUrl: 1,
    maxResults: targets.length,
  };
  console.log(`${targets.length} exact Luma URLs via ${ACTOR}.`);
  if (!args.includes('--start')) {
    console.log('Pass --start to run the actor, then --collect=RUN_ID to download all returned fields.');
    return;
  }
  const { data: run } = await api(`acts/${ACTOR}/runs?memory=1024&timeout=3600`, { method: 'POST', body: JSON.stringify(input) });
  fs.writeFileSync(path.join(CACHE, `${run.id}-targets.json`), JSON.stringify({ actor: ACTOR, targets, input }, null, 2));
  console.log(JSON.stringify({ id: run.id, status: run.status, datasetId: run.defaultDatasetId }));
}

main().catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
