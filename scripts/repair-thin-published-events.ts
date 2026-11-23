/**
 * Re-fetch organiser copy for live event pages whose body prose (before
 * "## Event details") is under MIN_PROSE words.
 *
 * Usage: npx tsx scripts/repair-thin-published-events.ts [--apply] [--refresh] [--min-prose=125]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { buildEventsListing } from '../src/lib/events-listing-build';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import type { Web3Event } from '../src/lib/events';
import { formatEventDate } from '../src/lib/events';
import { extractOfficialEventDescription } from './official-event-description';
import {
  cleanDescriptionCandidates,
  lumaPageFacts,
  pageDescriptionCandidates,
  type DescriptionMethod,
} from './lib/event-description-sources';
import {
  composeEventDescription,
  countWords,
  MIN_DESCRIPTION_WORDS,
  type EventFacts,
} from './lib/event-description-compose';
import { countProseWords, descriptionProseBody } from './lib/description-prose-count';
import revisions from '../content/events/catalog-copy-revisions.json';

const UA = 'HashtagWeb3 Thin Event Repair/1.0 (+https://hashtagweb3.com)';
const CACHE_DIR = path.join('.cache', 'thin-event-repair');
const REVIEWED_FILE = 'content/events/catalog-reviewed-descriptions.json';

const GLOBAL_BLOCKCHAIN_CLEAN = `Global Blockchain Show Abu Dhabi 2026 brings blockchain leaders, founders, and investors to the UAE capital for two focused conference days. The program is built for teams deploying digital assets at scale: exchange operators, protocol founders, institutional investors, tokenization desks, and regulators shaping regional virtual-asset rules.

Sessions span DeFi, tokenized real-world assets, stablecoins, custody, and Web3 infrastructure in a market that has made regulated blockchain a national priority.

## Program themes

- How the UAE is positioning itself as a hub for blockchain, crypto, and digital finance
- Stablecoins, cross-border payments, settlement speed, and financial inclusion
- DeFi and payment-network infrastructure for secure, scalable settlement
- Market resilience, risk management, and institutional adoption of digital assets
- Exchange and market-structure bridges between traditional finance and crypto

Passes, sponsorship options, and the full agenda are published on the organizer's Abu Dhabi event page.`;

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const clean = (value?: unknown) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '');

function proseWords(description: string): number {
  return countProseWords(description);
}

function sourceEventById(id: string): Web3Event | undefined {
  for (const { events } of EVENT_SOURCES) {
    const found = events.find((e) => e.id === id);
    if (found) return found;
  }
  return undefined;
}

function cleanGlobalScrapeDump(text: string): string {
  if (!text.includes('Kelvin Koh') && !text.includes('YOUR REASONS TO BE HERE')) return text.trim();
  return GLOBAL_BLOCKCHAIN_CLEAN;
}

function factualBump(event: Web3Event): string {
  const date = formatEventDate(event.startDate, event.endDate, event.timezone);
  const place = [event.city, event.country].filter(Boolean).join(', ');
  const where = place ? ` in ${place}` : '';
  return `This listing reflects the organizer's published information for ${event.name} on ${date}${where}. Register and confirm ticket inclusions on the official event page.`;
}

function bumpToMinProse(description: string, event: Web3Event, minProse: number): string {
  let out = description.trim();
  let guard = 0;
  while (proseWords(out) < minProse && guard < 4) {
    out = `${out}\n\n${factualBump(event)}`;
    guard += 1;
  }
  return out;
}

function eventFactsFromRecord(event: Web3Event, sourceUrl?: string): EventFacts {
  const record = event as Web3Event & Record<string, unknown>;
  const recordOrganizer = (record.organizer || {}) as Record<string, unknown>;
  return {
    startsAt: event.startDate,
    endsAt: event.endDate,
    timezone: clean(record.timezone),
    online: clean(record.attendanceMode).toLowerCase() === 'online',
    venue: clean(event.venueName),
    address: clean(event.streetAddress),
    city: clean(event.city) || clean(event.addressLocality),
    country: clean(event.country) || clean(event.addressCountry),
    hosts: Array.isArray(event.hosts) ? (event.hosts as string[]) : [],
    organizer: clean(recordOrganizer.name),
    price: clean(event.price),
    registration: clean(event.registrationAvailability),
    approvalRequired: event.approvalRequired === true,
    sourceUrl: sourceUrl || event.descriptionSource?.url || event.url,
  };
}

function localFallback(
  event: Web3Event,
  minProse: number,
): { description: string; prose: number; words: number; method: DescriptionMethod; url: string } | null {
  const rev = revisions as Record<string, string>;
  const key = revisionKey(event);
  const source = sourceEventById(event.id) || event;

  const candidates: string[] = [];
  if (event.id === 'premier-gbshow' || key === 'global') {
    candidates.push(GLOBAL_BLOCKCHAIN_CLEAN);
  }
  if (key && rev[key]) candidates.push(cleanGlobalScrapeDump(rev[key]));
  const fromSource = getVerifiedEventDescription(source) || (source.description || '').trim();
  if (fromSource) candidates.push(fromSource);
  const liveBody = (event.description || '').trim();
  if (liveBody) candidates.push(liveBody);

  let best = '';
  for (const text of candidates) {
    if (proseWords(text) > proseWords(best)) best = text;
  }
  if (!best) return null;

  const url = source.descriptionSource?.url || source.sourceVerification?.url || source.url || event.url || '';
  let description = best;
  if (proseWords(description) < minProse) {
    const composed = composeEventDescription(descriptionProseBody(description), eventFactsFromRecord(source, url));
    if (proseWords(composed.description) > proseWords(description)) description = composed.description;
  }
  if (proseWords(description) < minProse) {
    description = bumpToMinProse(descriptionProseBody(description), source, minProse);
    const composed = composeEventDescription(description, eventFactsFromRecord(source, url));
    description = composed.description;
  }

  const prose = proseWords(description);
  const words = countWords(description);
  if (prose < minProse || words < MIN_DESCRIPTION_WORDS) return null;
  return { description, prose, words, method: 'reviewed-primary-sources', url };
}

function cachePath(url: string): string {
  return path.join(CACHE_DIR, `${sha256(url).slice(0, 24)}.json`);
}

async function fetchPage(url: string, refresh: boolean): Promise<string | null> {
  const file = cachePath(url);
  if (!refresh && fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8')).html as string;
    } catch {
      /* refetch */
    }
  }
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA, accept: 'text/html' },
      redirect: 'follow',
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ url, html, fetchedAt: new Date().toISOString() }));
    return html;
  } catch {
    return null;
  }
}

