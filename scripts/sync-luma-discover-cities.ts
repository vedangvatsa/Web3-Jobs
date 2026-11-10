/**
 * Import upcoming Web3 events from Luma's per-city /discover/<city>/crypto pages.
 *
 * Every discover page maps to a Luma "place"; the page's server-rendered
 * payload carries the place id, and Luma's public discover API returns the
 * full event list for that place and category.
 *
 * Organiser copy is fetched from each event page so published pages never
 * carry a thin listing stub. Events without usable organiser copy are skipped.
 *
 * Usage: npx tsx scripts/sync-luma-discover-cities.ts [--dry-run] [--refresh]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getEventBaseSlug, type Web3Event } from '../src/lib/events';
import { isThinEventListingDescription } from '../src/lib/event-editorial-facts';
import { hasDetailedStreetAddress } from '../src/lib/event-address';
import { canImportEvent } from './lib/event-retention.mjs';
import eventTombstones from '../content/event-tombstones.json';
import {
  buildLocation,
  extractLumaCity,
  lumaVirtualLocationLabel,
  passesQuality,
  NON_WEB3,
  SPAMMY,
  type LumaApiEvent,
} from './lib/luma-event-filters';
import {
  extractLumaDescriptionsFromHtml,
  normalizeLumaDescriptionForStorage,
  pickBestLumaOrganizerDescription,
} from './luma-page-description';
import { extractOfficialEventDescription } from './official-event-description';
import {
  composeEventDescription,
  countWords,
  MIN_DESCRIPTION_WORDS,
  type EventFacts,
} from './lib/event-description-compose';

const UA = 'HashtagWeb3 Luma Discover Sync/1.0 (+https://hashtagweb3.com)';
const OUTPUT = path.join('content', 'events', 'sources', 'luma-crypto-events.json');
const CACHE_DIR = path.join('.cache', 'luma-discover');
/** api.lu.ma enforces a tight quota; keep calls sparse and back off on 429. */
const API_MIN_GAP_MS = 2500;
const API_MAX_ATTEMPTS = 5;

/** Luma discover place slugs published on the Luma crypto category pages. */
const CITY_SLUGS = [
  'amsterdam', 'atlanta', 'auckland', 'austin', 'bangkok', 'barcelona', 'bengaluru', 'berlin',
  'bogota', 'boston', 'brisbane', 'brussels', 'budapest', 'buenos-aires', 'calgary', 'capetown',
  'chicago', 'cincinnati', 'copenhagen', 'dallas', 'dc', 'denver', 'detroit', 'dubai', 'dublin',
  'edmonton', 'frankfurt', 'geneva', 'hamburg', 'helsinki', 'ho-chi-minh-city', 'hongkong',
  'honolulu', 'houston', 'istanbul', 'jakarta', 'kuala-lumpur', 'la', 'lagos', 'las-vegas',
  'lausanne', 'lisbon', 'london', 'madrid', 'manila', 'medellin', 'melbourne', 'mexico-city',
  'miami', 'milan', 'minneapolis', 'montreal', 'mumbai', 'munich', 'nairobi', 'new-delhi', 'nyc',
  'osaka', 'oslo', 'paris', 'philadelphia', 'phoenix', 'pittsburgh', 'portland', 'prague',
  'raleigh', 'rio', 'rome', 'sacramento', 'salt-lake-city', 'saopaulo', 'sd', 'seattle', 'seoul',
  'sf', 'singapore', 'stockholm', 'sydney', 'taipei', 'tel-aviv', 'tokyo', 'toronto', 'vancouver',
  'vienna', 'warsaw', 'waterloo_ca', 'zurich',
];

const SOURCE_FILES = [
  'content/events/sources/curated-events.json',
  'content/events/sources/verified-discovery.json',
  'content/events/sources/token2049-discovered.json',
  'content/events/sources/kbw-luma-events.json',
  'content/events/sources/ibw-side-events.json',
  'content/events/sources/india-luma-events.json',
  'content/events/sources/luma-crypto-events.json',
  'content/events/sources/luma-batch-events.json',
  'content/events/sources/events-cache.json',
  'content/events-runtime.json',
];

