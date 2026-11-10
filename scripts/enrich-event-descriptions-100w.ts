/**
 * Bring every live event page to at least 100 words using source-backed copy.
 *
 * For each upcoming event whose published description is short, the organiser's
 * page is fetched and the description is rebuilt from that copy plus verified
 * facts (date, format, venue, hosts, organiser, tickets, registration) read
 * from the same page. Nothing is invented and no filler is added.
 *
 * Usage: npx tsx scripts/enrich-event-descriptions-100w.ts [--apply] [--limit=N]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { load } from 'cheerio';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import { buildEventsListing } from '../src/lib/events-listing-build';
import { extractOfficialEventDescription } from './official-event-description';
import {
  lumaPageFacts,
  pageDescriptionCandidates,
  type DescriptionMethod,
} from './lib/event-description-sources';
import {
  extractLumaDescriptionsFromHtml,
  normalizeLumaDescriptionForStorage,
  pickBestLumaOrganizerDescription,
} from './luma-page-description';
import {
  composeEventDescription,
  countWords,
  MIN_DESCRIPTION_WORDS,
  type EventFacts,
} from './lib/event-description-compose';

const UA = 'HashtagWeb3 Event Description Enrichment/1.0 (+https://hashtagweb3.com)';
const CACHE_DIR = path.join('.cache', 'event-desc-100w');

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
];

type StoredEvent = Record<string, unknown> & {
  id: string;
  name: string;
  url?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const clean = (value?: unknown) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '');

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
      signal: AbortSignal.timeout(40_000),
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

function lumaPageData(html: string): Record<string, unknown> {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) return {};
  try {
    const parsed = JSON.parse(match[1]);
    const props = parsed?.props?.pageProps || {};
    const initial = props.initialData || {};
    return (initial.data || initial.event || initial) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function readablePageText($: ReturnType<typeof load>): string {
  const clone = load($.html());
  clone('script, style, nav, footer, form, button, noscript, svg, iframe, [hidden], [aria-hidden="true"]').remove();
  clone('br').replaceWith('\n');
  clone('h1,h2,h3,h4,h5,h6').each((_, element) => { clone(element).replaceWith(`\n\n${clone(element).text().trim()}\n\n`); });
  clone('li').each((_, element) => { clone(element).prepend('\n• ').append('\n'); });
  clone('p,div,section,ul,ol,blockquote').append('\n\n');
  return clone
    .root()
    .text()
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function hostName(host: Record<string, unknown>): string {
  const full = `${clean(host.first_name)} ${clean(host.last_name)}`.trim();
  const name = clean(host.name);
  if (name && full && name.toLowerCase() !== full.toLowerCase()) return name;
  return name || full;
}

async function mapPool<T>(items: T[], size: number, worker: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (cursor < items.length) {
        const item = items[cursor++];
        await worker(item);
      }
    }),
  );
}

async function main() {
  const apply = process.argv.includes('--apply');
  const refresh = process.argv.includes('--refresh');
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity;
  const now = Date.now();

  const manualPath = path.join(CACHE_DIR, 'manual-sources.json');
  const manual = fs.existsSync(manualPath)
    ? (JSON.parse(fs.readFileSync(manualPath, 'utf8')) as Record<string, {
        url?: string;
        text?: string;
        pageTitle?: string;
        retrievedVia?: string;
        representation?: 'html' | 'rendered-text';
        allowReadable?: boolean;
      }>)
    : {};

  const live = await buildEventsListing();
  const liveIds = new Set(live.map((event) => event.id));
  console.log(`Live pages: ${liveIds.size}`);

  const rowsByFile = new Map<string, StoredEvent[]>();
  const targets: Array<{ file: string; event: StoredEvent; words: number }> = [];
  for (const file of SOURCE_FILES) {
    if (!fs.existsSync(file)) continue;
    const rows = JSON.parse(fs.readFileSync(file, 'utf8')) as StoredEvent[];
    if (!Array.isArray(rows)) continue;
    rowsByFile.set(file, rows);
    for (const event of rows) {
      if (!event?.id || !event.startDate) continue;
      if (!liveIds.has(event.id)) continue;
      const end = Date.parse(event.endDate || event.startDate);
      if (end < now) continue;
      const published = getVerifiedEventDescription(event as unknown as Parameters<typeof getVerifiedEventDescription>[0]);
      const words = countWords(published);
      if (words >= MIN_DESCRIPTION_WORDS) continue;
      targets.push({ file, event, words });
    }
  }

  console.log(`Short pages queued: ${targets.length}`);
  const work = targets.slice(0, limit);

  const fixed: Array<{ id: string; words: number; file: string }> = [];
  const stillShort: Array<{ id: string; words: number; name: string; url?: string }> = [];
  const failed: Array<{ id: string; reason: string; url?: string }> = [];

  await mapPool(work, 4, async ({ file, event }) => {
    const url = event.url;
    if (!url) {
      failed.push({ id: event.id, reason: 'no source url' });
      return;
    }
    const manualSource = manual[event.id];
    const sourceUrl = manualSource?.url || url;
    const html = manualSource?.text ? '' : await fetchPage(sourceUrl, refresh);
    if (!manualSource?.text && !html) {
      failed.push({ id: event.id, reason: 'source page unreachable', url: sourceUrl });
      return;
    }

    const record = event as Record<string, unknown>;
    const recordOrganizer = (record.organizer || {}) as Record<string, unknown>;
    let extras: string[] = [];
    let facts: EventFacts = {
      startsAt: event.startDate,
      endsAt: event.endDate,
      timezone: clean(record.timezone),
      online: clean(record.attendanceMode).toLowerCase() === 'online',
      venue: clean(record.venueName),
      address: clean(record.streetAddress),
      city: clean(record.city) || clean(record.addressLocality),
      country: clean(record.country) || clean(record.addressCountry),
      hosts: Array.isArray(record.hosts) ? (record.hosts as string[]) : [],
      organizer: clean(recordOrganizer.name),
      price: clean(record.price),
      registration: clean(record.registrationAvailability),
      approvalRequired: record.approvalRequired === true,
      sourceUrl: url,
    };
    let method: DescriptionMethod = 'official-section';
    let pageTitle = '';

    if (/luma\.com|lu\.ma/i.test(url)) {
      const luma = lumaPageFacts(html, { name: event.name, startDate: event.startDate });
      extras = luma.extras;
      facts = { ...facts, ...luma.facts };
    }

    const officialResult = html
      ? extractOfficialEventDescription(html, {
          name: event.name,
          startDate: event.startDate || '',
        }).result
      : undefined;
    const candidates = manualSource?.text
      ? [
          {
            copy: manualSource.text,
            method: 'official-section' as const,
            pageTitle: manualSource.pageTitle || event.name,
          },
        ]
      : pageDescriptionCandidates(
          html || '',
          { name: event.name, startDate: event.startDate },
          { allowReadableWithoutIdentity: Boolean(officialResult) || manualSource?.allowReadable === true },
        );
    const officialCandidate = candidates.find((candidate) => candidate.method === 'event-jsonld');
    if (officialCandidate) {
      pageTitle = officialCandidate.pageTitle;
      const officialFacts = extractOfficialEventDescription(html, {
        name: event.name,
        startDate: event.startDate || '',
      }).result?.eventFacts;
      if (officialFacts) {
        facts = {
          ...facts,
          startsAt: officialFacts.startDate || facts.startsAt,
          endsAt: officialFacts.endDate || facts.endsAt,
          online: officialFacts.attendanceMode === 'online' ? true : facts.online,
          venue: officialFacts.venueName || facts.venue,
          address: officialFacts.streetAddress || facts.address,
          city: officialFacts.city || officialFacts.addressLocality || facts.city,
          country: officialFacts.country || officialFacts.addressCountry || facts.country,
        };
      }
    }

    let composed = { description: '', words: 0, reachedMinimum: false };
    for (const candidate of candidates) {
      const attempt = composeEventDescription(candidate.copy, facts, extras);
      if (attempt.words > composed.words) {
        composed = attempt;
        method = candidate.method;
        pageTitle = candidate.pageTitle || pageTitle;
      }
      if (attempt.reachedMinimum) break;
    }

    if (!composed.description || composed.words < MIN_DESCRIPTION_WORDS) {
      stillShort.push({
        id: event.id,
        words: composed.words,
        name: event.name,
        url,
      });
      return;
    }

    event.description = composed.description;
    const fetchedAt = new Date().toISOString();
    event.descriptionSource = {
      url: sourceUrl,
      fetchedAt,
      method,
      pageTitle: pageTitle || event.name,
      sha256: sha256(html || composed.description),
      ...(manualSource
        ? {
            evidence: [
              {
                url: manualSource.retrievedVia === 'wayback' ? url : sourceUrl,
                fetchedAt,
                sha256: sha256(html || composed.description),
                retrievedVia: manualSource.retrievedVia,
                representation: manualSource.representation || 'html',
              },
            ],
          }
        : {}),
    };
    fixed.push({ id: event.id, words: composed.words, file });
    await new Promise((r) => setTimeout(r, 120));
  });

  if (apply) {
    const touched = new Set(fixed.map((row) => row.file));
    for (const file of touched) {
      const rows = rowsByFile.get(file);
      if (!rows) continue;
      fs.writeFileSync(path.join(process.cwd(), file), `${JSON.stringify(rows, null, 2)}\n`);
      console.log(`  wrote ${file}`);
    }
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(CACHE_DIR, 'report.json'),
    `${JSON.stringify(
      {
        ranAt: new Date().toISOString(),
        queued: targets.length,
        processed: work.length,
        fixed: fixed.length,
        stillShort,
        failed,
      },
      null,
      2,
    )}\n`,
  );

  console.log(`\nProcessed: ${work.length} | fixed: ${fixed.length} | still short: ${stillShort.length} | failed: ${failed.length}`);
  for (const row of stillShort.slice(0, 25)) console.log(`  short ${row.words}w  ${row.id}  ${row.name.slice(0, 55)}  ${row.url || ''}`);
  for (const row of failed.slice(0, 15)) console.log(`  fail  ${row.id}  ${row.reason}  ${row.url || ''}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