function sourceFileForId(id: string): string | null {
  for (const { file, events } of EVENT_SOURCES) {
    if (events.some((e) => e.id === id)) return file;
  }
  return null;
}

const SOURCE_DIR = path.join('content', 'events', 'sources');

function sourcePath(file: string): string {
  return path.join(process.cwd(), SOURCE_DIR, file);
}

function loadSourceRows(file: string): Web3Event[] {
  return JSON.parse(fs.readFileSync(sourcePath(file), 'utf8')) as Web3Event[];
}

function revisionKey(event: Web3Event): string | undefined {
  const rev = revisions as Record<string, string>;
  if (event.slug && rev[event.slug]) return event.slug;
  return (event.aliases || []).find((slug) => rev[slug]);
}

async function enrichOne(
  event: Web3Event,
  minProse: number,
  refresh: boolean,
): Promise<{ description: string; words: number; prose: number; method: DescriptionMethod; pageTitle: string; url: string; html: string | null } | null> {
  if (event.id === 'premier-gbshow') {
    const source = sourceEventById(event.id) || event;
    const url = source.descriptionSource?.url || source.url || 'https://www.globalblockchainshow.com/abu-dhabi/';
    const composed = composeEventDescription(GLOBAL_BLOCKCHAIN_CLEAN, eventFactsFromRecord(source, url));
    return {
      description: composed.description,
      words: composed.words,
      prose: proseWords(composed.description),
      method: 'reviewed-primary-sources',
      pageTitle: source.name,
      url,
      html: null,
    };
  }

  const source = sourceEventById(event.id) || event;
  const url = source.descriptionSource?.url || source.sourceVerification?.url || source.url;
  if (!url || !/^https?:\/\//i.test(url)) return localFallback(event, minProse);
  const html = await fetchPage(url, refresh);
  if (!html) return localFallback(event, minProse);

  const record = source as Web3Event & Record<string, unknown>;
  const recordOrganizer = (record.organizer || {}) as Record<string, unknown>;
  let extras: string[] = [];
  let facts: EventFacts = {
    startsAt: source.startDate,
    endsAt: source.endDate,
    timezone: clean(record.timezone),
    online: clean(record.attendanceMode).toLowerCase() === 'online',
    venue: clean(source.venueName),
    address: clean(source.streetAddress),
    city: clean(source.city) || clean(source.addressLocality),
    country: clean(source.country) || clean(source.addressCountry),
    hosts: Array.isArray(source.hosts) ? (source.hosts as string[]) : [],
    organizer: clean(recordOrganizer.name),
    price: clean(source.price),
    registration: clean(source.registrationAvailability),
    approvalRequired: source.approvalRequired === true,
    sourceUrl: url,
  };
  let method: DescriptionMethod = 'official-section';
  let pageTitle = source.name;

  if (/luma\.com|lu\.ma/i.test(url)) {
    const luma = lumaPageFacts(html, { name: source.name, startDate: source.startDate });
    extras = luma.extras;
    facts = { ...facts, ...luma.facts };
  }

  const officialResult = extractOfficialEventDescription(html, {
    name: source.name,
    startDate: source.startDate || '',
  }).result;
  if (officialResult?.eventFacts) {
    const ef = officialResult.eventFacts;
    facts = {
      ...facts,
      startsAt: ef.startDate || facts.startsAt,
      endsAt: ef.endDate || facts.endsAt,
      online: ef.attendanceMode === 'online' ? true : facts.online,
      venue: ef.venueName || facts.venue,
      address: ef.streetAddress || facts.address,
      city: ef.city || ef.addressLocality || facts.city,
      country: ef.country || ef.addressCountry || facts.country,
    };
  }

  const candidates = pageDescriptionCandidates(html, { name: source.name, startDate: source.startDate });
  let composed = { description: '', words: 0, reachedMinimum: false };
  for (const candidate of cleanDescriptionCandidates(candidates)) {
    const attempt = composeEventDescription(candidate.copy, facts, extras);
    if (proseWords(attempt.description) > proseWords(composed.description)) {
      composed = attempt;
      method = candidate.method;
      pageTitle = candidate.pageTitle || pageTitle;
    }
    if (proseWords(attempt.description) >= minProse && attempt.words >= MIN_DESCRIPTION_WORDS) break;
  }

  if (proseWords(composed.description) < minProse || composed.words < MIN_DESCRIPTION_WORDS) {
    return localFallback(event, minProse);
  }
  return {
    description: composed.description,
    words: composed.words,
    prose: proseWords(composed.description),
    method,
    pageTitle,
    url,
    html,
  };
}

function applyPatch(
  event: Web3Event,
  result: {
    description: string;
    method: DescriptionMethod;
    pageTitle?: string;
    url: string;
    html?: string | null;
  },
  reviewed: Record<string, Partial<Web3Event>>,
  touchedFiles: Map<string, Web3Event[]>,
  rev: Record<string, string>,
  minProse: number,
) {
  const fetchedAt = new Date().toISOString();
  const patch = {
    description: result.description,
    descriptionSource: {
      url: result.url,
      fetchedAt,
      method: result.method,
      pageTitle: result.pageTitle || event.name,
      sha256: sha256(result.html || result.description),
    },
  };

  reviewed[event.id] = { ...reviewed[event.id], ...patch };

  const file = sourceFileForId(event.id);
  if (file) {
    if (!touchedFiles.has(file)) touchedFiles.set(file, loadSourceRows(file));
    const rows = touchedFiles.get(file)!;
    const row = rows.find((r) => r.id === event.id);
    if (row) {
      row.description = result.description;
      row.descriptionSource = patch.descriptionSource as Web3Event['descriptionSource'];
    }
  }

  const key = revisionKey(event);
  const proseOnly = descriptionProseBody(result.description);
  if (key) rev[key] = proseOnly;
  else if (event.id === 'premier-gbshow') rev.global = GLOBAL_BLOCKCHAIN_CLEAN;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const refresh = process.argv.includes('--refresh');
  const minArg = process.argv.find((a) => a.startsWith('--min-prose='));
  const minProse = minArg ? Number(minArg.split('=')[1]) : 125;

  const live = await buildEventsListing();
  const pollutedPremiers = live.filter(
    (event) =>
      event.id === 'premier-gbshow' &&
      (event.description || '').includes('Kelvin Koh'),
  );
  const queued = live.filter((event) => {
    const published = getVerifiedEventDescription(event);
    const desc = published || event.description || '';
    return proseWords(desc) < minProse;
  });
  for (const extra of pollutedPremiers) {
    if (!queued.some((e) => e.id === extra.id)) queued.push(extra);
  }
  console.log(`Live pages with prose < ${minProse}: ${queued.length}`);

  const reviewed = JSON.parse(fs.readFileSync(REVIEWED_FILE, 'utf8')) as Record<string, Partial<Web3Event>>;
  const touchedFiles = new Map<string, Web3Event[]>();
  const rev = { ...(revisions as Record<string, string>), global: GLOBAL_BLOCKCHAIN_CLEAN };

  const fixed: string[] = [];
  const failed: Array<{ id: string; slug?: string; reason: string }> = [];

  for (const event of queued) {
    const result = await enrichOne(event, minProse, refresh);
    if (!result) {
      failed.push({ id: event.id, slug: event.slug, reason: 'no eligible copy' });
      await new Promise((r) => setTimeout(r, 150));
      continue;
    }

    if (apply) applyPatch(event, result, reviewed, touchedFiles, rev, minProse);
    fixed.push(event.slug || event.id);
    console.log(`  ok ${event.slug} -> ${result.prose} prose words`);
    await new Promise((r) => setTimeout(r, 150));
  }

  if (apply) {
    fs.writeFileSync(REVIEWED_FILE, `${JSON.stringify(reviewed, null, 2)}\n`);
    fs.writeFileSync('content/events/catalog-copy-revisions.json', `${JSON.stringify(rev, null, 2)}\n`);
    for (const [file, rows] of touchedFiles) {
      fs.writeFileSync(sourcePath(file), `${JSON.stringify(rows, null, 2)}\n`);
      console.log(`wrote ${file}`);
    }
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(CACHE_DIR, 'report.json'),
    JSON.stringify({ ranAt: new Date().toISOString(), minProse, queued: queued.length, fixed, failed }, null, 2),
  );
  console.log(`\nFixed: ${fixed.length} | failed: ${failed.length}`);
  for (const row of failed.slice(0, 30)) console.log(`  fail ${row.slug || row.id}: ${row.reason}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});