type DiscoverEntry = {
  api_id: string;
  event: LumaApiEvent;
  hosts?: Array<{ name?: string; first_name?: string; last_name?: string }>;
  ticket_info?: { is_free?: boolean; is_sold_out?: boolean; require_approval?: boolean };
  calendar?: { name?: string; slug?: string; website?: string; is_personal?: boolean };
  registration_availability?: string;
};

type LumaPage = {
  url: string;
  html: string;
  title: string;
  sha256: string;
  description: string;
};

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

let lastApiCallAt = 0;

async function apiThrottle(): Promise<void> {
  const wait = lastApiCallAt + API_MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastApiCallAt = Date.now();
}

async function fetchWithRetry(url: string, accept: string, attempts = API_MAX_ATTEMPTS): Promise<Response | null> {
  const isApi = url.startsWith('https://api.lu.ma/');
  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (isApi) await apiThrottle();
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': UA, accept },
        redirect: 'follow',
        signal: AbortSignal.timeout(45_000),
      });
      if (res.ok) return res;
      if (res.status === 404 || res.status === 410) return null;
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after'));
        const backoff = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 45_000 * attempt;
        console.warn(`  rate limited (attempt ${attempt}/${attempts}); waiting ${Math.round(backoff / 1000)}s`);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
    } catch {
      /* retry below */
    }
    await new Promise((r) => setTimeout(r, 800 * attempt));
  }
  return null;
}

async function mapPool<T, R>(items: T[], size: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

function readCache(file: string): unknown | null {
  const full = path.join(CACHE_DIR, file);
  if (!fs.existsSync(full)) return null;
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch {
    return null;
  }
}

function writeCache(file: string, value: unknown): void {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(path.join(CACHE_DIR, file), `${JSON.stringify(value)}\n`);
}

function normUrl(value: string): string {
  const slug = value
    .replace(/^https?:\/\/(www\.)?(lu\.ma|luma\.com)\//i, '')
    .replace(/\/$/, '')
    .split('?')[0];
  return `https://luma.com/${slug.toLowerCase()}`;
}

function normName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function titleFromHtml(html: string): string {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (og?.[1]) return og[1].trim();
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return title?.[1]?.trim() || 'Luma event';
}

async function fetchLumaPage(url: string, refresh: boolean): Promise<LumaPage | null> {
  const cacheFile = `page-${sha256(url).slice(0, 20)}.json`;
  if (!refresh) {
    const cached = readCache(cacheFile) as LumaPage | null;
    if (cached?.html) return cached;
  }
  const res = await fetchWithRetry(url, 'text/html');
  if (!res) return null;
  const html = await res.text();
  const description = pickBestLumaOrganizerDescription(extractLumaDescriptionsFromHtml(html));
  const page: LumaPage = {
    url,
    html,
    title: titleFromHtml(html),
    sha256: sha256(html),
    description: description ? normalizeLumaDescriptionForStorage(description) : '',
  };
  writeCache(cacheFile, page);
  return page;
}

type PlaceInfo = {
  placeApiId: string;
  latitude: number;
  longitude: number;
  categorySlug: string;
  eventCount: number;
};

async function fetchPlaceInfo(citySlug: string, refresh: boolean): Promise<PlaceInfo | null> {
  const cacheFile = `place-${citySlug}.json`;
  if (!refresh) {
    const cached = readCache(cacheFile) as PlaceInfo | null;
    if (cached?.placeApiId && Number.isFinite(cached.latitude)) return cached;
  }
  const url = `https://luma.com/discover/${encodeURIComponent(citySlug)}/crypto`;
  const res = await fetchWithRetry(url, 'text/html');
  if (!res) return null;
  const html = await res.text();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]);
    const pageProps = parsed?.props?.pageProps || {};
    const place = pageProps.place || {};
    const category = pageProps.categoryPage?.category || {};
    const coordinate = place.coordinate || {};
    if (!place.api_id || !Number.isFinite(coordinate.latitude) || !Number.isFinite(coordinate.longitude)) return null;
    const info: PlaceInfo = {
      placeApiId: place.api_id,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      categorySlug: category.slug || 'crypto',
      eventCount: Number(place.event_count || 0),
    };
    writeCache(cacheFile, info);
    return info;
  } catch {
    return null;
  }
}

