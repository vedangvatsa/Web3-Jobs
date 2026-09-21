import * as fs from 'fs';
import * as path from 'path';
import { buildEventsListing } from '../../src/lib/events-listing-build';

const ROOT = process.cwd();
const OVERRIDES_PATH = path.join(ROOT, 'content/event-image-overrides.json');

/** Static covers referenced outside the live listing (curated / marketing). */
const EXTRA_KEEP_BASENAMES = new Set(['ethlisbon.gif']);

function basenameFromEventPath(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith('/events/')) return null;
  return path.basename(trimmed.split(/[?#]/, 1)[0]);
}

function addOverrideBasenames(live: Set<string>): void {
  try {
    const overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8')) as Record<string, string>;
    for (const value of Object.values(overrides)) {
      if (typeof value !== 'string') continue;
      const base = basenameFromEventPath(value);
      if (base) live.add(base);
    }
  } catch {
    // optional file
  }
}

/** Basenames under `public/events/` still needed for the live catalog + overrides. */
export async function collectLiveEventCoverBasenames(): Promise<Set<string>> {
  const live = new Set<string>(EXTRA_KEEP_BASENAMES);
  addOverrideBasenames(live);

  const events = await buildEventsListing();
  for (const event of events) {
    const cover = event.coverImage;
    if (typeof cover !== 'string') continue;
    const base = basenameFromEventPath(cover);
    if (base) live.add(base);
  }

  return live;
}
