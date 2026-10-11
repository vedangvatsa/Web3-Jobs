import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { EVENT_SOURCES } from '../src/lib/event-sources';
import { getEventSlug, type Web3Event } from '../src/lib/events';
import { cleanPublishText } from '../src/lib/noslop';
import type { EventSlugHistory } from '../src/lib/event-slug-assignment';
import { fetchLumaCalendarEntries } from './lib/luma-calendar.mjs';
import { lumaSourcePatch, object } from './luma-source-record';

type Review = { title: string; description: string; matchUrls?: string[]; conflict?: string; note?: string; hideLocation?: boolean };
type Snapshot = { url: string; status: number; fetchedAt: string; body: string; retrievedVia?: string };
type CalendarEntry = { api_id: string; platform: string; event: { api_id?: string; url: string; name: string; start_at: string; end_at?: string } };
type External = { url: string; id: string; name: string; start: string; end: string; contains: string[]; description: string; venue?: string; reader?: boolean; approval?: boolean; matchUrls?: string[] };
const SHEET = 'https://docs.google.com/spreadsheets/d/1NZ09OVlqElsM64oUm-8i1yh_A-U0p39BJECthwHCsLA/htmlview/sheet?headers=true&gid=0';
const CACHE = '.cache/mumbai-event-audit';
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const readJson = <T,>(file: string): T => JSON.parse(fs.readFileSync(file, 'utf8')) as T;
const writeJson = (file: string, value: unknown) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const key = (url?: string | null): string => {
  try { const u = new URL(url!); return `${u.hostname.replace(/^www\./, '').replace('lu.ma', 'luma.com')}${u.pathname.replace(/\/$/, '')}`.toLowerCase(); } catch { return ''; }
};
const urls = (e: Web3Event) => [e.url, e.registrationUrl, e.website, e.sourceVerification?.url, e.descriptionSource?.url].filter(Boolean).map(u => key(u));
const privacyFields: Array<keyof Web3Event> = ['venueName', 'streetAddress', 'addressLocality', 'addressRegion', 'addressCountry', 'postalCode', 'neighborhood', 'coordinates'];
const external: External[] = [
  { url: 'https://konfhub.com/india-blockchain-tour-2026-mumbai-node', id: 'premier-ibt-mumbai-2026', name: 'India Blockchain & AI Tour 2026 - Mumbai', start: '2026-10-31T12:00:00+05:30', end: '2026-10-31T18:00:00+05:30', contains: ['India Blockchain Tour 2026 - Mumbai Node', '2026-10-31T12:00:00+05:30', '2026-10-31T18:00:00+05:30'], description: 'Octaloop hosts the Mumbai stop of India Blockchain & AI Tour on October 31. The ticketing page lists 12:00 to 18:00 IST. The organizer has not announced the venue.', matchUrls: ['https://indiablockchaintour.com/2026-nodes/mumbai'] },
  { url: 'https://indiablockchainweek.com/future-asset-forum', id: 'ibw-official-future-asset-forum-2026', name: 'IBW Future Asset Forum 2026', start: '2026-11-01', end: '2026-11-02', contains: ['Future Asset Forum', '01–02 November 2026', 'Fairmont Mumbai'], description: 'Hashed Emergent and Mugafi convene Future Asset Forum at Fairmont Mumbai on November 1 and 2. The invitation-only forum covers ownership, rights, AI and financing in sports and entertainment. Published session titles are provisional.', venue: 'Fairmont Mumbai', approval: true },
  { url: 'https://www.indiablockchainweek.com/institutional-forum', id: 'ibw-official-ibw-institutional-forum-11-02', name: 'IBW Institutional Forum', start: '2026-11-01', end: '2026-11-02', contains: ['1–2 November 2026', 'Fairmont Mumbai', 'Chatham House'], description: 'Hashed Emergent hosts a two-day, invitation-only forum within India Blockchain Week at Fairmont Mumbai. The program covers institutional blockchain adoption, tokenization, settlement and programmable money. Discussions follow the Chatham House Rule.', venue: 'Fairmont Mumbai', approval: true },
  { url: 'https://indiablockchainweek.com/', id: 'premier-indiabw-2026', name: 'India Blockchain Week 2026', start: '2026-11-01', end: '2026-11-02', contains: ['2026', 'Mumbai', 'Fairmont'], description: 'India Blockchain Week Conference takes place at Fairmont Mumbai on November 1 and 2, 2026. Hashed Emergent organizes the conference, with talks and discussions about blockchain and the Indian Web3 ecosystem.', venue: 'Fairmont Mumbai' },
  { url: 'https://devcon.org/en/', id: 'premier-devcon-2026', name: 'Devcon 2026', start: '2026-11-03', end: '2026-11-06', contains: ['3–6 November, 2026', 'Ethereum Foundation', 'Bandra Kurla Complex'], description: 'The Ethereum Foundation hosts Devcon 8 at Jio World Centre in Mumbai from November 3 to 6. The four-day program includes talks, workshops and community spaces covering Ethereum, cryptography, privacy, security and open-source systems.', venue: 'Jio World Centre', matchUrls: ['https://devcon.org/'] },
  { url: 'https://ethindia.co/', id: 'premier-ethindia-2026', name: 'ETHIndia 2026', start: '2026-11-04', end: '2026-11-04', contains: ['04 November', 'one-day conference at Devcon'], description: 'ETHIndia returns as a one-day conference at Devcon on November 4 in Mumbai, focused on Ethereum in India. The organizer directs attendees to Devcon tickets; speakers are still to be announced.' },
  { url: 'https://ethglobal.com/events/pragma-mumbai', id: 'ibw-official-pragma-mumbai-11-05', name: 'Pragma Mumbai', start: '2026-11-06', end: '2026-11-06', reader: true, contains: ['November 6, 2026', 'Jio World Convention Centre', 'No parallel sessions'], description: 'ETHGlobal hosts Pragma Mumbai on November 6 at Jio World Convention Centre. The summit brings founders and builders together for talks and discussions, with no parallel sessions. Clock times have not been verified.', venue: 'Jio World Convention Centre' },
  { url: 'https://ethglobal.com/events/mumbai', id: 'premier-ethmumbai-2026', name: 'ETHGlobal Mumbai 2026', start: '2026-11-05', end: '2026-11-07', reader: true, contains: ['November 5 – 7, 2026', 'Jio World Convention Centre', 'Technical mentorship'], description: 'ETHGlobal Mumbai is a hackathon at Jio World Convention Centre from November 5 to 7. Participants can start a new project, extend open-source software or build an open-source feature for an existing product. The event includes technical mentorship and workshops.', venue: 'Jio World Convention Centre' },
  { url: 'https://unchainedsummit.com/india/', id: 'premier-unchained-summit-india-2026', name: 'Unchained Summit India 2026', start: '2026-11-05', end: '2026-11-06', contains: ['05 - 06 November 2026', 'Courtyard by Marriott Mumbai International Airport'], description: 'Unchained Summit India takes place at Courtyard by Marriott Mumbai International Airport on November 5 and 6. Day one focuses on markets, finance and digital assets; day two covers Web3 infrastructure and emerging technology. Daily clock times have not been verified.', venue: 'Courtyard by Marriott Mumbai International Airport' },
];

