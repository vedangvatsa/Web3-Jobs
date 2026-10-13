import events from '../content/events-runtime.json';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { lumaSourcePatch, object } from './luma-source-record';
import { extractOfficialEventDescription } from './official-event-description';
import type { Web3Event } from '../src/lib/events';
import revisions from '../content/events/catalog-copy-revisions.json';
import migrations from '../content/events/slug-migrations.json';
import { cleanPublishText } from '../src/lib/noslop';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import factRevisions from '../content/events/catalog-fact-revisions.json';

const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const directory = '.cache/current-event-audit';
async function main() {
  if (process.argv.includes('--publication')) {
    const baseline = JSON.parse(fs.readFileSync(`${directory}/baseline.json`, 'utf8')) as Web3Event[];
    const removed = baseline.filter(event => !events.some(current => current.id === event.id)).map(event => ({ id: event.id, slug: event.slug }));
    const added = events.filter(event => !baseline.some(previous => previous.id === event.id)).map(event => ({ id: event.id, slug: event.slug }));
    const report = JSON.parse(fs.readFileSync('content/events/current-catalog-audit.json', 'utf8'));
    const original = new Map(baseline.map(event => [event.id, event]));
    report.publication = { before: baseline.length, after: events.length, removed, added,
      currentDescriptionsChanged: events.filter(event => original.get(event.id)?.description !== event.description).length,
      currentCanonicalSlugsChanged: events.filter(event => original.get(event.id)?.slug !== event.slug).length,
      currentFactsChanged: events.filter(event => ['name', 'startDate', 'endDate', 'price', 'approvalRequired', 'locationHidden', 'eventStatus'].some(field => JSON.stringify((event as Web3Event)[field as keyof Web3Event]) !== JSON.stringify(original.get(event.id)?.[field as keyof Web3Event]))).length,
    };
    fs.writeFileSync('content/events/current-catalog-audit.json', `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify(report.publication));
    return;
  }
  if (process.argv.includes('--rendered')) {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ executablePath: '.cache/nomads/browsers/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
    try {
      for (const [id, url] of [
        ['premier-tabconf', 'https://8.tabconf.com/'],
        ['premier-swell-2026', 'https://ripple.com/events/swell/'],
        ['premier-world-token-congress-2026', 'https://worldtokencongress.com/'],
      ]) {
        const page = await browser.newPage();
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForFunction(() => document.body.innerText.length > 500, undefined, { timeout: 30000 });
        const body = await page.locator('body').innerText();
        fs.writeFileSync(`${directory}/${id}.json`, JSON.stringify({ id, url, resolvedUrl: page.url(), fetchedAt: new Date().toISOString(), status: response?.status(), body, bodyKind: 'rendered-text', sha256: hash(body) }));
        console.log(`Captured rendered primary page: ${url}, ${body.length} characters`);
        await page.close();
      }
    } finally { await browser.close(); }
    return;
  }
  if (process.argv.includes('--hashes')) {
    const current = new Set(events.map(event => event.id));
    for (const { file, events: source } of EVENT_SOURCES) for (const event of source) {
      if (current.has(event.id) && event.descriptionSource && hash(event.description) !== event.descriptionSource.sha256) console.log(JSON.stringify({ file, id: event.id, slug: events.find(e => e.id === event.id)?.slug, normalizedMatches: hash(cleanPublishText(event.description)) === event.descriptionSource.sha256 }));
    }
    return;
  }
  if (process.argv.includes('--quality')) {
    for (const event of events) {
      if (Object.keys(revisions).some(slug => event.slug === slug || event.aliases?.includes(slug))) continue;
      const headings = event.description.match(/^## .+$/gm) || [];
      if (headings.length >= 10 || /https:\/\/Have|\bSponsors\b|\bPartners\b/.test(event.description)) {
        console.log(JSON.stringify({ slug: event.slug, headings, description: event.description.slice(0, 2000) }));
      }
    }
    return;
  }
  if (process.argv.includes('--differences')) {
    for (const event of events as Web3Event[]) {
      const snapshot = JSON.parse(fs.readFileSync(`${directory}/${event.id}.json`, 'utf8'));
      const changes = Object.fromEntries(['name', 'startDate', 'endDate', 'price', 'approvalRequired', 'locationHidden'].filter(field => {
        const a = event[field as keyof Web3Event], b = snapshot.facts?.[field];
        return b !== undefined && a !== b && !(field.endsWith('Date') && Date.parse(String(a)) === Date.parse(String(b)));
      }).map(field => [field, [event[field as keyof Web3Event], snapshot.facts[field]]]));
      if (Object.keys(changes).length) console.log(JSON.stringify({ slug: event.slug, changes }));
    }
    return;
  }
  if (process.argv.includes('--page')) {
    const slug = process.argv[process.argv.indexOf('--page') + 1];
    const event = events.find(e => e.slug === slug || e.aliases?.includes(slug));
    if (!event) throw Error(`Unknown event ${slug}`);
    const snapshot = JSON.parse(fs.readFileSync(`${directory}/${event.id}.json`, 'utf8'));
    const $ = load(snapshot.body || '');
    $('script, style, nav, header, footer, noscript').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    console.log(process.argv.includes('--brief') ? `${text.slice(0, 3500)}\n[...]\n${text.slice(-1800)}` : text);
    return;
  }
  if (process.argv.includes('--compile')) {
    const baselinePath = `${directory}/baseline.json`;
    if (!fs.existsSync(baselinePath)) fs.writeFileSync(baselinePath, JSON.stringify(events));
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8')) as Web3Event[];
    const existing = (file: string): Record<string, Partial<Web3Event>> => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    const patches = existing('content/events/catalog-reviewed-descriptions.json');
    const factPatches = existing('content/events/catalog-reviewed-facts.json');
    const snapshotFor = (event: Web3Event) => {
      let snapshot = JSON.parse(fs.readFileSync(`${directory}/${event.id}.json`, 'utf8'));
      const cached = `.cache/mumbai-event-audit/${hash(snapshot.url)}.json`;
      if (snapshot.status !== 200 && fs.existsSync(cached)) snapshot = JSON.parse(fs.readFileSync(cached, 'utf8'));
      if (snapshot.reason === 'Event identity mismatch' && snapshot.body && event.sourceVerification?.eventId?.startsWith('calev-')) {
        const $ = load(snapshot.body);
        const data = object(object(object(object(JSON.parse($('#__NEXT_DATA__').text())).props).pageProps).initialData).data;
        const facts = lumaSourcePatch({ url: snapshot.url, fetchedAt: snapshot.fetchedAt, method: 'luma-page', data: object(data) });
        if (cleanPublishText(facts.name || '') === event.name && Date.parse(facts.startDate!) === Date.parse(event.startDate)) {
          snapshot.facts = facts;
          snapshot.reason = 'Calendar-entry identity reconciled against exact title, date and organizer URL';
        }
      }
      return snapshot;
    };
    for (const event of baseline) {
      const snapshot = snapshotFor(event);
      const facts = snapshot.facts as Partial<Web3Event> | undefined;
      if (snapshot.status !== 200 || !facts?.sourceVerification) continue;
      const { coverImage: _cover, description: _description, ...verified } = facts;
      if (event.locationHidden) verified.locationHidden = true;
      factPatches[event.id] = verified;
      if (event.id === 'luma-batch-evtt671wDnUAzkDr') factPatches[event.id].eventStatus = 'EventPostponed';
      if (cleanPublishText(facts.name || '') !== event.name || facts.startDate !== event.startDate || facts.endDate !== event.endDate || (!event.locationHidden && facts.locationHidden)) {
        if (facts.description) patches[event.id] = { description: facts.description, descriptionSource: {
          url: snapshot.url, fetchedAt: snapshot.fetchedAt, method: 'official-section', pageTitle: facts.name || event.name,
          sha256: hash(facts.description), evidence: [{ url: snapshot.url, fetchedAt: snapshot.fetchedAt, sha256: hash(snapshot.body) }],
        } };
      }
    }
    for (const [slug, description] of Object.entries(revisions)) {
      const event = baseline.find(e => e.slug === slug || e.aliases?.includes(slug));
      if (!event) throw Error(`Unknown revision ${slug}`);
      const snapshot = snapshotFor(event);
      const primary = snapshot.status === 200 && snapshot.body;
      const priorSource = event.descriptionSource || event.sourceVerification;
      if (!primary && !priorSource) throw Error(`Missing source provenance: ${slug}`);
      patches[event.id] = {
        description,
        descriptionSource: {
          url: primary ? snapshot.url : priorSource!.url,
          fetchedAt: primary ? snapshot.fetchedAt : priorSource!.fetchedAt,
          method: primary ? 'reviewed-primary-sources' : 'reviewed-stored-organizer-copy', pageTitle: event.name,
          sha256: hash(description),
          ...(primary ? { evidence: [{ url: snapshot.url, fetchedAt: snapshot.fetchedAt, sha256: hash(snapshot.body), representation: snapshot.bodyKind === 'rendered-text' ? 'rendered-text' as const : 'html' as const }] } : {}),
        },
      };
    }
    for (const [id, revision] of Object.entries(factRevisions)) {
      const event = baseline.find(event => event.id === id)!;
      const snapshot = snapshotFor(event);
      const text = load(snapshot.body || '')('body').text().replace(/\s+/g, ' ').toLowerCase();
      if (snapshot.status !== 200 || revision.contains.some(value => !text.includes(value.toLowerCase()))) throw Error(`Fact evidence mismatch: ${id}`);
      factPatches[id] = { ...factPatches[id], ...revision.patch, sourceReview: { url: snapshot.url, checkedAt: snapshot.fetchedAt, reason: 'Primary page body checked against catalog-fact-revisions.json.' } } as Partial<Web3Event>;
    }
    fs.writeFileSync('content/events/catalog-reviewed-descriptions.json', `${JSON.stringify(patches, null, 2)}\n`);
    fs.writeFileSync('content/events/catalog-reviewed-facts.json', `${JSON.stringify(factPatches, null, 2)}\n`);
    const records = baseline.map(event => {
      const snapshot = snapshotFor(event);
      const changed = patches[event.id]?.description;
      const sourceAvailable = snapshot.status === 200 && !!snapshot.body;
      const candidate = event.description.length < 600 || (event.description.match(/^## .+$/gm) || []).length >= 10 || /https:\/\/Have/.test(event.description);
      const latest = JSON.parse(fs.readFileSync(`${directory}/${event.id}.json`, 'utf8'));
      const conflict = event.id === 'luma-batch-evtpGqXB9czBhF8u' ? 'Organizer prose says August 27, 2026; structured schedule lists 2027. Confirm with organizer.' : event.id === 'premier-africapredict' ? 'Date banner now says June 3–4, 2027; agenda and FAQ still describe one day. New dates adopted; daily timetable needs organizer confirmation.' : snapshot.reason === 'Event identity mismatch' ? snapshot.reason : undefined;
      const outcome = conflict ? 'conflicting' : !sourceAvailable ? 'unavailable' : changed ? changed.length > event.description.length ? 'verified-expanded' : 'verified-edited' : event.description.length < 600 ? 'genuinely-short-source' : 'reviewed-no-change';
      return { id: event.id, oldSlug: event.slug, slug: (migrations as Record<string, string>)[event.slug!] || event.slug,
        candidate, outcome, descriptionChanged: !!changed, previousCharacters: event.description.length, characters: (changed || event.description).length,
        ...(conflict ? { conflict } : {}),
        ...(latest.status !== 200 ? { latestAttempt: { status: latest.status, error: latest.error, fetchedAt: latest.fetchedAt } } : {}),
        ...(factPatches[event.id] ? { factChanges: Object.fromEntries(Object.entries(factPatches[event.id]).filter(([field, value]) => field !== 'sourceVerification' && JSON.stringify(event[field as keyof Web3Event]) !== JSON.stringify(value)).map(([field, value]) => [field, value])) } : {}),
        source: { url: snapshot.url, fetchedAt: snapshot.fetchedAt, status: snapshot.status, ...(snapshot.error ? { error: snapshot.error } : {}),
          ...(sourceAvailable ? { sha256: hash(snapshot.body) } : {}) },
        ...(changed && !sourceAvailable ? { note: 'Edited previously verified organizer copy only; primary refresh unavailable.', previousCopySha256: hash(event.description) } : {}),
        ...(event.sourceVerification?.eventId?.startsWith('calev-') && snapshot.error ? { note: 'Legacy verification stores a calendar-entry ID rather than an event ID; identity requires review.' } : {}),
        ...(event.slug?.startsWith('ibt-') && event.slug !== 'ibt-mumbai' ? { note: 'City ticket URL returned tour-wide content; city-specific agenda and venue remain unverified.' } : {}),
      };
    });
    const summary = { reviewed: records.length, slugMigrations: records.filter(e => e.oldSlug !== e.slug).length, descriptionChanges: records.filter(e => e.descriptionChanged).length,
      outcomes: Object.fromEntries([...new Set(records.map(e => e.outcome))].map(outcome => [outcome, records.filter(e => e.outcome === outcome).length])) };
    fs.writeFileSync('content/events/current-catalog-audit.json', `${JSON.stringify({ summary, records }, null, 2)}\n`);
    console.log(JSON.stringify(summary));
    return;
  }
  if (process.argv.includes('--sources')) {
    for (const event of events as Web3Event[]) {
      if (event.description.length >= 600) continue;
      const recent = JSON.parse(fs.readFileSync(`${directory}/${event.id}.json`, 'utf8'));
      let snapshot = recent;
      const cached = `.cache/mumbai-event-audit/${hash(recent.url)}.json`;
      if (!recent.description && fs.existsSync(cached)) snapshot = JSON.parse(fs.readFileSync(cached, 'utf8'));
      if (snapshot.status === 200 && /https:\/\/(luma.com|lu.ma)\//.test(snapshot.url)) {
        const $ = load(snapshot.body);
        const data = object(object(object(object(JSON.parse($('#__NEXT_DATA__').text())).props).pageProps).initialData).data;
        const facts = lumaSourcePatch({ url: snapshot.url, fetchedAt: snapshot.fetchedAt, method: 'luma-page', data: object(data) });
        console.log(JSON.stringify({ slug: event.slug, source: facts.description, hosts: facts.hosts, start: facts.startDate, end: facts.endDate, approval: facts.approvalRequired, hidden: facts.locationHidden, price: facts.price, fetchedAt: snapshot.fetchedAt }));
      } else console.log(JSON.stringify({ slug: event.slug, source: snapshot.description, reason: snapshot.reason }));
    }
    return;
  }
  if (!process.argv.includes('--fetch')) {
    for (const event of events) console.log(JSON.stringify({ id: event.id, slug: event.slug, name: event.name, chars: event.description.length, description: event.description.length < 600 ? event.description : undefined, url: event.url }));
    console.log(`Total: ${events.length}`);
    return;
  }
  fs.mkdirSync(directory, { recursive: true });
  const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : undefined;
  const queue = events.filter(event => !only || event.slug === only || event.aliases?.includes(only)) as Web3Event[];
  const rateLimited = new Set<string>();
  await Promise.all(Array.from({ length: 1 }, async () => {
    while (queue.length) {
      const event = queue.shift()!;
      const url = event.descriptionSource?.url || event.sourceVerification?.url || event.url;
      const file = `${directory}/${event.id}.json`;
      if (fs.existsSync(file)) {
        const previous = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (!process.argv.includes('--retry-unavailable') || previous.status === 200) continue;
      }
      const fetchedAt = new Date().toISOString();
      if (rateLimited.has(new URL(url).hostname)) {
        if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ id: event.id, url, fetchedAt, error: 'Skipped after host rate limit' }));
        continue;
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (response.status === 429) rateLimited.add(new URL(url).hostname);
        const body = await response.text();
        let description = '', facts: Partial<Web3Event> = {}, reason = `HTTP ${response.status}`;
        if (response.ok) {
          if (/https:\/\/(luma.com|lu.ma)\//.test(url)) {
            const $ = load(body);
            const data = object(object(object(object(JSON.parse($('#__NEXT_DATA__').text())).props).pageProps).initialData).data;
            facts = lumaSourcePatch({ url, fetchedAt, method: 'luma-page', data: object(data) });
            if (event.sourceVerification?.eventId && facts.sourceVerification?.eventId !== event.sourceVerification.eventId) {
              const legacyCalendar = event.sourceVerification.eventId.startsWith('calev-') && cleanPublishText(facts.name || '') === event.name && Date.parse(facts.startDate!) === Date.parse(event.startDate);
              if (!legacyCalendar) {
                fs.writeFileSync(file, JSON.stringify({ id: event.id, url, resolvedUrl: response.url, fetchedAt, status: response.status, sha256: hash(body), description: facts.description, identity: { name: facts.name, startDate: facts.startDate, eventId: facts.sourceVerification?.eventId }, reason: 'Event identity mismatch', body }));
                console.log(`${event.slug}: identity requires review (${facts.name}, ${facts.startDate})`);
                continue;
              }
            }
            description = facts.description || '';
          } else {
            const extracted = extractOfficialEventDescription(body, event);
            description = extracted.result?.description || '';
            reason = extracted.reason || 'extracted';
          }
        }
        fs.writeFileSync(file, JSON.stringify({ id: event.id, url, resolvedUrl: response.url, fetchedAt, status: response.status, sha256: hash(body), description, facts, reason, body }));
        console.log(`${event.slug}: ${response.status}, ${description.length} source characters`);
      } catch (error) {
        fs.writeFileSync(file, JSON.stringify({ id: event.id, url, fetchedAt, error: String(error) }));
        console.log(`${event.slug}: ${error}`);
      }
    }
  }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
