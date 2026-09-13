import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as cheerio from 'cheerio';
import { hasDetailedStreetAddress } from '../src/lib/event-address';

type JsonObject = Record<string, unknown>;

type LocalEvent = JsonObject & {
  name?: string;
  description?: string;
  startDate?: string;
  location?: string;
  url?: string;
  website?: string | null;
  registrationUrl?: string;
};

type EventFile = {
  path: string;
  events: LocalEvent[];
  indent: string | number;
  hasTrailingNewline: boolean;
  changed: boolean;
};

type SourceVenue = {
  name: string;
  streetAddress: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
};

type SourceEvent = {
  name: string;
  startDate?: string;
  venue?: SourceVenue;
  isPhysical: boolean;
};

type FetchResult =
  | { kind: 'success'; events: SourceEvent[] }
  | { kind: 'skip'; reason: string }
  | { kind: 'error'; reason: string };

type CacheEntry = {
  result: FetchResult;
  updatedAt: string;
};

type CacheFile = {
  version: 1;
  entries: Record<string, CacheEntry>;
};

type RunOptions = {
  limit?: number;
  retryFailed: boolean;
  help: boolean;
};

type FetchSettings = {
  maxRetries: number;
};

type Candidate = {
  file: EventFile;
  event: LocalEvent;
  url: string;
};

const EVENT_FILES = [
  'content/curated-events.json',
  'content/kbw-luma-events.json',
  'content/ibw-side-events.json',
  'content/india-luma-events.json',
  'content/events-cache.json',
];
const URL_FIELDS = ['url', 'website', 'registrationUrl'] as const;
const TIMEOUT_MS = 10_000;
const DEFAULT_CONCURRENCY = 1;
const MAX_CONCURRENCY = 2;
const DEFAULT_MAX_RETRIES = 3;
const MAX_RETRIES = 5;
const BACKOFF_BASE_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;
const MAX_LIMIT = 20;
const CACHE_RELATIVE_PATH = '.cache/luma-venue-enrichment.json';
const USER_AGENT = 'HashtagWeb3 Luma Venue Verifier/1.0 (+https://hashtagweb3.com)';
const DISALLOWED_EVENT_TEXT = /\b(?:online|virtual|remote|webinar|livestream|live[- ]stream|zoom|discord|tba|tbd|to be (?:announced|determined)|unknown|coming soon|invite[- ]only|invitation[- ]only|members?[- ]only|accepted guests? only|details upon confirmation|location upon approval|approval[- ]based|application[- ]only|closed event|private)\b/i;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sourceText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeLumaUrl(value: string): string | null {
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    if (!['luma.com', 'lu.ma'].includes(hostname) || !['http:', 'https:'].includes(parsed.protocol)) return null;
    if (!parsed.pathname || parsed.pathname === '/') return null;
    // Both public hostnames serve the same event paths; remove tracking tokens before deduping requests.
    return `https://luma.com${parsed.pathname.replace(/\/+$/, '')}`;
  } catch {
    return null;
  }
}

function normalizedName(value: string): string[] {
  const ignored = new Set(['a', 'an', 'and', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'the', 'to', 'with']);
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b20\d{2}\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((token) => token && !ignored.has(token));
}

function namesSubstantiallyMatch(localName: string, sourceName: string): boolean {
  const local = normalizedName(localName);
  const source = normalizedName(sourceName);
  if (!local.length || !source.length) return false;

  const localCompact = local.join('');
  const sourceCompact = source.join('');
  if (localCompact === sourceCompact) return true;
  if (Math.min(localCompact.length, sourceCompact.length) >= 8
    && (localCompact.includes(sourceCompact) || sourceCompact.includes(localCompact))) return true;

  const sourceTokens = new Set(source);
  const shared = local.filter((token) => sourceTokens.has(token)).length;
  return shared >= 2 && shared / Math.min(local.length, source.length) >= 0.7;
}

