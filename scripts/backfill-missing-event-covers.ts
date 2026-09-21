/**
 * Download covers for listing paths under /events/ that are missing on disk.
 * Uses http coverImage from event source JSON or event-image-overrides when available.
 */
import * as fs from 'fs';
import * as path from 'path';
import type { Web3Event } from '../src/types';
import { buildEventsListing } from '../src/lib/events-listing-build';
import { collectLiveEventCoverBasenames } from './lib/event-cover-refs';
import { canonicalLumaUrl, downloadCover, enrichLocalCovers, UA } from './lib/event-image-utils.mjs';

const ROOT = process.cwd();
const EVENTS_DIR = path.join(ROOT, 'public', 'events');
const SOURCE_FILES = [
  'content/events/sources/curated-events.json',
  'content/events/sources/events-cache.json',
  'content/events/sources/ibw-side-events.json',
  'content/events/sources/kbw-luma-events.json',
  'content/events/sources/india-luma-events.json',
  'content/events/sources/luma-crypto-events.json',
];
const OVERRIDES_PATH = path.join(ROOT, 'content/event-image-overrides.json');

function loadSourcesById(): Map<string, Web3Event> {
  const byId = new Map<string, Web3Event>();
  for (const rel of SOURCE_FILES) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const arr = JSON.parse(fs.readFileSync(abs, 'utf8')) as Web3Event[];
    if (!Array.isArray(arr)) continue;
    for (const event of arr) {
      if (event.id) byId.set(event.id, event);
    }
  }
  return byId;
}

function remoteCoverForEvent(
  event: Web3Event,
  byId: Map<string, Web3Event>,
  overrides: Record<string, string>,
): string | null {
  const fromOverride = overrides[event.id];
  if (typeof fromOverride === 'string' && fromOverride.startsWith('http')) return fromOverride;

  const source = byId.get(event.id);
  const fromSource = source?.coverImage;
  if (typeof fromSource === 'string' && fromSource.startsWith('http')) return fromSource;

  return null;
}

async function downloadToBasename(remoteUrl: string, basename: string): Promise<boolean> {
  const dest = path.join(EVENTS_DIR, basename);
  if (fs.existsSync(dest)) return true;

  const url = canonicalLumaUrl(remoteUrl);
  for (let attempt = 0; attempt < 4; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'image/avif,image/webp,image/png,image/jpeg,*/*' },
        signal: controller.signal,
        redirect: 'follow',
      });
    } catch {
      clearTimeout(timeout);
      return false;
    }
    clearTimeout(timeout);
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 8000) return false;
    fs.mkdirSync(EVENTS_DIR, { recursive: true });
    fs.writeFileSync(dest, buf);
    return true;
  }
  return false;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const listing = await buildEventsListing();
  const httpInListing = listing.filter((e) => (e.coverImage || '').trim().startsWith('http'));
  if (httpInListing.length > 0 && !dryRun) {
    const { okCount, rateLimited, failed } = await enrichLocalCovers(httpInListing, {
      eventsDir: EVENTS_DIR,
      concurrency: 4,
      log: (msg) => console.log(msg),
    });
    console.log(
      `[backfill-missing-event-covers] http listing covers: ok=${okCount} rate_limited=${rateLimited} failed=${failed}`,
    );
  }

  const liveBasenames = await collectLiveEventCoverBasenames();
  const byId = loadSourcesById();
  const overrides: Record<string, string> = fs.existsSync(OVERRIDES_PATH)
    ? (JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8')) as Record<string, string>)
    : {};

  const missingEvents = listing.filter((e) => {
    const cover = e.coverImage?.trim();
    if (!cover?.startsWith('/events/')) return false;
    const base = path.basename(cover.split(/[?#]/, 1)[0]);
    return liveBasenames.has(base) && !fs.existsSync(path.join(EVENTS_DIR, base));
  });

  console.log(`[backfill-missing-event-covers] ${missingEvents.length} listing cover(s) missing on disk`);

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const event of missingEvents) {
    const basename = path.basename(event.coverImage!.split(/[?#]/, 1)[0]);
    const remote = remoteCoverForEvent(event, byId, overrides);
    if (!remote) {
      skipped += 1;
      continue;
    }
    if (dryRun) {
      console.log(`  would fetch ${basename} ← ${remote.slice(0, 72)}…`);
      ok += 1;
      continue;
    }

    const stub: Web3Event = { ...event, coverImage: remote };
    const viaUtil = await downloadCover(stub, EVENTS_DIR, () => {});
    if (viaUtil === 'rate_limited') {
      failed += 1;
      continue;
    }
    if (typeof viaUtil === 'string' && viaUtil.startsWith('/')) {
      const downloaded = path.join(EVENTS_DIR, path.basename(viaUtil));
      const target = path.join(EVENTS_DIR, basename);
      if (downloaded !== target && fs.existsSync(downloaded)) {
        fs.renameSync(downloaded, target);
      }
      ok += 1;
      continue;
    }

    const direct = await downloadToBasename(remote, basename);
    if (direct) ok += 1;
    else failed += 1;
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(
    `[backfill-missing-event-covers] done ok=${ok} no-remote=${skipped} failed=${failed}${dryRun ? ' (dry-run)' : ''}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