async function snapshot(url: string, reader = false): Promise<Snapshot> {
  const file = path.join(CACHE, `${hash(url + (reader ? ':reader' : ''))}.json`);
  if (fs.existsSync(file)) return readJson<Snapshot>(file);
  if (!process.argv.includes('--fetch')) throw Error(`Missing snapshot: ${url}. Run with --fetch.`);
  const retrievedVia = reader ? `https://r.jina.ai/${url}` : undefined;
  const response = await fetch(retrievedVia || url, { signal: AbortSignal.timeout(90_000) });
  const result = { url, status: response.status, fetchedAt: new Date().toISOString(), body: await response.text(), ...(retrievedVia ? { retrievedVia } : {}) };
  if (reader && !result.body.includes(`URL Source: ${url}`)) throw Error(`Reader identity mismatch: ${url}`);
  writeJson(file, result);
  return result;
}
function pageData(s: Snapshot) {
  if (s.status !== 200) throw Error(`${s.url}: HTTP ${s.status}`);
  const $ = load(s.body);
  return object(object(object(object(JSON.parse($('#__NEXT_DATA__').text())).props).pageProps).initialData);
}
function evidence(s: Snapshot, description: string, title: string): Web3Event['descriptionSource'] {
  return { url: s.url, fetchedAt: s.fetchedAt, method: 'reviewed-primary-sources', pageTitle: title, sha256: hash(description), evidence: [{ url: s.url, fetchedAt: s.fetchedAt, sha256: hash(s.body), ...(s.retrievedVia ? { retrievedVia: s.retrievedVia } : {}) }] };
}