function isCompatibleDate(localDate: string | undefined, sourceDate: string | undefined): boolean {
  if (!localDate || !sourceDate || !/^\d{4}-\d{2}-\d{2}/.test(sourceDate) || Number.isNaN(Date.parse(sourceDate))) return false;
  return localDate.slice(0, 10) === sourceDate.slice(0, 10);
}

function hasType(value: unknown, type: string): boolean {
  return Array.isArray(value) ? value.some((item) => item === type) : value === type;
}

function eventObjects(value: unknown, result: JsonObject[] = []): JsonObject[] {
  if (Array.isArray(value)) {
    value.forEach((item) => eventObjects(item, result));
  } else if (isObject(value)) {
    if (hasType(value['@type'], 'Event')) result.push(value);
    if (Array.isArray(value['@graph'])) eventObjects(value['@graph'], result);
  }
  return result;
}

function sourceEvent(value: JsonObject): SourceEvent | null {
  const name = sourceText(value.name);
  const location = value.location;
  const attendanceMode = sourceText(value.eventAttendanceMode);
  if (!name || !isObject(location)) return null;

  const address = location.address;
  const venueName = sourceText(location.name);
  const streetAddress = isObject(address) ? sourceText(address.streetAddress) : '';
  const sourceLocationText = [
    name,
    sourceText(value.description),
    venueName,
    streetAddress,
    isObject(address) ? sourceText(address.addressLocality) : '',
    isObject(address) ? sourceText(address.addressRegion) : '',
    isObject(address) ? sourceText(address.addressCountry) : '',
    attendanceMode,
  ].join(' ');
  const isPhysical = Boolean(venueName && hasDetailedStreetAddress(streetAddress))
    && !DISALLOWED_EVENT_TEXT.test(sourceLocationText)
    && !/OnlineEventAttendanceMode/i.test(attendanceMode);

  return {
    name,
    ...(sourceText(value.startDate) ? { startDate: sourceText(value.startDate) } : {}),
    ...(isPhysical ? {
      venue: {
        name: venueName,
        streetAddress,
        ...(isObject(address) && sourceText(address.addressLocality) ? { addressLocality: sourceText(address.addressLocality) } : {}),
        ...(isObject(address) && sourceText(address.addressRegion) ? { addressRegion: sourceText(address.addressRegion) } : {}),
        ...(isObject(address) && sourceText(address.postalCode) ? { postalCode: sourceText(address.postalCode) } : {}),
        ...(isObject(address) && sourceText(address.addressCountry) ? { addressCountry: sourceText(address.addressCountry) } : {}),
      },
    } : {}),
    isPhysical,
  };
}

function parseSourceEvents(html: string): SourceEvent[] {
  const $ = cheerio.load(html);
  const events: SourceEvent[] = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const json = $(element).text().trim();
    if (!json) return;
    try {
      eventObjects(JSON.parse(json)).forEach((event) => {
        const parsed = sourceEvent(event);
        if (parsed) events.push(parsed);
      });
    } catch {
      // A malformed publisher script must not cause extraction from page text.
    }
  });

  return events;
}

function isSourceVenue(value: unknown): value is SourceVenue {
  return isObject(value)
    && typeof value.name === 'string'
    && typeof value.streetAddress === 'string'
    && hasDetailedStreetAddress(value.streetAddress)
    && ['addressLocality', 'addressRegion', 'postalCode', 'addressCountry'].every((field) => value[field] === undefined || typeof value[field] === 'string');
}

function isSourceEvent(value: unknown): value is SourceEvent {
  return isObject(value)
    && typeof value.name === 'string'
    && typeof value.isPhysical === 'boolean'
    && (value.startDate === undefined || typeof value.startDate === 'string')
    && (value.venue === undefined || isSourceVenue(value.venue))
    && (!value.isPhysical || isSourceVenue(value.venue));
}