/**
 * The live discover page queries Luma by the place coordinate plus the
 * category slug, so the imported set matches what the page lists.
 */
async function fetchPlaceEvents(place: PlaceInfo, citySlug: string, refresh: boolean): Promise<DiscoverEntry[]> {
  const cacheFile = `events-${citySlug}.json`;
  if (!refresh) {
    const cached = readCache(cacheFile) as DiscoverEntry[] | null;
    if (cached && cached.length) return cached;
  }
  const entries: DiscoverEntry[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 20; page++) {
    const url = new URL('https://api.lu.ma/discover/get-paginated-events');
    url.searchParams.set('latitude', String(place.latitude));
    url.searchParams.set('longitude', String(place.longitude));
    url.searchParams.set('slug', place.categorySlug);
    url.searchParams.set('pagination_limit', '50');
    if (cursor) url.searchParams.set('pagination_cursor', cursor);
    const res = await fetchWithRetry(url.toString(), 'application/json');
    if (!res) break;
    const data = (await res.json()) as {
      entries?: DiscoverEntry[];
      has_more?: boolean;
      next_cursor?: string | null;
    };
    for (const entry of data.entries || []) if (entry?.event?.api_id) entries.push(entry);
    if (!data.has_more || !data.next_cursor || data.next_cursor === cursor) break;
    cursor = data.next_cursor;
  }
  if (entries.length) writeCache(cacheFile, entries);
  return entries;
}

function loadCatalogIndex() {
  const urls = new Set<string>();
  const eventIds = new Set<string>();
  const slugs = new Set<string>();
  const identities = new Set<string>();
  const rows: Web3Event[] = [];

  for (const file of SOURCE_FILES) {
    if (!fs.existsSync(file)) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as Web3Event[];
      if (!Array.isArray(parsed)) continue;
      for (const event of parsed) {
        rows.push(event);
        if (event.url) urls.add(normUrl(event.url));
        if (event.registrationUrl) urls.add(normUrl(event.registrationUrl));
        if (event.id) eventIds.add(event.id.toLowerCase());
        if (event.sourceVerification?.eventId) eventIds.add(event.sourceVerification.eventId.toLowerCase());
        if (event.slug) slugs.add(event.slug.toLowerCase());
        if (event.name && event.startDate) {
          identities.add(`${normName(event.name)}|${event.startDate.slice(0, 10)}`);
        }
      }
    } catch {
      /* ignore unreadable feed */
    }
  }
  return { urls, eventIds, slugs, identities, rows };
}

function proposeSlug(name: string, eventSlug: string, taken: Set<string>, startDate: string): string {
  const fromName = getEventBaseSlug({ name });
  const fromPath = eventSlug.replace(/[^a-z0-9]/gi, '').slice(0, 6);
  const day = startDate.slice(8, 10).replace(/^0/, '');
  let base = (fromName.length <= 10 ? fromName : fromName.slice(0, 10)).replace(/-+$/, '');
  if (base.length < 3 && fromPath.length >= 4) base = fromPath;
  if (base.length < 3) base = 'lc';

  let slug = base;
  let n = 2;
  while (taken.has(slug)) {
    slug = n === 2 && fromPath.length >= 3 ? `${base}${fromPath.slice(0, 3)}` : `${base}${n}`;
    n++;
  }
  if (taken.has(slug) && slug.length <= 8) slug = `${base}${day}`;
  n = 2;
  while (taken.has(slug)) slug = `${base}${n++}`;
  taken.add(slug);
  return slug;
}

function inferSideEvents(event: LumaApiEvent): string[] | undefined {
  const text = event.name.toLowerCase();
  const start = event.start_at.slice(0, 10);
  const city = extractLumaCity(event.geo_address_info || {}).toLowerCase();
  const side: string[] = [];
  if (/kbw|korea blockchain week/i.test(text) || (city.includes('seoul') && start >= '2026-09-21' && start <= '2026-09-28')) side.push('kbw');
  if (/ibw|india blockchain week/i.test(text) || (city.includes('mumbai') && start >= '2026-11-01' && start <= '2026-11-08')) side.push('ibw');
  if (/devcon|ethglobal mumbai/i.test(text)) side.push('devcon');
  if (/token2049|breakpoint/i.test(text)) {
    if (/singapore/i.test(event.geo_address_info?.country || '')) side.push('token2049');
    if (/abu dhabi|dubai|uae/i.test(`${event.geo_address_info?.country || ''} ${city}`)) side.push('breakpoint');
  }
  return side.length ? [...new Set(side)] : undefined;
}

