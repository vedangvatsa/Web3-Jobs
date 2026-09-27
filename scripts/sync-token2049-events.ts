import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import * as cheerio from 'cheerio';
import type { Web3Event } from '../src/lib/events';
import { getEventBaseSlug } from '../src/lib/events';
import { loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { lumaSourcePatch, object, type LumaSnapshot } from './luma-source-record';
import { extractOfficialEventDescription } from './official-event-description';
import { discoverToken2049, fetchPublic, nextPageData, registrationUrl, urlIdentity, type DiscoveryEvent } from './lib/token2049-discovery';
import { downloadCover } from './lib/event-image-utils.mjs';
import sourceConfig from '../content/events/token2049-sources.json';
import reviewedFacts from '../content/events/token2049-reviewed-facts.json';
import { hasEventEnded } from './lib/event-dates.mjs';

const root = process.cwd();
const output = path.join(root, 'content/events/sources/token2049-discovered.json');
const cache = path.join(root, '.cache/event-verification/token2049');
const write = process.argv.includes('--write');
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const str = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const nameKey = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const inactive = (name: string) => /\bcancel(?:led|ed)\b|new-design-test|\btest event\b/i.test(name);

type Group = { url: string; entries: DiscoveryEvent[]; calendarEntryId?: string };
type Receipt = { url: string; name: string; sources: string[]; status: string; reason?: string; slug?: string; eventId?: string; sourceId?: string };
type Verified = { patch: Partial<Web3Event>; primaryUrl: string; fetchedAt: string; description: string; sourceHash: string; luma?: boolean; reviewed?: boolean };

export function existingMatch(entries: DiscoveryEvent[], events: Web3Event[], patch?: Partial<Web3Event>) {
  const ids = [patch?.sourceVerification?.eventId, ...entries.flatMap(entry => [entry.id, entry.lumaId])].filter(Boolean).map(value => value!.toLowerCase());
  const urls = new Set([...entries.map(entry => urlIdentity(entry.url)), ...[patch?.url, patch?.registrationUrl].filter(Boolean).map(value => urlIdentity(value!))].filter(value => value && value !== urlIdentity(sourceConfig.officialWeek)));
  const named = [...entries, ...(patch?.name && patch.startDate ? [{ name: patch.name, startDate: patch.startDate }] : [])];
  const day = (value?: string) => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' }) : '';
  const mainConference = events.find(event => event.slug === 'token2049');
  if (mainConference && named.some(entry => /^TOKEN2049 Singapore\s*[-–—]\s*Day \d+$/i.test(entry.name)
    && day(entry.startDate) >= day(mainConference.startDate)
    && day(entry.startDate) <= day(mainConference.endDate || mainConference.startDate))) return mainConference;
  return events.find(event => ids.some(id => event.sourceVerification?.eventId?.toLowerCase() === id || event.id.toLowerCase().includes(id))
    || [event.url, event.registrationUrl, event.website].some(url => url && urls.has(urlIdentity(url)))
    || named.some(entry => nameKey(entry.name) === nameKey(event.name) && day(entry.startDate) && day(entry.startDate) === day(event.startDate)));
}

export function usefulDescription(raw: string): string {
  const promotional = /\b(?:unparalleled|unforgettable|ultimate|game.chang|revolution|cutting.edge|incredible|don't miss|join|welcome|discover|secure your spot|elevate|unlock|ecosystem|transformative|epic|unmissable|exclusive|best|world.class|innovative|innovation|redefin|reshap|shaping|meaningful|leading|premium|next wave|great|perfect|curated|high.energy|good people|good energy|opportunities|connections|future|frontier|new era|movement|we look forward|pleased to|vision)\b/i;
  const factual = /\b(?:agenda|panel|fireside|roundtable|workshop|demo|presentation|speaker|session|discuss|focus|topic|pitch|format|dress code|food|drinks|lunch|dinner|brunch|breakfast|pool|yacht|run|walk|pickleball|padel|route|RSVP|approval|invitation|invite.only|eligib|required|bring|boarding|docked|sail|entry|pass|registration)\b/i;
  const boilerplate = /\b(?:intimate|crafted drinks|meaningful conversations|relationship building|no hype|days run full|with no rush|keep in touch|right people|no panels.*no pitches|that stack comes together|a dinner may last|privacy policy|process your registration|trusted introductions|conference noise|discreet conversation)\b|make TOKEN2049 worth|^Since 20\d\d|^Session \d.*https?:|^Our team will confirm/i;
  const lines: string[] = [];
  let excludedSection = false;
  for (const block of raw.replace(/<[^>]+>/g, ' ').replace(/[\u200b\u200c\ufeff]/g, '').split(/\n+/)) {
    if (/^\s*#{1,6}\s/.test(block)) {
      excludedSection = /\b(?:about (?!the event)|organizers?|hosts?|sponsors?|partners?|follow)\b/i.test(block);
      continue;
    }
    if (/^\s*About\s+(?!the event).{1,70}$/i.test(block)) { excludedSection = true; continue; }
    if (excludedSection) continue;
    const clean = block.replace(/^\s*(?:>|[•*-])\s*/, '').replace(/\*\*/g, '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();
    for (const sentence of clean.split(/(?<=[.!?])\s+(?=[A-Z0-9])/)) {
      if (sentence.length < 28 || sentence.length > 550 || promotional.test(sentence) || boilerplate.test(sentence) || /web3meetups\.xyz/i.test(sentence)) continue;
      if (/^(?:https?:|X:|Telegram:|copyright|all rights|location:)/i.test(sentence)) continue;
      if (factual.test(sentence) || /^\d{1,2}[:.]\d{2}\s*(?:[ap]m)?\s*[-–—|]/i.test(sentence)) lines.push(sentence);
    }
  }
  return [...new Set(lines)].slice(0, 4).join('\n\n');
}

function describe(event: Web3Event, organizerText: string, reviewed = false): string {
  const sourceCopy = reviewed ? organizerText : usefulDescription(organizerText);
  const timezone = event.timezone || 'Asia/Singapore';
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(event.startDate);
  const date = dateOnly ? new Date(event.startDate).toLocaleDateString('en-GB', { dateStyle: 'long', timeZone: 'UTC' }) : new Date(event.startDate).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short', timeZone: timezone });
  const host = event.hosts?.join(', ') || event.organizer?.name;
  const opening = `${event.name} is scheduled for ${date}${dateOnly ? '' : ` (${timezone})`}${event.attendanceMode === 'online' ? ' online' : event.city || event.country ? ` in ${event.city || event.country}` : ''}.${host ? ` Hosted by ${host}.` : ''}`;
  const registration = [event.registrationAvailability === 'invite-only' ? 'Attendance is by invitation according to the published schedule.' : event.approvalRequired ? 'Registration requires host approval.' : '', event.locationHidden ? 'The organizer shares the exact location with approved guests.' : '', event.price === 'Free' ? 'Registration is listed as free.' : ''].filter(Boolean).join(' ');
  return [reviewed ? '' : opening, sourceCopy, registration].filter(Boolean).join('\n\n');
}

async function verify(group: Group, depth = 0): Promise<Verified> {
  const file = path.join(cache, `${hash(group.calendarEntryId || group.url)}.json`);
  if (group.calendarEntryId) {
    const seed = group.entries.find(entry => entry.authoritativeSchedule && entry.startDate)!;
    if (!seed) throw new Error('Calendar-only entry has no verified schedule');
    return { primaryUrl: sourceConfig.officialWeek, fetchedAt: new Date().toISOString(), description: seed.description || '', sourceHash: hash(JSON.stringify(seed)), patch: {
      name: seed.name, startDate: seed.startDate, endDate: seed.endDate, timezone: seed.timezone,
      city: seed.city, country: seed.country, venueName: seed.venueName, location: seed.location || seed.city,
      coverImage: seed.coverImage || null, approvalRequired: true, registrationAvailability: 'invite-only', price: 'By invitation',
      organizer: seed.organizer ? { type: 'Organization', name: seed.organizer } : undefined,
    } };
  }
  if (fs.existsSync(file)) {
    const saved = JSON.parse(fs.readFileSync(file, 'utf8')) as Verified;
    if (Date.now() - Date.parse(saved.fetchedAt) < 6 * 60 * 60 * 1000) return saved;
  }
  const knownLumaId = /^(?:www\.)?(?:luma\.com|lu\.ma)$/.test(new URL(group.url).hostname)
    ? group.entries.flatMap(entry => [entry.id, entry.lumaId]).find(id => id?.startsWith('evt-')) || new URL(group.url).pathname.match(/\/(evt-[a-zA-Z0-9]+)(?:\/|$)/)?.[1] : undefined;
  if (knownLumaId) {
    const response = await fetchPublic(`https://api.lu.ma/event/get?event_api_id=${encodeURIComponent(knownLumaId)}`);
    if (response.ok) {
      const data = object(await response.json());
      const sourceEvent = object(data.event);
      const primaryUrl = str(sourceEvent.url) ? registrationUrl(`https://luma.com/${str(sourceEvent.url)}`) : group.url;
      const fetchedAt = new Date().toISOString();
      const patch = lumaSourcePatch({ url: primaryUrl, fetchedAt, method: 'luma-api', data });
      const result: Verified = { patch, primaryUrl, fetchedAt, description: patch.description || '', sourceHash: hash(JSON.stringify({ event: sourceEvent, description: data.description_mirror || data.description })), luma: true };
      fs.writeFileSync(file, JSON.stringify(result, null, 2));
      return result;
    }
  }
  const response = await fetchPublic(group.url);
  const fetchedAt = new Date().toISOString();
  const html = response.ok ? await response.text() : '';
  const primaryUrl = registrationUrl(response.url) || group.url;
  const isLuma = /^(?:www\.)?(?:luma\.com|lu\.ma)$/.test(new URL(primaryUrl).hostname);
  let result: Verified;
  if (isLuma) {
    if (!response.ok) throw new Error(`Luma page returned HTTP ${response.status}`);
    const data = object(object(nextPageData(html).initialData).data);
    const sourceEvent = object(data.event);
    if (!sourceEvent.api_id) throw new Error('Registration URL is not a Luma event page');
    const canonical = registrationUrl(`https://luma.com/${str(sourceEvent.url) || new URL(primaryUrl).pathname.slice(1)}`);
    const snapshot: LumaSnapshot = { url: canonical, fetchedAt, method: 'luma-page', data };
    const patch = lumaSourcePatch(snapshot);
    result = { patch, primaryUrl: canonical, fetchedAt, description: patch.description || '', sourceHash: hash(JSON.stringify({ event: sourceEvent, description: data.description_mirror || data.description })), luma: true };
  } else {
    const $ = cheerio.load(html);
    const lumaLinks = new Set($('a[href]').filter((_, element) => /register|join.*summit|apply|tickets|founder house/i.test($(element).text()))
      .map((_, element) => registrationUrl($(element).attr('href'))).get().filter(link => /^https:\/\/luma\.com\/[^/]+$/i.test(link)));
    if (depth < 2 && lumaLinks.size === 1) {
      const linked = await verify({ url: [...lumaLinks][0], entries: group.entries }, depth + 1);
      fs.writeFileSync(file, JSON.stringify(linked, null, 2));
      return linked;
    }
    const reviewed = reviewedFacts.find(item => urlIdentity(item.url) === urlIdentity(group.url));
    if (reviewed && response.ok) {
      $('script,style').remove();
      const textKey = (value: string) => value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g, '');
      const visible = textKey($.root().text());
      if (!reviewed.evidence.every(quote => visible.includes(textKey(quote)))) throw new Error('Reviewed schedule evidence has changed');
      const cover = $('meta[property="og:image"]').attr('content');
      result = { primaryUrl, fetchedAt, description: reviewed.facts.description, reviewed: true, sourceHash: hash(html), patch: { ...reviewed.facts, coverImage: cover ? new URL(cover, primaryUrl).href : null } };
      fs.writeFileSync(file, JSON.stringify(result, null, 2));
      return result;
    }
    const official = group.entries.filter(entry => entry.authoritativeSchedule && entry.startDate).sort((a, b) => a.startDate!.localeCompare(b.startDate!));
    const seed = official[0] || group.entries.find(entry => entry.startDate) || group.entries[0];
    if (!seed.startDate) throw new Error('No verified event date');
    const extracted = html ? extractOfficialEventDescription(html, { name: seed.name, startDate: seed.startDate }) : {};
    if (!official.length && !extracted.result?.eventFacts?.startDate) throw new Error(`No authoritative schedule on registration page (HTTP ${response.status})`);
    const cover = $('meta[property="og:image"]').attr('content');
    const last = official[official.length - 1];
    const name = official.length > 1 ? seed.name.replace(/\s*[-–—:]?\s*day\s+\d+\s*$/i, '').trim() : seed.name;
    const patch: Partial<Web3Event> = {
      name, startDate: seed.startDate, endDate: last?.endDate || seed.endDate,
      timezone: seed.timezone || 'Asia/Singapore', country: seed.country, city: seed.city,
      venueName: seed.venueName, location: seed.location || seed.city || 'Location to be announced',
      coverImage: cover ? registrationUrl(new URL(cover, primaryUrl).href) : seed.coverImage || null,
      organizer: seed.organizer ? { name: seed.organizer, type: 'Organization' } : undefined,
      price: seed.price, attendanceMode: 'offline',
      ...extracted.result?.eventFacts,
    };
    result = { patch, primaryUrl, fetchedAt, description: extracted.result?.description || seed.description || '', sourceHash: hash(extracted.result?.description || JSON.stringify(seed)) };
  }
  fs.writeFileSync(file, JSON.stringify(result, null, 2));
  return result;
}

function chooseSlug(name: string, taken: Set<string>) {
  const words = name.normalize('NFKD').toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/[\s-]+/).filter(word => word.length > 1 && !['the', 'and', 'by', 'at', 'in', '2026'].includes(word));
  const base = getEventBaseSlug({ name });
  let slug = [words.slice(0, 2).join('-'), base, words.slice(0, 3).join('-')].find(candidate => candidate && candidate.length <= 38 && !taken.has(candidate));
  let suffix = 2;
  if (!slug) { slug = base; while (taken.has(slug)) slug = `${base}${suffix++}`; }
  taken.add(slug);
  return slug;
}

async function main() {
  fs.mkdirSync(cache, { recursive: true });
  const discoveryPath = path.join(cache, 'discovery.json');
  const discovery = process.argv.includes('--cached') && fs.existsSync(discoveryPath)
    ? JSON.parse(fs.readFileSync(discoveryPath, 'utf8')) as Awaited<ReturnType<typeof discoverToken2049>>
    : await discoverToken2049();
  fs.writeFileSync(discoveryPath, JSON.stringify(discovery, null, 2));
  const live = JSON.parse(fs.readFileSync('content/events-runtime.json', 'utf8')) as Web3Event[];
  const stored = JSON.parse(fs.readFileSync(output, 'utf8')) as Web3Event[];
  const taken = loadReservedRootSlugsSync();
  const nextConfig = (await import('../next.config.mjs')).default;
  for (const redirect of await nextConfig.redirects()) if (/^\/[a-z0-9-]+$/.test(redirect.source)) taken.add(redirect.source.slice(1));
  const jobs = JSON.parse(fs.readFileSync('content/jobs-runtime.json', 'utf8')) as { slug: string }[];
  for (const item of jobs) taken.add(item.slug);
  for (const slug of Object.keys(JSON.parse(fs.readFileSync('content/legacy-slugs-archive.json', 'utf8')))) taken.add(slug);
  for (const filename of fs.readdirSync('content/events/sources').filter(file => file.endsWith('.json'))) {
    const source = JSON.parse(fs.readFileSync(path.join('content/events/sources', filename), 'utf8')) as Web3Event[];
    for (const event of source) if (event.slug) taken.add(event.slug);
  }
  for (const event of live) if (event.slug) taken.add(event.slug);
  const groups = new Map<string, Group>();
  const receipts: Receipt[] = [];
  const withoutUrl: DiscoveryEvent[] = [];
  for (const entry of discovery.events) {
    const url = registrationUrl(entry.url);
    if (!url) {
      if (entry.authoritativeSchedule && entry.inviteOnly && entry.startDate) {
        const key = `official:${entry.id}`;
        if (!groups.has(key)) groups.set(key, { url: sourceConfig.officialWeek, entries: [], calendarEntryId: entry.id });
        groups.get(key)!.entries.push(entry);
      } else withoutUrl.push(entry);
      continue;
    }
    const key = urlIdentity(url);
    if (!groups.has(key)) groups.set(key, { url, entries: [] });
    groups.get(key)!.entries.push(entry);
  }
  const additions: Web3Event[] = [];
  const pending: Group[] = [];
  for (const group of groups.values()) {
    const found = existingMatch(group.entries, [...live, ...stored]);
    const base = { url: group.url, name: group.entries[0].name, sources: [...new Set(group.entries.map(entry => entry.source))], sourceId: group.calendarEntryId };
    if (found) receipts.push({ ...base, status: 'existing', slug: found.slug });
    else if (group.entries.every(entry => inactive(entry.name))) receipts.push({ ...base, status: 'excluded', reason: 'Cancelled or test entry' });
    else pending.push(group);
  }
  console.log(`Discovered ${groups.size} registration groups; ${pending.length} need primary-page verification.`);
  for (let offset = 0; offset < pending.length; offset += 2) {
    const results = await Promise.all(pending.slice(offset, offset + 2).map(async group => {
      const already = existingMatch(group.entries, [...live, ...stored, ...additions]);
      if (already) return { group, already };
      try { return { group, verified: await verify(group) }; }
      catch (error) { return { group, error: error instanceof Error ? error.message : String(error) }; }
    }));
    for (const result of results) {
      const { group } = result;
      const receipt: Receipt = { url: group.url, name: group.entries[0].name, sources: [...new Set(group.entries.map(entry => entry.source))], status: 'needs-review', sourceId: group.calendarEntryId };
      if (result.already) { receipts.push({ ...receipt, status: 'duplicate', slug: result.already.slug }); continue; }
      if (!result.verified) { receipts.push({ ...receipt, reason: result.error }); continue; }
      const verified = result.verified, patch = verified.patch;
      if (!patch.name || !patch.startDate || !Number.isFinite(Date.parse(patch.startDate))) { receipts.push({ ...receipt, reason: 'Missing verified name or date' }); continue; }
      if (patch.eventStatus === 'EventCancelled' || inactive(patch.name)) { receipts.push({ ...receipt, status: 'excluded', reason: 'Primary source cancelled/test event' }); continue; }
      if (hasEventEnded(patch)) { receipts.push({ ...receipt, status: 'excluded', reason: 'Primary source event has ended' }); continue; }
      const found = existingMatch(group.entries, [...live, ...stored, ...additions], { ...patch, url: verified.primaryUrl });
      if (found) { receipts.push({ ...receipt, status: 'duplicate', slug: found.slug }); continue; }
      const id = patch.sourceVerification?.eventId ? `token2049-${patch.sourceVerification.eventId}` : group.calendarEntryId ? `token2049-official-${group.calendarEntryId}` : `token2049-${hash(urlIdentity(verified.primaryUrl)).slice(0, 16)}`;
      const inWeek = patch.startDate >= '2026-10-01' && patch.startDate < '2026-10-13';
      const event: Web3Event = {
        id, name: patch.name, description: '', startDate: patch.startDate,
        location: patch.location || 'Location to be announced', url: verified.primaryUrl,
        registrationUrl: verified.primaryUrl, coverImage: patch.coverImage || null,
        ...patch, slug: chooseSlug(patch.name, taken), source: 'token2049-verified',
        ...(inWeek ? { sideEventFor: ['token2049'], token2049SideEvent: true } : {}),
      };
      event.description = describe(event, verified.description, verified.reviewed);
      const officialSource = group.entries.find(entry => entry.authoritativeSchedule)?.source;
      event.descriptionSource = {
        url: verified.luma || verified.description ? verified.primaryUrl : officialSource || verified.primaryUrl,
        fetchedAt: verified.fetchedAt, method: verified.reviewed ? 'reviewed-primary-sources' : 'matched-organizer-record', pageTitle: event.name, sha256: hash(event.description),
        evidence: [{ url: verified.primaryUrl, fetchedAt: verified.fetchedAt, sha256: verified.sourceHash }],
      };
      additions.push(event);
      receipts.push({ ...receipt, name: event.name, status: 'added', slug: event.slug, eventId: event.sourceVerification?.eventId || event.id });
    }
    if (offset % 10 === 0 || offset + 2 >= pending.length) console.log(`Verified ${Math.min(offset + 2, pending.length)}/${pending.length}; ${additions.length} new records so far.`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  const kept: Web3Event[] = [];
  const priority = (event: Web3Event) => event.sourceVerification ? 0 : urlIdentity(event.url) === urlIdentity(sourceConfig.officialWeek) ? 2 : 1;
  const seriesKey = (name: string) => nameKey(name.replace(/\b20\d{2}\b/g, '').replace(/\bsingapore\b/gi, '').replace(/\s*[-–—:[(]?\s*\bday\s*\d+\s*[)\]]?\s*$/i, ''));
  const bound = (value: string, end: boolean) => Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T${end ? '23:59:59' : '00:00:00'}+08:00` : value);
  for (const event of [...additions].sort((a, b) => priority(a) - priority(b))) {
    const key = seriesKey(event.name);
    const duplicate = [...live, ...stored, ...kept].find(other => key.length >= 12 && seriesKey(other.name) === key
      && (!event.country || !other.country || event.country === other.country)
      && bound(event.startDate, false) <= bound(other.endDate || other.startDate, true)
      && bound(other.startDate, false) <= bound(event.endDate || event.startDate, true));
    if (duplicate) {
      for (const receipt of receipts) if (receipt.slug === event.slug) { receipt.status = 'duplicate'; receipt.slug = duplicate.slug; receipt.reason = 'Same named event and overlapping dates; alternate link or daily programme row'; }
    } else kept.push(event);
  }
  additions.splice(0, additions.length, ...kept);
  for (const entry of withoutUrl) {
    const base = { url: '', name: entry.name, sources: [entry.source] };
    const found = existingMatch([entry], [...live, ...stored, ...additions]);
    if (found) receipts.push({ ...base, status: 'existing', slug: found.slug });
    else if (inactive(entry.name)) receipts.push({ ...base, status: 'excluded', reason: 'Cancelled or test entry' });
    else {
      const alias = [...groups.values()].find(group => group.entries.some(other => other.id === entry.id || nameKey(other.name) === nameKey(entry.name)));
      const related = alias && receipts.find(receipt => alias.calendarEntryId ? receipt.sourceId === alias.calendarEntryId : urlIdentity(receipt.url) === urlIdentity(alias.url));
      receipts.push(related ? { ...base, status: related.status === 'added' ? 'duplicate' : related.status, slug: related.slug, reason: related.reason }
        : { ...base, status: 'needs-review', reason: 'No public registration URL; match against primary records needed' });
    }
  }
  if (write) {
    for (let offset = 0; offset < additions.length; offset += 4) {
      await Promise.all(additions.slice(offset, offset + 4).map(async event => {
        try { const local = await downloadCover(event, path.join(root, 'public/events')); if (local && local !== 'rate_limited') event.coverImage = local; }
        catch { /* A verified remote cover remains available if localization fails. */ }
      }));
    }
    fs.writeFileSync(output, JSON.stringify([...stored, ...additions], null, 2) + '\n');
  }
  const counts = receipts.reduce<Record<string, number>>((result, receipt) => { result[receipt.status] = (result[receipt.status] || 0) + 1; return result; }, {});
  const report = { checkedAt: discovery.checkedAt, written: write, sourceCounts: discovery.counts, counts, importedTotal: stored.length + additions.length, added: additions.map(event => ({ id: event.id, slug: event.slug, name: event.name })), receipts };
  fs.writeFileSync(path.join(cache, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(cache, 'proposed.json'), JSON.stringify(additions, null, 2) + '\n');
  if (write) fs.writeFileSync('content/events/token2049-import-report.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ write, ...counts }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
}