function isFetchResult(value: unknown): value is FetchResult {
  if (!isObject(value) || typeof value.kind !== 'string') return false;
  if (value.kind === 'success') return Array.isArray(value.events) && value.events.every(isSourceEvent);
  return (value.kind === 'skip' || value.kind === 'error') && typeof value.reason === 'string';
}

export class PersistentCache {
  private readonly entries = new Map<string, CacheEntry>();

  constructor(private readonly filePath: string) {
    this.load();
  }

  get(url: string): CacheEntry | undefined {
    return this.entries.get(url);
  }

  set(url: string, result: FetchResult): void {
    this.entries.set(url, { result, updatedAt: new Date().toISOString() });
    this.save();
  }

  private load(): void {
    if (!fs.existsSync(this.filePath)) return;
    try {
      const parsed: unknown = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      if (!isObject(parsed) || parsed.version !== 1 || !isObject(parsed.entries)) throw new Error('invalid cache shape');
      for (const [url, value] of Object.entries(parsed.entries)) {
        if (!normalizeLumaUrl(url) || !isObject(value) || typeof value.updatedAt !== 'string' || !isFetchResult(value.result)) continue;
        this.entries.set(url, { result: value.result, updatedAt: value.updatedAt });
      }
    } catch {
      console.warn(`Ignoring unreadable Luma cache: ${this.filePath}`);
    }
  }

  private save(): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const data: CacheFile = { version: 1, entries: Object.fromEntries(this.entries) };
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    fs.writeFileSync(temporaryPath, `${JSON.stringify(data, null, 2)}\n`);
    fs.renameSync(temporaryPath, this.filePath);
  }
}

export function isTransientStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

export function retryAfterMs(value: string | null, now = Date.now()): number | null {
  if (!value) return null;
  if (/^\d+(?:\.\d+)?$/.test(value.trim())) return Math.max(0, Math.ceil(Number(value) * 1_000));
  const retryAt = Date.parse(value);
  return Number.isNaN(retryAt) ? null : Math.max(0, retryAt - now);
}

export function backoffDelayMs(attempt: number, retryAfter: number | null, random = Math.random()): number {
  const maximum = Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * (2 ** attempt));
  const jittered = Math.floor(maximum * (0.5 + Math.min(Math.max(random, 0), 1) * 0.5));
  return Math.max(retryAfter ?? 0, jittered);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSource(url: string, settings: FetchSettings, cache: PersistentCache): Promise<FetchResult> {
  for (let attempt = 0; ; attempt++) {
    let result: FetchResult;
    let retryAfter: number | null = null;
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      retryAfter = retryAfterMs(response.headers.get('retry-after'));
      if (!response.ok) {
        result = isTransientStatus(response.status)
          ? { kind: 'error', reason: `http-${response.status}` }
          : { kind: 'skip', reason: `http-${response.status}` };
      } else if (!response.headers.get('content-type')?.includes('text/html')) {
        result = { kind: 'skip', reason: 'non-html-response' };
      } else {
        const events = parseSourceEvents(await response.text());
        result = events.length ? { kind: 'success', events } : { kind: 'skip', reason: 'no-event-jsonld' };
      }
    } catch (error) {
      result = { kind: 'error', reason: error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'fetch-failed' };
    }

    // Save every response, including retryable failures, so an interruption can resume safely.
    cache.set(url, result);
    if (result.kind !== 'error' || attempt >= settings.maxRetries) return result;

    const delay = backoffDelayMs(attempt, retryAfter);
    console.warn(`Retrying ${url} after ${delay}ms (${attempt + 1}/${settings.maxRetries}) due to ${result.reason}.`);
    await sleep(delay);
  }
}

async function fetchAll(urls: string[], concurrency: number, settings: FetchSettings, cache: PersistentCache): Promise<Map<string, FetchResult>> {
  const results = new Map<string, FetchResult>();
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, async () => {
    while (next < urls.length) {
      const url = urls[next++];
      results.set(url, await fetchSource(url, settings, cache));
    }
  }));
  return results;
}