type DescriptionSource = {
  description: string;
  method: 'event-jsonld' | 'official-section' | 'official-meta';
  pageTitle: string;
  words: number;
};

/**
 * Prefer the organiser's own copy from the Luma page; fall back to the page's
 * structured event description. Anything thin is rejected so published pages
 * never carry a listing stub.
 */
function entryFacts(entry: DiscoverEntry, eventUrl: string): EventFacts {
  const event = entry.event;
  const geo = event.geo_address_info || {};
  const { city, country } = buildLocation(event);
  const hosts = (entry.hosts || [])
    .map((host) => (host.name || `${host.first_name || ''} ${host.last_name || ''}`.trim()).trim())
    .filter(Boolean);
  const calendar = entry.calendar || {};
  const ticket = entry.ticket_info || {};
  return {
    startsAt: event.start_at,
    endsAt: event.end_at,
    timezone: event.timezone,
    online: (event.location_type || '').toLowerCase() === 'online',
    venue: geo.address,
    address: geo.full_address,
    city,
    country,
    hosts,
    organizer: calendar.is_personal === false ? calendar.name : undefined,
    price: ticket.is_free === true ? 'Free' : undefined,
    registration: entry.registration_availability,
    approvalRequired: ticket.require_approval === true,
    sourceUrl: eventUrl,
  };
}

function resolveDescription(page: LumaPage, entry: DiscoverEntry, eventUrl: string): DescriptionSource | null {
  const facts = entryFacts(entry, eventUrl);
  const organizer = (page.description || '').trim();

  if (organizer.length >= 80 && !isThinEventListingDescription(organizer)) {
    const composed = composeEventDescription(organizer, facts);
    if (composed.reachedMinimum) {
      return { description: composed.description, method: 'official-section', pageTitle: page.title, words: composed.words };
    }
  }

  const official = extractOfficialEventDescription(page.html, {
    name: entry.event.name,
    startDate: entry.event.start_at,
  });
  const fallback = (official.result?.description || '').trim();
  if (fallback.length >= 80 && !isThinEventListingDescription(fallback)) {
    const composed = composeEventDescription(fallback, facts);
    if (composed.reachedMinimum) {
      return {
        description: composed.description,
        method: official.result!.method,
        pageTitle: official.result!.pageTitle || page.title,
        words: composed.words,
      };
    }
  }
  return null;
}

