import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { getEventExternalUrl } from '../src/lib/event-external-url';
import type { Web3Event } from '../src/lib/events';
import { normalizeCountry } from '../src/lib/events';
import { extractOfficialEventDescription, matchesEventIdentity } from './official-event-description';
import { load } from 'cheerio';

const root = process.cwd();
const cache = path.join(root, '.cache/event-verification/official-pages');
const args = process.argv.slice(2);
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
type Snapshot = { url: string; resolvedUrl?: string; fetchedAt: string; status?: number; html?: string; error?: string };

async function main() {
  fs.mkdirSync(cache, { recursive: true });
  const runtime = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
  const currentIds = new Set(runtime.map((event) => event.id));
  const targets = EVENT_SOURCES.flatMap(({ file, events }) => events.filter((event) => currentIds.has(event.id) && !event.sourceVerification).map((event) => ({ file, event })));
  const discoveredFile = path.join(cache, 'discovered-source-urls.json');
  const discovered: Record<string, string[]> = fs.existsSync(discoveredFile) ? JSON.parse(fs.readFileSync(discoveredFile, 'utf8')) : {};
  const urlsFor = (event: Web3Event) => [...new Set([...(discovered[event.id] || []), getEventExternalUrl(event), event.website].filter((url): url is string => !!url && /^https?:\/\//i.test(url)).map((url) => url.split('#')[0]))];
  if (args.includes('--discover')) {
    for (const { event } of targets) {
      for (const url of urlsFor(event)) {
        const snapshotFile = path.join(cache, `${hash(url)}.json`);
        if (!fs.existsSync(snapshotFile)) continue;
        const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8')) as Snapshot;
        if (!snapshot.html || extractOfficialEventDescription(snapshot.html, event).result) continue;
        const $ = load(snapshot.html);
        const candidates = $('a[href]').map((_, element) => ({ href: $(element).attr('href') || '', label: $(element).text().trim() })).get()
          .filter((link) => matchesEventIdentity(event.name, link.label));
        const refresh = $('meta[http-equiv="refresh"]').attr('content')?.match(/url\s*=\s*(.+)$/i)?.[1];
        if (refresh) candidates.push({ href: refresh.replace(/^['"]|['"]$/g, ''), label: event.name });
        for (const { href } of candidates.slice(0, 3)) {
          try {
            const resolved = new URL(href, snapshot.resolvedUrl || url);
            if (!/^https?:$/.test(resolved.protocol) || /^(?:localhost|127\.|10\.|192\.168\.|169\.254\.|\[)/i.test(resolved.hostname)) continue;
            const next = resolved.href.split('#')[0];
            if (next !== url) discovered[event.id] = [...new Set([...(discovered[event.id] || []), next])];
          } catch { /* Invalid links cannot identify a source page. */ }
        }
      }
    }
    fs.writeFileSync(discoveredFile, JSON.stringify(discovered, null, 2));
  }
  const urls = [...new Set(targets.flatMap(({ event }) => urlsFor(event)))];
  if (args.includes('--fetch')) {
    const queue = urls.filter((url) => {
      const file = path.join(cache, `${hash(url)}.json`);
      if (args.includes('--refresh') || !fs.existsSync(file)) return true;
      const snapshot = JSON.parse(fs.readFileSync(file, 'utf8')) as Snapshot;
      return Date.now() - Date.parse(snapshot.fetchedAt) > 24 * 60 * 60 * 1000;
    });
    const total = queue.length;
    let finished = 0;
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (queue.length) {
        const url = queue.shift()!;
        const snapshot: Snapshot = { url, fetchedAt: new Date().toISOString() };
        try {
          const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; HashtagWeb3/1.0; +https://hashtagweb3.com)', accept: 'text/html' }, signal: AbortSignal.timeout(30_000) });
          snapshot.status = response.status;
          snapshot.resolvedUrl = response.url;
          if (response.ok) snapshot.html = await response.text();
          else snapshot.error = `HTTP ${response.status}`;
        } catch (error) { snapshot.error = error instanceof Error ? error.message : 'fetch failed'; }
        fs.writeFileSync(path.join(cache, `${hash(url)}.json`), JSON.stringify(snapshot));
        if (++finished % 10 === 0 || finished === total) console.log(`Fetched ${finished}/${total} official pages.`);
      }
    }));
  }
  const report: Array<Record<string, unknown>> = [];
  const patches = new Map<string, Map<string, Record<string, unknown>>>();
  const verifiedEvents = EVENT_SOURCES.flatMap(({ events }) => events).filter((event) => event.sourceVerification && event.description);
  const identityKey = (name: string, city = '') => name.split('|')[0].normalize('NFKD').toLowerCase().replace(/\b20\d{2}\b/g, '').replace(city.toLowerCase(), '').replace(/[^a-z0-9]/g, '');
  for (const { file, event } of targets) {
    let accepted = false;
    const attempts: Array<Record<string, unknown>> = [];
    for (const url of urlsFor(event)) {
      const snapshotFile = path.join(cache, `${hash(url)}.json`);
      if (!fs.existsSync(snapshotFile)) { attempts.push({ url, reason: 'not-fetched' }); continue; }
      const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8')) as Snapshot;
      if (!snapshot.html) { attempts.push({ url, reason: snapshot.error || 'empty-response' }); continue; }
      const { result, reason } = extractOfficialEventDescription(snapshot.html, event);
      if (!result) { attempts.push({ url, reason }); continue; }
      const provenance = { url: snapshot.resolvedUrl || url, fetchedAt: snapshot.fetchedAt, method: result.method, pageTitle: result.pageTitle, sha256: hash(result.description) };
      const pageText = load(snapshot.html)('body').text().replace(/\s+/g, ' ');
      if (event.id === 'premier-labitconf-2026' && pageText.includes('30 y sábado 31 de octubre')) {
        result.eventFacts = { ...result.eventFacts, startDate: '2026-10-30', endDate: '2026-10-31' };
      }
      if (event.id === 'premier-africabcfest' && pageText.includes('October 15-17, 2026') && pageText.includes('Sarit Expo Centre, Nairobi, Kenya')) {
        result.eventFacts = { ...result.eventFacts, startDate: '2026-10-15', endDate: '2026-10-17', venueName: 'Sarit Expo Centre', location: 'Sarit Expo Centre, Nairobi, Kenya', city: 'Nairobi', country: 'Kenya' };
      }
      if (!patches.has(file)) patches.set(file, new Map());
      patches.get(file)!.set(event.id, { ...result.eventFacts, description: result.description, descriptionSource: provenance });
      report.push({ id: event.id, file, status: 'source-backed', source: provenance, eventFacts: result.eventFacts, previousStartDate: event.startDate, characters: result.description.length, preview: result.description.slice(0, 800) });
      accepted = true;
      break;
    }
    if (!accepted) {
      const matches = verifiedEvents.filter((candidate) => candidate.startDate.slice(0, 10) === event.startDate.slice(0, 10)
        && normalizeCountry(candidate.country) === normalizeCountry(event.country)
        && identityKey(candidate.name, event.city) === identityKey(event.name, event.city));
      const bySource = new Map(matches.map((candidate) => [candidate.sourceVerification!.eventId, candidate]));
      if (bySource.size === 1) {
        const match = [...bySource.values()][0];
        const source = { url: match.sourceVerification!.url, fetchedAt: match.sourceVerification!.fetchedAt, method: 'matched-organizer-record', pageTitle: match.name, sha256: hash(match.description) };
        if (!patches.has(file)) patches.set(file, new Map());
        patches.get(file)!.set(event.id, { description: match.description, descriptionSource: source });
        report.push({ id: event.id, file, status: 'source-backed', source, matchedRecordId: match.id, characters: match.description.length, preview: match.description.slice(0, 800) });
      } else report.push({ id: event.id, file, name: event.name, status: 'unavailable', attempts });
    }
  }
  if (args.includes('--apply')) {
    for (const [file, changes] of patches) {
      const sourceFile = path.join(root, 'content/events/sources', file);
      const events = JSON.parse(fs.readFileSync(sourceFile, 'utf8')) as Web3Event[];
      const backup = path.join(cache, `before-${file}`);
      if (!fs.existsSync(backup)) fs.copyFileSync(sourceFile, backup);
      for (const event of events) {
        const patch = changes.get(event.id);
        if (patch) Object.assign(event, patch);
      }
      fs.writeFileSync(sourceFile, `${JSON.stringify(events, null, 2)}\n`);
    }
  }
  const summary = { total: targets.length, sourceBacked: report.filter((row) => row.status === 'source-backed').length, unavailable: report.filter((row) => row.status === 'unavailable').length };
  fs.writeFileSync(path.join(args.includes('--apply') ? 'content/events' : cache, 'official-description-report.json'), `${JSON.stringify({ ...summary, applied: args.includes('--apply'), records: report }, null, 2)}\n`);
  console.log(JSON.stringify(summary));
  console.log(JSON.stringify(report.map(({ id, status, characters, attempts }) => ({ id, status, characters, ...(attempts ? { attempts } : {}) })), null, 2));
}
main().catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