async function main() {
  fs.mkdirSync(CACHE, { recursive: true });
  if (process.argv.includes('--report')) {
    const file = 'content/events/mumbai-audit-report.json';
    const report = readJson<{ records: Array<Record<string, unknown>>; sheet: { rows: Array<{ row: number; url: string; ids: string[]; note?: string; published?: unknown[] }> }; [key: string]: unknown }>(file);
    const runtime = readJson<Web3Event[]>('content/events-runtime.json');
    const baseline = readJson<Web3Event[]>(`${CACHE}/runtime-before.json`);
    const find = (ids: string[], eventId?: unknown) => runtime.filter(e => ids.includes(e.id) || Boolean(eventId && e.sourceVerification?.eventId === eventId));
    for (const record of report.records) {
      record.published = find(record.ids as string[], record.eventId).map(e => ({ id: e.id, slug: e.slug }));
      if (record.status === 'added') record.before = [];
    }
    for (const row of report.sheet.rows) {
      if ([9, 14].includes(row.row)) row.ids = ['premier-indiabw-2026'];
      row.published = find(row.ids).map(e => ({ id: e.id, slug: e.slug }));
    }
    const unresolved = report.records.filter(r => ['added', 'verified-updated'].includes(String(r.status)) && (r.published as unknown[]).length !== 1);
    if (unresolved.length) throw Error(`Verified records must map to one canonical event: ${JSON.stringify(unresolved.map(r => ({ url: r.url, published: r.published })))}`);
    report.publication = {
      runtimeEvents: runtime.length,
      baselineEvents: baseline.length,
      addedPublished: runtime.filter(e => !baseline.some(b => b.id === e.id)).map(e => ({ id: e.id, slug: e.slug })),
      removedPublished: baseline.filter(e => !runtime.some(n => n.id === e.id)).map(e => ({ id: e.id, slug: e.slug, aliasOf: runtime.find(n => n.aliases?.includes(e.slug!))?.id || null })),
      verifiedCanonicalEvents: report.records.filter(r => ['added', 'verified-updated'].includes(String(r.status))).length,
    };
    report.coverage = ['devcon', 'ibw'].map(slug => {
      const calendar = readJson<{ entries: CalendarEntry[] }>(`${CACHE}/${slug}-calendar.json`);
      const members = calendar.entries.map(entry => {
        const url = entry.event.url.startsWith('http') ? entry.event.url : `https://luma.com/${entry.event.url}`;
        const record = report.records.find(r => key(String(r.url)) === key(url));
        if (!record) throw Error(`Unaccounted calendar entry: ${url}`);
        return { entryId: entry.api_id, url, platform: entry.platform, status: record.status, published: record.published, existedBefore: Array.isArray(record.before) && record.before.length > 0 };
      });
      return { source: `https://luma.com/${slug}`, count: members.length, catalogMatchesBefore: members.filter(e => e.existedBefore).length, published: members.filter(e => (e.published as unknown[]).length === 1).length, excluded: members.filter(e => (e.published as unknown[]).length === 0).length, members };
    });
    report.team1 = { source: 'https://luma.com/team1mumbai', kind: 'single-event', count: 1, published: find(['india-luma-team1mumbai']).map(e => ({ id: e.id, slug: e.slug })), overlap: 'Already counted in IBW calendar' };
    report.sheetCoverage = { rows: report.sheet.rows.length, uniquePublishedEvents: new Set(report.sheet.rows.flatMap(r => (r.published as Array<{id:string}>).map(e => e.id))).size, excludedRows: report.sheet.rows.filter(r => !r.published?.length).map(r => r.row), registrationTbdRows: [7, 21], rawLinkedUrls: 31, rawRowsWithoutLinks: 4 };
    const audited = runtime.filter(e => report.records.some(r => (r.ids as string[]).includes(e.id)));
    report.privacy = { publicCalendarEvents: audited.length, hiddenAddress: audited.filter(e => e.locationHidden).length, approvalRequired: audited.filter(e => e.approvalRequired).length, privateVisibility: audited.filter(e => e.visibility === 'private').length };
    writeJson(file, report);
    console.log(JSON.stringify(report.publication));
    return;
  }
  const plan = readJson<{ luma: Record<string, Review> }>('content/events/mumbai-reviewed-facts.json');
  const sources = EVENT_SOURCES.map(s => ({ file: s.file, events: readJson<Web3Event[]>(`content/events/sources/${s.file}`) }));
  const baselinePath = path.join(CACHE, 'runtime-before.json');
  if (!fs.existsSync(baselinePath)) fs.copyFileSync('content/events-runtime.json', baselinePath);
  const baseline = readJson<Web3Event[]>(baselinePath);
  const all = sources.flatMap(s => s.events);
  const published = new Map(baseline.map(e => [e.id, e]));
  const calendarRows: Record<string, CalendarEntry[]> = {};
  const calendars: Array<Record<string, unknown>> = [];
  const records: Array<Record<string, unknown>> = [];
  for (const slug of ['devcon', 'ibw']) {
    const s = await snapshot(`https://luma.com/${slug}`);
    const id = String(object(object(pageData(s).data).calendar).api_id);
    const file = path.join(CACHE, `${slug}-calendar.json`);
    if (!fs.existsSync(file)) {
      if (!process.argv.includes('--fetch')) throw Error('Calendar snapshot missing');
      writeJson(file, { ...await fetchLumaCalendarEntries(id), fetchedAt: new Date().toISOString() });
    }
    const result = readJson<{ entries: CalendarEntry[]; pages: number; fetchedAt: string }>(file);
    calendarRows[slug] = result.entries;
    calendars.push({ url: s.url, calendarId: id, pages: result.pages, entries: result.entries.length, external: result.entries.filter(e => e.platform === 'external').length, paginationExhausted: true, fetchedAt: result.fetchedAt });
  }
  const matches = (url: string, extra: string[] = [], id?: string) => all.filter(e => e.id === id || urls(e).some(u => [url, ...extra].map(key).includes(u)));
  const preserve = (e: Web3Event) => ({ id: e.id, slug: published.get(e.id)?.slug || e.slug || getEventSlug(e), url: e.url, ...(e.registrationUrl ? { registrationUrl: e.registrationUrl } : {}) });
  const add = (e: Web3Event) => { sources.find(s => s.file === 'ibw-side-events.json')!.events.push(e); all.push(e); };
  const lumaEntries = new Map<string, CalendarEntry>();
  for (const entry of Object.values(calendarRows).flat()) if (entry.platform === 'luma') lumaEntries.set(entry.event.url.toLowerCase(), entry);
  for (const [slug, entry] of lumaEntries) {
    const review = plan.luma[slug];
    if (!review) throw Error(`Unreviewed calendar entry: ${slug}`);
    const url = `https://luma.com/${entry.event.url}`;
    const s = await snapshot(url);
    const data = object(pageData(s).data);
    const patch = lumaSourcePatch({ url, fetchedAt: s.fetchedAt, method: 'luma-page', data });
    if (patch.sourceVerification?.eventId !== entry.event.api_id || !patch.name?.includes(review.title)) throw Error(`Identity changed: ${url}`);
    patch.description = review.description;
    patch.name = cleanPublishText(patch.name);
    patch.descriptionSource = evidence(s, review.description, patch.name);
    patch.sideEventFor = ['ibw', ...(calendarRows.devcon.some(e => e.event.api_id === entry.event.api_id) || /devcon/i.test(patch.name + review.description) ? ['devcon'] : [])];
    if (review.hideLocation) patch.locationHidden = true;
    if (patch.locationHidden) {
      for (const field of privacyFields) delete patch[field];
      patch.location = [patch.city, patch.country].filter(Boolean).join(', ') || 'Location to be announced';
    }
    let existing = matches(url, review.matchUrls);
    const old = existing.map(e => ({ id: e.id, slug: published.get(e.id)?.slug || e.slug, startDate: e.startDate, endDate: e.endDate, name: e.name }));
    const added = !existing.length;
    if (added) {
      const e: Web3Event = { id: `india-luma-${slug}`, slug, name: patch.name, description: '', startDate: patch.startDate!, location: patch.location!, url, coverImage: null, source: 'luma-india' };
      add(e); existing = [e];
    }
    for (const e of existing) {
      const identity = preserve(e);
      Object.assign(e, patch, identity);
      if (patch.locationHidden) for (const field of privacyFields) delete e[field];
      if (review.conflict) {
        e.publicationStatus = 'needs-review';
        e.sourceReview = { checkedAt: s.fetchedAt, url, reason: review.conflict };
      }
    }
    records.push({ url, eventId: entry.event.api_id, status: review.conflict ? 'conflict-excluded' : added ? 'added' : 'verified-updated', ids: existing.map(e => e.id), before: old, startDate: patch.startDate, endDate: patch.endDate, timezone: patch.timezone, locationHidden: patch.locationHidden, approvalRequired: patch.approvalRequired, visibility: patch.visibility, reason: review.conflict || review.note, fetchedAt: s.fetchedAt });
  }
  for (const item of external) {
    const s = await snapshot(item.url, item.reader);
    const $ = load(s.body);
    const text = `${$('body').text()} ${$('img').map((_, e) => $(e).attr('alt') || '').get().join(' ')} ${s.body}`;
    if (s.status !== 200 || item.contains.some(t => !text.includes(t))) throw Error(`External evidence mismatch: ${item.url}`);
    let existing = matches(item.url, item.matchUrls, item.id).filter(e => {
      if (e.id === item.id) return true;
      if (!e.startDate.startsWith('2026-')) return false;
      // The IBW homepage is also a placeholder URL on unrelated side-event rows.
      return item.id !== 'premier-indiabw-2026' || /india blockchain week/i.test(e.name);
    });
    const added = !existing.some(e => e.id === item.id);
    if (added) { const e: Web3Event = { id: item.id, name: item.name, description: '', startDate: item.start, location: 'Mumbai, India', url: item.url, coverImage: null, source: 'ibw-official' }; add(e); existing = [...existing, e]; }
    const before = existing.filter(e => !(added && e.id === item.id)).map(e => ({ id: e.id, slug: published.get(e.id)?.slug || e.slug, startDate: e.startDate, endDate: e.endDate }));
    for (const e of existing) {
      const identity = preserve(e);
      Object.assign(e, { name: item.name, description: item.description, startDate: item.start, endDate: item.end, timezone: 'Asia/Kolkata', city: 'Mumbai', country: 'India', location: item.venue ? `${item.venue}, Mumbai, India` : 'Mumbai, India', sideEventFor: ['ibw', 'devcon'], attendanceMode: 'offline', descriptionSource: evidence(s, item.description, item.name) }, identity);
      for (const field of privacyFields) delete e[field];
      if (item.venue) e.venueName = item.venue;
      if (item.approval) e.approvalRequired = true;
    }
    records.push({ url: item.url, status: added ? 'added' : 'verified-updated', ids: existing.map(e => e.id), before, startDate: item.start, endDate: item.end, timezone: 'Asia/Kolkata', clockTimesVerified: item.start.includes('T'), fetchedAt: s.fetchedAt, retrievedVia: s.retrievedVia });
  }

  const sheet = await snapshot(SHEET);
  if (sheet.status !== 200) throw Error('Sheet unavailable');
  const $ = load(sheet.body);
  const sheetRows: Array<{ row: number; date: string; start: string; end: string; name: string; url: string; ids: string[]; note?: string }> = [];
  $('table.waffle tbody tr').each((_, r) => {
    const cells = $(r).children('td');
    if (!/^(Oct|Nov)-/.test(cells.eq(0).text())) return;
    const a = cells.eq(5).find('a').attr('href');
    let url = a ? new URL(a).searchParams.get('q') || a : '';
    const row = Number($(r).children('th').text());
    let note: string | undefined;
    if (row === 38) { url = 'https://luma.com/5u1evsou'; note = 'Sheet link absent; matched organizer and title to primary page in IBW calendar.'; }
    if (row === 44) { url = 'https://luma.com/np3wx7v5'; note = 'Sheet link absent; matched MONEY MAKER in calendar.'; }
    if (row === 43) { url = 'https://ethglobal.com/events/mumbai'; note = 'Sheet incorrectly links MONEY MAKER. Mapped by event identity to the single ETHGlobal Mumbai record.'; }
    const ids = [9, 14].includes(row) ? ['premier-indiabw-2026'] : matches(url, url.includes('devcon.org') ? ['https://devcon.org/'] : []).map(e => e.id);
    sheetRows.push({ row, date: cells.eq(0).text(), start: cells.eq(1).text(), end: cells.eq(2).text(), name: cells.eq(3).text(), url, ids, note });
  });
  for (const [row, id, name, date, description] of [
    [7, 'ibw-official-ibw2026-pre-conference-vip-night-10-31', 'IBW2026 Pre-Conference VIP Night', '2026-10-31', 'Hashed Emergent lists a pre-conference VIP night in the official India Blockchain Week spreadsheet, from 19:00 to 23:00 IST on October 31. A registration link and venue have not been announced.'],
    [21, 'ibw-official-ibw-official-after-party-11-02', 'IBW Official After-Party', '2026-11-02', 'Hashed Emergent lists the IBW Official After-Party in its event spreadsheet, from 19:00 to 23:00 IST on November 2. The registration link remains to be announced.'],
  ] as const) {
    const e = all.find(e => e.id === id)!;
    Object.assign(e, { ...preserve(e), name, description, startDate: `${date}T19:00:00+05:30`, endDate: `${date}T23:00:00+05:30`, timezone: 'Asia/Kolkata', location: 'Mumbai, India', registrationAvailability: 'to-be-announced', descriptionSource: evidence(sheet, description, 'India Blockchain Week (IBW) 2026 Events') });
    for (const field of privacyFields) delete e[field];
    const sr = sheetRows.find(r => r.row === row)!; sr.ids = [id]; sr.note = 'Organizer spreadsheet only; registration TBD. No primary event page available.';
  }
  for (const slug of ['multichaindaydevconmumbai', 'u1m2yuic', '188n1ye7']) {
    const url = `https://luma.com/${slug}`;
    const s = await snapshot(url);
    if (s.status !== 404) throw Error(`Re-review newly available page: ${url}`);
    const existing = matches(url);
    for (const e of existing) { e.publicationStatus = 'needs-review'; e.sourceReview = { url, checkedAt: s.fetchedAt, reason: 'Primary page returns HTTP 404. Date and availability cannot be confirmed; this is not evidence of cancellation.' }; }
    records.push({ url, status: 'unavailable-excluded', httpStatus: s.status, ids: existing.map(e => e.id), fetchedAt: s.fetchedAt });
  }
  for (const url of ['https://t.ly/sEaNC', 'https://t.ly/gIAzG']) {
    const s = await snapshot(url);
    records.push({ url, status: 'unverified-excluded', httpStatus: s.status, reason: 'Shortener security challenge prevents resolving the primary event. No record added from calendar-only dates.', ids: [] });
  }
  const apply = process.argv.includes('--apply');
  if (apply) {
    const history = readJson<EventSlugHistory>('content/event-slug-history.json');
    for (const [id, canonicalId] of [
      ['ibw-official-defi-security-summit-day-2-11-02', 'ibw-official-defi-security-summit-day-1-11-01'],
      ['ibw-official-unchained-summit-day-2-11-06', 'premier-unchained-summit-india-2026'],
    ]) {
      if (!history[id] || !history[canonicalId]) throw Error(`Missing published identity for merge: ${id}`);
      history[id].canonicalId = canonicalId;
    }
    writeJson('content/event-slug-history.json', history);
  }
  if (apply) for (const source of sources) {
    const file = `content/events/sources/${source.file}`;
    const output = `${JSON.stringify(source.events, null, 2)}\n`;
    if (JSON.stringify(readJson(file)) !== JSON.stringify(source.events)) fs.writeFileSync(file, output);
  }
  const runtime = readJson<Web3Event[]>('content/events-runtime.json');
  for (const record of records) record.published = runtime.filter(e => (record.ids as string[]).includes(e.id) || (record.eventId && e.sourceVerification?.eventId === record.eventId)).map(e => ({ id: e.id, slug: e.slug }));
  for (const row of sheetRows) {
    const canonical = runtime.find(e => row.ids.includes(e.id));
    if (canonical) row.note = [row.note, `Canonical /${canonical.slug}`].filter(Boolean).join(' ');
  }
  const reportPath = 'content/events/mumbai-audit-report.json';
  if (apply && fs.existsSync(reportPath)) {
    const original = readJson<{ records: Array<Record<string, unknown>> }>(reportPath);
    for (const record of records) {
      const previous = original.records.find(r => r.url === record.url);
      if (previous) { record.before = previous.before; record.status = previous.status; }
    }
  }
  const report = { generatedAt: new Date().toISOString(), applied: apply, scope: 'All public future calendar entries at fetch time. Past calendar entries are excluded and were not enumerated. Public pages for approval-only events are included; hidden addresses are omitted.', calendars, overlap: calendarRows.devcon.filter(e => calendarRows.ibw.some(b => b.event.api_id === e.event.api_id)).length, lumaPrimaryPages: lumaEntries.size, sheet: { url: SHEET, fetchedAt: sheet.fetchedAt, populatedRows: sheetRows.length, rows: sheetRows }, records };
  writeJson(apply || process.argv.includes('--report') ? 'content/events/mumbai-audit-report.json' : `${CACHE}/preview.json`, report);
  console.log(JSON.stringify({ calendars, records: records.length, added: records.filter(r => r.status === 'added').length, conflicts: records.filter(r => r.status === 'conflict-excluded').length, applied: apply, sheetRows: sheetRows.length }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