function buildRecord(
  entry: DiscoverEntry,
  eventUrl: string,
  page: LumaPage,
  source: DescriptionSource,
  slug: string,
  fetchedAt: string,
): Web3Event {
  const event = entry.event;
  const { city, country, location } = buildLocation(event);
  const geo = event.geo_address_info || {};
  const hidden = geo.mode === 'obfuscated' || event.geo_address_visibility === 'guests-only';
  const online = lumaVirtualLocationLabel(event) !== null;
  const shortAddress = hidden ? '' : (geo.short_address || '').trim();
  const fullAddress = hidden ? '' : (geo.full_address || geo.address || '').trim();
  const hosts = (entry.hosts || [])
    .map((host) => (host.name || `${host.first_name || ''} ${host.last_name || ''}`.trim()).trim())
    .filter(Boolean);
  const calendar = entry.calendar || {};
  const isFree = entry.ticket_info?.is_free === true;
  const latitude = event.coordinate?.latitude;
  const longitude = event.coordinate?.longitude;

  return {
    id: `luma-crypto-${event.api_id.replace(/^evt-/, '')}`,
    slug,
    name: event.name.trim(),
    description: source.description,
    descriptionSource: {
      url: eventUrl,
      fetchedAt,
      method: source.method,
      pageTitle: source.pageTitle,
      sha256: page.sha256,
    },
    sourceVerification: {
      url: eventUrl,
      eventId: event.api_id,
      fetchedAt,
      method: 'luma-page',
    },
    startDate: event.start_at,
    endDate: event.end_at || event.start_at,
    ...(city ? { city } : {}),
    ...(country ? { country } : {}),
    location,
    ...(event.timezone ? { timezone: event.timezone } : {}),
    url: eventUrl,
    registrationUrl: eventUrl,
    coverImage: event.cover_url || event.social_image_url || null,
    source: 'luma-crypto',
    ...(hosts.length ? { hosts } : {}),
    ...(calendar.is_personal === false && calendar.name
      ? {
          organizer: {
            type: 'Organization' as const,
            name: calendar.name,
            url: calendar.website || (calendar.slug ? `https://luma.com/${calendar.slug}` : undefined),
          },
        }
      : {}),
    ...(isFree ? { price: 'Free' } : {}),
    ...(entry.ticket_info?.require_approval ? { approvalRequired: true } : {}),
    ...(entry.registration_availability ? { registrationAvailability: entry.registration_availability } : {}),
    ...(online ? { attendanceMode: 'online' as const } : event.location_type === 'offline' ? { attendanceMode: 'offline' as const } : {}),
    ...(event.visibility ? { visibility: event.visibility as Web3Event['visibility'] } : {}),
    ...(hidden ? { locationHidden: true } : {}),
    ...(!hidden && !online && hasDetailedStreetAddress(shortAddress)
      ? { streetAddress: shortAddress }
      : !hidden && !online && hasDetailedStreetAddress(fullAddress)
        ? { streetAddress: fullAddress }
        : {}),
    ...(!hidden && !online && city ? { addressLocality: city } : {}),
    ...(!hidden && !online && geo.region ? { addressRegion: geo.region } : {}),
    ...(!hidden && !online && (geo.country_code || country) ? { addressCountry: geo.country_code || country } : {}),
    ...(!hidden && !online && geo.postal_code ? { postalCode: geo.postal_code } : {}),
    ...(!hidden && !online && geo.sublocality ? { neighborhood: geo.sublocality } : {}),
    ...(!hidden && !online && city && typeof latitude === 'number' && typeof longitude === 'number'
      ? { coordinates: { latitude, longitude } }
      : {}),
    ...(inferSideEvents(event) ? { sideEventFor: inferSideEvents(event) } : {}),
  } as Web3Event;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const refresh = process.argv.includes('--refresh');
  const citiesArg = process.argv.find((a) => a.startsWith('--cities='));
  const cities = citiesArg
    ? citiesArg.slice('--cities='.length).split(',').map((c) => c.trim()).filter(Boolean)
    : CITY_SLUGS;
  const cutoff = Date.now() - 6 * 60 * 60 * 1000;

  console.log(`Luma discover sync — ${cities.length} city pages${dryRun ? ' (dry run)' : ''}`);

  const cityResults = await mapPool(cities, 2, async (citySlug) => {
    const place = await fetchPlaceInfo(citySlug, refresh);
    if (!place) return { citySlug, place: null, entries: [] as DiscoverEntry[] };
    const entries = await fetchPlaceEvents(place, citySlug, refresh);
    return { citySlug, place, entries };
  });

  const failedCities = cityResults.filter((row) => !row.place).map((row) => row.citySlug);
  console.log(`Cities resolved: ${cityResults.length - failedCities.length}/${cities.length}`);
  if (failedCities.length) console.log(`Cities unavailable: ${failedCities.join(', ')}`);

  const merged = new Map<string, DiscoverEntry>();
  for (const row of cityResults) {
    for (const entry of row.entries) {
      if (!merged.has(entry.event.api_id)) merged.set(entry.event.api_id, entry);
    }
  }
  console.log(`Unique events across pages: ${merged.size}`);

  const index = loadCatalogIndex();
  const candidates: DiscoverEntry[] = [];
  const rejectedByQuality: DiscoverEntry[] = [];
  let skippedPast = 0;
  let skippedQuality = 0;
  let skippedKnown = 0;

  for (const entry of merged.values()) {
    const event = entry.event;
    if (new Date(event.start_at).getTime() < cutoff) {
      skippedPast++;
      continue;
    }
    // Cheap title-only rejects before any page fetch; the full gate runs later
    // with the organiser copy in hand.
    if (SPAMMY.test(event.name || '') || NON_WEB3.test(event.name || '')) {
      skippedQuality++;
      rejectedByQuality.push(entry);
      continue;
    }
    const url = normUrl(event.url?.startsWith('http') ? event.url : `https://luma.com/${event.url}`);
    const id = `luma-crypto-${event.api_id.replace(/^evt-/, '')}`;
    const identity = `${normName(event.name)}|${event.start_at.slice(0, 10)}`;
    if (
      index.urls.has(url) ||
      index.eventIds.has(event.api_id.toLowerCase()) ||
      index.eventIds.has(id.toLowerCase()) ||
      index.identities.has(identity)
    ) {
      skippedKnown++;
      continue;
    }
    if (!canImportEvent({ id, startDate: event.start_at, endDate: event.end_at }, eventTombstones)) continue;
    candidates.push(entry);
  }

  console.log(`Already in catalog: ${skippedKnown} | past: ${skippedPast} | title-level rejects: ${skippedQuality}`);
  console.log(`Candidates to verify: ${candidates.length}`);

  const imported: Web3Event[] = [];
  const skippedNoCopy: Array<{ name: string; url: string; reason: string }> = [];
  const takenSlugs = new Set(index.slugs);

  const prepared = await mapPool(candidates, 4, async (entry) => {
    const eventUrl = normUrl(entry.event.url?.startsWith('http') ? entry.event.url : `https://luma.com/${entry.event.url}`);
    const page = await fetchLumaPage(eventUrl, refresh);
    await new Promise((r) => setTimeout(r, 150));
    return { entry, eventUrl, page };
  });

  const fetchedAt = new Date().toISOString();
  for (const { entry, eventUrl, page } of prepared) {
    const name = entry.event.name.trim();
    if (!page) {
      skippedNoCopy.push({ name, url: eventUrl, reason: 'event page unreachable' });
      continue;
    }
    const source = resolveDescription(page, entry, eventUrl);
    if (!source) {
      skippedNoCopy.push({ name, url: eventUrl, reason: 'description under 100 words' });
      continue;
    }
    if (!passesQuality(entry.event, source.description)) {
      skippedQuality++;
      rejectedByQuality.push(entry);
      continue;
    }
    const slug = proposeSlug(name, entry.event.url || '', takenSlugs, entry.event.start_at);
    imported.push(buildRecord(entry, eventUrl, page, source, slug, fetchedAt));
  }

  console.log(`Rejected after copy check: ${rejectedByQuality.length}`);

  console.log(`Imported with organiser copy: ${imported.length}`);
  console.log(`Skipped (thin/unreachable): ${skippedNoCopy.length}`);
  for (const row of skippedNoCopy.slice(0, 20)) console.log(`  - ${row.name} (${row.reason})`);

  const report = {
    ranAt: fetchedAt,
    cities: cities.length,
    citiesUnavailable: failedCities,
    uniqueEvents: merged.size,
    skippedKnown,
    skippedPast,
    skippedQuality,
    imported: imported.length,
    skippedNoCopy: skippedNoCopy.length,
  };
  writeCache('report.json', report);

  if (dryRun) {
    console.log('\nDry run — sample imports:');
    imported.slice(0, 20).forEach((event) =>
      console.log(`  /${event.slug}  ${event.startDate.slice(0, 10)}  ${event.name.slice(0, 60)}`),
    );
    return;
  }

  const existing = fs.existsSync(OUTPUT)
    ? (JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) as Web3Event[])
    : [];
  const byId = new Map(existing.map((event) => [event.id, event]));
  for (const event of imported) byId.set(event.id, event);

  const mergedEvents = [...byId.values()].sort(
    (a, b) => String(a.startDate).localeCompare(String(b.startDate)) || a.name.localeCompare(b.name),
  );
  fs.writeFileSync(OUTPUT, `${JSON.stringify(mergedEvents, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT} (${mergedEvents.length} records, ${imported.length} new)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
