/**
 * One-off: self-host all upcoming event covers under public/events/.
 * Run: npx tsx scripts/localize-event-covers-once.ts
 */
import fs from 'fs';
import path from 'path';
import type { Web3Event } from '../src/types';
import { buildEventsListing } from '../src/lib/events-listing-build';
import { enrichLocalCovers, downloadCover } from './lib/event-image-utils.mjs';

const ROOT = process.cwd();
const EVENT_FILES = [
  path.join(ROOT, 'content/events/sources/curated-events.json'),
  path.join(ROOT, 'content/events/sources/events-cache.json'),
  path.join(ROOT, 'content/events/sources/ibw-side-events.json'),
  path.join(ROOT, 'content/events/sources/kbw-luma-events.json'),
  path.join(ROOT, 'content/events/sources/india-luma-events.json'),
  path.join(ROOT, 'content/events/sources/luma-crypto-events.json'),
];
const OVERRIDES_PATH = path.join(ROOT, 'content/event-image-overrides.json');
const EVENTS_DIR = path.join(ROOT, 'public/events');

function countHttpInListing(events: Web3Event[]): number {
  return events.filter((e) => (e.coverImage || '').trim().startsWith('http')).length;
}

function patchSourceJsonById(idToCover: Map<string, string>): void {
  for (const filePath of EVENT_FILES) {
    if (!fs.existsSync(filePath)) continue;
    const arr = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Web3Event[];
    if (!Array.isArray(arr)) continue;
    let changed = false;
    for (const event of arr) {
      const local = event.id ? idToCover.get(event.id) : undefined;
      if (local && (event.coverImage || '').startsWith('http')) {
        event.coverImage = local;
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(filePath, `${JSON.stringify(arr, null, 2)}\n`, 'utf8');
      console.log(`  patched ${path.relative(ROOT, filePath)}`);
    }
  }
}

async function main(): Promise<void> {
  const listing = await buildEventsListing();
  const beforeListing = countHttpInListing(listing);
  console.log(`Upcoming events with http cover (listing): ${beforeListing} / ${listing.length}`);

  const remoteListing = listing.filter((e) => (e.coverImage || '').trim().startsWith('http'));
  let { okCount, rateLimited, failed } = await enrichLocalCovers(remoteListing, {
    eventsDir: EVENTS_DIR,
    concurrency: 6,
    log: (msg) => console.log(msg),
  });
  console.log(`Listing enrich: ok=${okCount} deferred=${rateLimited} failed=${failed}`);

  const overrides: Record<string, string> = fs.existsSync(OVERRIDES_PATH)
    ? (JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8')) as Record<string, string>)
    : {};

  const idToCover = new Map<string, string>();
  for (const e of listing) {
    if (e.id && e.coverImage?.startsWith('/')) idToCover.set(e.id, e.coverImage);
  }

  const overrideHttp = Object.entries(overrides).filter(([, url]) => url.startsWith('http'));
  console.log(`Override entries still http: ${overrideHttp.length}`);
  for (const [id, url] of overrideHttp) {
    const stub: Web3Event = {
      id,
      name: id,
      description: '',
      startDate: '2099-01-01T00:00:00.000Z',
      endDate: '2099-01-01T01:00:00.000Z',
      city: '',
      country: '',
      location: '',
      url: '',
      coverImage: url,
      source: 'override',
    };
    const local = await downloadCover(stub, EVENTS_DIR, () => {});
    if (typeof local === 'string' && local.startsWith('/')) {
      overrides[id] = local;
      idToCover.set(id, local);
      okCount += 1;
    } else if (local === 'rate_limited') rateLimited += 1;
    else failed += 1;
  }

  for (const [id, local] of idToCover) {
    if (overrides[id]?.startsWith('http') || !overrides[id]) {
      overrides[id] = local;
    }
  }

  fs.writeFileSync(OVERRIDES_PATH, `${JSON.stringify(overrides, null, 2)}\n`, 'utf8');
  console.log('Wrote event-image-overrides.json');

  patchSourceJsonById(idToCover);

  const listingAfter = await buildEventsListing();
  const afterListing = countHttpInListing(listingAfter);
  console.log(`Upcoming events with http cover (after): ${afterListing} / ${listingAfter.length}`);
  if (afterListing > 0) {
    listingAfter
      .filter((e) => e.coverImage?.startsWith('http'))
      .slice(0, 10)
      .forEach((e) => console.log(`  remaining: ${e.slug} | ${e.coverImage?.slice(0, 72)}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