function readEventFile(filePath: string): EventFile {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every(isObject)) throw new Error(`${filePath} must contain a JSON array of event objects.`);
  const indentation = raw.match(/\n([ \t]+)\{/)?.[1] ?? '  ';
  return {
    path: filePath,
    events: data,
    indent: indentation,
    hasTrailingNewline: raw.endsWith('\n'),
    changed: false,
  };
}

function localSkipReason(event: LocalEvent): string | null {
  const text = [sourceText(event.name), sourceText(event.description), sourceText(event.location)].join(' ');
  if (DISALLOWED_EVENT_TEXT.test(text)) return 'local-online-private-or-tbd';
  if (!sourceText(event.name) || !sourceText(event.startDate)) return 'local-name-or-date-missing';
  return null;
}

function sourceSkipReason(event: LocalEvent, sourceEvents: SourceEvent[]): { reason: string; venue?: SourceVenue } {
  const nameMatches = sourceEvents.filter((source) => namesSubstantiallyMatch(sourceText(event.name), source.name));
  if (!nameMatches.length) return { reason: 'name-mismatch' };

  const dateMatches = nameMatches.filter((source) => isCompatibleDate(event.startDate, source.startDate));
  if (!dateMatches.length) return { reason: 'date-mismatch' };

  const verified = dateMatches.find((source) => source.isPhysical && source.venue);
  return verified?.venue ? { reason: 'verified', venue: verified.venue } : { reason: 'private-online-tbd-or-no-address' };
}

function applyVenue(event: LocalEvent, venue: SourceVenue): boolean {
  if (!venue.name || !hasDetailedStreetAddress(venue.streetAddress)) return false;
  const values: Record<keyof SourceVenue, string | undefined> = {
    name: venue.name,
    streetAddress: venue.streetAddress,
    addressLocality: venue.addressLocality,
    addressRegion: venue.addressRegion,
    postalCode: venue.postalCode,
    addressCountry: venue.addressCountry,
  };
  const fields: Array<[keyof SourceVenue, string]> = [
    ['name', 'venueName'],
    ['streetAddress', 'streetAddress'],
    ['addressLocality', 'addressLocality'],
    ['addressRegion', 'addressRegion'],
    ['postalCode', 'postalCode'],
    ['addressCountry', 'addressCountry'],
  ];
  let changed = false;
  for (const [sourceField, localField] of fields) {
    const value = values[sourceField];
    if (value && event[localField] !== value) {
      event[localField] = value;
      changed = true;
    }
  }
  return changed;
}

function configuredInteger(name: string, fallback: number, maximum: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? Math.min(value, maximum) : fallback;
}

export function parseRunOptions(args: string[]): RunOptions {
  let limit: number | undefined;
  let retryFailed = false;
  let help = false;
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === '--retry-failed') {
      retryFailed = true;
    } else if (argument === '--help' || argument === '-h') {
      help = true;
    } else if (argument === '--limit') {
      const value = Number(args[++index]);
      if (!Number.isInteger(value) || value < 1 || value > MAX_LIMIT) {
        throw new Error(`--limit must be an integer from 1 to ${MAX_LIMIT}.`);
      }
      limit = value;
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }
  return { limit, retryFailed, help };
}

