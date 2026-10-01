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

function addPublishedPreviewImages(live: Set<string>): void {
  const variantSources = new Map<string, string>();
  const variantsFile = path.join(ROOT, 'content/responsive-images.json');
  if (fs.existsSync(variantsFile)) {
    const variants = JSON.parse(fs.readFileSync(variantsFile, 'utf8')) as Record<string, { files: string[] }>;
    for (const [source, image] of Object.entries(variants)) for (const file of image.files) variantSources.set(file, source);
  }
  const add = (value: string) => {
    const url = new URL(value, 'https://hashtagweb3.com');
    if (!['hashtagweb3.com', 'www.hashtagweb3.com'].includes(url.hostname)) return;
    const base = basenameFromEventPath(variantSources.get(url.pathname) || decodeURIComponent(url.pathname));
    if (base) live.add(base);
  };
  for (const relative of ['content/image-redirects.json', 'content/legacy-image-paths.json']) {
    const file = path.join(ROOT, relative);
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string> | string[];
    for (const value of Object.values(data)) add(value);
  }
  function walk(directory: string): void {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.endsWith('.html')) {
        const image = fs.readFileSync(file, 'utf8').match(/<meta property="og:image" content="([^"]+)"/)?.[1];
        if (image) add(image);
      }
    }
  }
  walk(path.join(ROOT, 'public/preview'));
}

/** Basenames under `public/events/` still needed for the live catalog + overrides. */
export async function collectLiveEventCoverBasenames(): Promise<Set<string>> {
  const live = new Set<string>(EXTRA_KEEP_BASENAMES);
  addOverrideBasenames(live);
  addPublishedPreviewImages(live);

  const events = await buildEventsListing();
  for (const event of events) {
    const cover = event.coverImage;
    if (typeof cover !== 'string') continue;
    const base = basenameFromEventPath(cover);
    if (base) live.add(base);
  }

  return live;
}
