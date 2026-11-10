import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { load } from 'cheerio';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { getVerifiedEventDescription } from '../src/lib/event-description-source';
import { extractOfficialEventDescription } from './official-event-description';
import { pageDescriptionCandidates } from './lib/event-description-sources';
import {
  composeEventDescription,
  countWords,
  MIN_DESCRIPTION_WORDS,
  type EventFacts,
} from './lib/event-description-compose';
import {
  lumaPageFacts,
} from './lib/event-description-sources';

const UA = 'HashtagWeb3 Event Description Enrichment/1.0 (+https://hashtagweb3.com)';
const CACHE_DIR = path.join('.cache', 'event-desc-100w');
const REVIEWED_FILE = 'content/events/catalog-reviewed-descriptions.json';

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const clean = (value?: unknown) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '');

function cachePath(url: string) {
  return path.join(CACHE_DIR, `${sha256(url).slice(0, 24)}.json`);
}

async function fetchPage(url: string): Promise<string | null> {
  const file = cachePath(url);
  if (fs.existsSync(file)) {
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

async function main() {
  const apply = process.argv.includes('--apply');
  const reviewed = JSON.parse(fs.readFileSync(REVIEWED_FILE, 'utf8')) as Record<string, any>;
  const liveIds = new Set(
    (await (async () => {
      const { buildEventsListing } = await import('../src/lib/events-listing-build');
      return buildEventsListing();
    })()).map((e: any) => e.id),
  );

  const targets: Array<{ id: string; event: any; words: number }> = [];
  for (const { events } of EVENT_SOURCES) {
    for (const event of events) {
      if (!liveIds.has(event.id)) continue;
      const rev = reviewed[event.id];
      if (!rev?.description) continue;
      const published = getVerifiedEventDescription(event as any);
      const words = countWords(published);
      if (words >= MIN_DESCRIPTION_WORDS) continue;
      targets.push({ id: event.id, event, words });
    }
  }
  console.log(`Reviewed-description short pages queued: ${targets.length}`);

  const fixed: string[] = [];
  const stillShort: Array<{ id: string; words: number; name: string }> = [];
  const failed: Array<{ id: string; reason: string; url?: string }> = [];

  for (const { id, event } of targets) {
    const rev = reviewed[id];
    const reviewedDesc = clean(rev.description);
    const url = rev.descriptionSource?.url || event.url;
    if (!url) {
      failed.push({ id, reason: 'no source url' });
      continue;
    }
    const html = await fetchPage(url);
    let facts: EventFacts = {
      startsAt: event.startDate,
      endsAt: event.endDate,
      timezone: clean(event.timezone),
      online: clean(event.attendanceMode).toLowerCase() === 'online',
      venue: clean(event.venueName),
      address: clean(event.streetAddress),
      city: clean(event.city) || clean(event.addressLocality),
      country: clean(event.country) || clean(event.addressCountry),
      hosts: Array.isArray(event.hosts) ? event.hosts : [],
      organizer: clean((event.organizer || {}).name),
      price: clean(event.price),
      registration: clean(event.registrationAvailability),
      approvalRequired: event.approvalRequired === true,
      sourceUrl: url,
    };
    let extras: string[] = [];
    let pageCandidates: any[] = [];

    if (/luma\.com|lu\.ma/i.test(url) && html) {
      const luma = lumaPageFacts(html, { name: event.name, startDate: event.startDate });
      extras = luma.extras;
      facts = { ...facts, ...luma.facts };
      pageCandidates = pageDescriptionCandidates(html, { name: event.name, startDate: event.startDate });
    } else if (html) {
      const official = extractOfficialEventDescription(html, { name: event.name, startDate: event.startDate || '' }).result;
      if (official?.eventFacts) {
        const ef = official.eventFacts;
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
      pageCandidates = pageDescriptionCandidates(html, { name: event.name, startDate: event.startDate });
    }

    // Compose: reviewed prose leads, facts fill length.
    let composed = composeEventDescription(reviewedDesc, facts, extras);
    let method: string = rev.descriptionSource?.method || 'reviewed-primary-sources';
    let pageTitle = rev.descriptionSource?.pageTitle || event.name;

    // If still short, prefer the organiser's own (longer) page copy as the
    // primary description instead of the short reviewed summary.
    if (!composed.reachedMinimum) {
      const longest = pageCandidates
        .slice()
        .sort((a, b) => b.copy.length - a.copy.length)[0];
      if (longest && longest.copy.length > reviewedDesc.length) {
        const attempt = composeEventDescription(longest.copy, facts, extras);
        if (attempt.words > composed.words) {
          composed = attempt;
          method = longest.method;
          pageTitle = longest.pageTitle || pageTitle;
        }
      }
    }

    // If still short, append the best page candidate as extra copy.
    if (!composed.reachedMinimum) {
      for (const candidate of pageCandidates) {
        const attempt = composeEventDescription(
          composed.description.split('\n\n## Event details')[0] || reviewedDesc,
          facts,
          [...extras, candidate.copy],
        );
        if (attempt.words > composed.words) {
          composed = attempt;
          method = candidate.method;
          pageTitle = candidate.pageTitle || pageTitle;
        }
        if (attempt.reachedMinimum) break;
      }
    }

    if (!composed.description || composed.words < MIN_DESCRIPTION_WORDS) {
      stillShort.push({ id, words: composed.words, name: event.name });
      continue;
    }

    reviewed[id] = {
      ...rev,
      description: composed.description,
      descriptionSource: {
        url,
        fetchedAt: new Date().toISOString(),
        method,
        pageTitle,
        sha256: sha256(html || composed.description),
      },
    };
    fixed.push(id);
    await new Promise((r) => setTimeout(r, 120));
  }

  if (apply) {
    fs.writeFileSync(REVIEWED_FILE, `${JSON.stringify(reviewed, null, 2)}\n`);
    console.log(`  wrote ${REVIEWED_FILE}`);
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(CACHE_DIR, 'reviewed-enrich-report.json'),
    JSON.stringify({ ranAt: new Date().toISOString(), queued: targets.length, fixed: fixed.length, stillShort, failed }, null, 2),
  );
  console.log(`\nProcessed: ${targets.length} | fixed: ${fixed.length} | still short: ${stillShort.length} | failed: ${failed.length}`);
  for (const row of stillShort) console.log(`  short ${row.words}w  ${row.id}  ${row.name}`);
  for (const row of failed) console.log(`  fail  ${row.id}  ${row.reason}  ${row.url || ''}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