async function main(): Promise<void> {
  const options = parseRunOptions(process.argv.slice(2));
  if (options.help) {
    console.log('Usage: npx tsx scripts/enrich-luma-venues.ts [--limit 1-20] [--retry-failed]');
    return;
  }
  const root = process.cwd();
  const concurrency = configuredInteger('LUMA_ENRICH_CONCURRENCY', DEFAULT_CONCURRENCY, MAX_CONCURRENCY);
  const maxRetries = configuredInteger('LUMA_ENRICH_MAX_RETRIES', DEFAULT_MAX_RETRIES, MAX_RETRIES);
  const cache = new PersistentCache(path.join(root, CACHE_RELATIVE_PATH));
  const files = EVENT_FILES.map((relativePath) => readEventFile(path.join(root, relativePath)));
  const candidatesByUrl = new Map<string, Candidate[]>();
  const skipReasons = new Map<string, number>();

  for (const file of files) {
    for (const event of file.events) {
      const localReason = localSkipReason(event);
      const urls = new Set(URL_FIELDS
        .map((field) => sourceText(event[field]))
        .map(normalizeLumaUrl)
        .filter((url): url is string => Boolean(url)));
      if (!urls.size) continue;
      if (localReason) {
        skipReasons.set(localReason, (skipReasons.get(localReason) ?? 0) + 1);
        continue;
      }
      for (const url of urls) {
        const candidates = candidatesByUrl.get(url) ?? [];
        candidates.push({ file, event, url });
        candidatesByUrl.set(url, candidates);
      }
    }
  }

  const urls = [...candidatesByUrl.keys()];
  console.log(`Scanning ${urls.length} unique public Luma URLs across ${files.reduce((total, file) => total + file.events.length, 0)} stored events.`);
  const fetchResults = new Map<string, FetchResult>();
  const pendingUrls: string[] = [];
  for (const url of urls) {
    const cached = cache.get(url)?.result;
    if (!cached || (cached.kind === 'error' && options.retryFailed)) {
      pendingUrls.push(url);
    } else {
      fetchResults.set(url, cached);
    }
  }
  const urlsToFetch = options.limit ? pendingUrls.slice(0, options.limit) : pendingUrls;
  const fetched = await fetchAll(urlsToFetch, concurrency, { maxRetries }, cache);
  for (const [url, result] of fetched) fetchResults.set(url, result);
  console.log(`Requests: ${urlsToFetch.length} (concurrency ${concurrency}, retries per URL ${maxRetries}); cached terminal results: ${urls.length - pendingUrls.length}; deferred: ${pendingUrls.length - urlsToFetch.length}.`);
  const errors = new Map<string, number>();
  let updated = 0;

  for (const [url, candidates] of candidatesByUrl) {
    const result = fetchResults.get(url);
    if (!result) continue;
    if (result.kind === 'error') {
      errors.set(result.reason, (errors.get(result.reason) ?? 0) + candidates.length);
      continue;
    }
    if (result.kind === 'skip') {
      skipReasons.set(result.reason, (skipReasons.get(result.reason) ?? 0) + candidates.length);
      continue;
    }
    for (const candidate of candidates) {
      const match = sourceSkipReason(candidate.event, result.events);
      if (!match.venue) {
        skipReasons.set(match.reason, (skipReasons.get(match.reason) ?? 0) + 1);
        continue;
      }
      if (applyVenue(candidate.event, match.venue)) {
        candidate.file.changed = true;
        updated++;
      }
    }
  }

  const changedFiles = files.filter((file) => file.changed);
  for (const file of changedFiles) {
    const serialized = JSON.stringify(file.events, null, file.indent);
    fs.writeFileSync(file.path, `${serialized}${file.hasTrailingNewline ? '\n' : ''}`);
  }

  const skipped = [...skipReasons.values()].reduce((total, count) => total + count, 0);
  const failed = [...errors.values()].reduce((total, count) => total + count, 0);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}${skipReasons.size ? ` (${[...skipReasons].map(([reason, count]) => `${reason}: ${count}`).join(', ')})` : ''}`);
  console.log(`Errors: ${failed}${errors.size ? ` (${[...errors].map(([reason, count]) => `${reason}: ${count}`).join(', ')})` : ''}`);
  console.log(`Changed files: ${changedFiles.length ? changedFiles.map((file) => path.relative(root, file.path)).join(', ') : 'none'}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error('Luma venue enrichment failed:', error);
    process.exitCode = 1;
  });
}
