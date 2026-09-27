import * as XLSX from 'xlsx';
import config from '../../content/events/token2049-sources.json';
import { fetchLumaCalendarEntries, lumaEventUrl } from './luma-calendar.mjs';
import { object } from '../luma-source-record';

export type DiscoveryEvent = {
  source: string; id: string; name: string; url: string;
  startDate?: string; endDate?: string; timezone?: string;
  location?: string; venueName?: string; city?: string; country?: string;
  coverImage?: string; organizer?: string; description?: string; price?: string;
  lumaId?: string; inviteOnly?: boolean;
  authoritativeSchedule: boolean;
};

export const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const str = (value: unknown): string => typeof value === 'string' ? value.trim() : '';
let retryAt = 0;

export async function fetchPublic(url: string | URL, options: RequestInit = {}): Promise<Response> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (retryAt > Date.now()) await new Promise(resolve => setTimeout(resolve, retryAt - Date.now()));
      const response = await fetch(url, { ...options, headers: { 'user-agent': UA, ...options.headers }, signal: AbortSignal.timeout(30000) });
      if (response.status === 429) {
        const delay = Number(response.headers.get('retry-after')) || 30;
        retryAt = Date.now() + Math.min(120, Math.max(5, delay)) * 1000;
      }
      if (![429, 502, 503, 504].includes(response.status) || attempt === 2) return response;
    } catch (error) {
      if (attempt === 2) throw error;
    }
    await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1500));
  }
  throw new Error('Request exhausted retries');
}

export function nextPageData(html: string): Record<string, unknown> {
  const match = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error('Page has no structured data');
  return object(object(JSON.parse(match[1]).props).pageProps);
}

export function registrationUrl(value: unknown): string {
  let candidate = str(value);
  if (!candidate) return '';
  if (/^(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?$/i.test(candidate)) candidate = `https://${candidate}`;
  try {
    let url = new URL(candidate);
    if (url.hostname.endsWith('google.com') && url.pathname === '/url') url = new URL(url.searchParams.get('q') || url.searchParams.get('url') || '');
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) return '';
    if (/^(?:localhost|0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|\[)/i.test(url.hostname) || /\.(?:local|internal)$/.test(url.hostname)) return '';
    if (/^(?:www\.)?lu\.ma$/i.test(url.hostname)) url.hostname = 'luma.com';
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) if (/^utm_|^(?:ref|referrer)$/i.test(key)) url.searchParams.delete(key);
    return url.href.replace(/\/$/, '');
  } catch { return ''; }
}

export function urlIdentity(value: string): string {
  const normalized = registrationUrl(value);
  if (!normalized) return '';
  const url = new URL(normalized);
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  const pathname = host === 'luma.com' ? url.pathname.toLowerCase() : url.pathname;
  return `${host}${pathname}${url.search}`;
}

export function officialSchedule(dateValue: unknown, startValue: unknown, endValue: unknown, endDateValue?: unknown) {
  const date = str(dateValue).slice(0, 10);
  const start = str(startValue);
  const end = str(endValue);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(start)) return {};
  const startDate = `${date}T${start}:00+08:00`;
  let endDate = /^\d{4}-\d{2}-\d{2}/.test(str(endDateValue)) ? str(endDateValue) : /^\d{2}:\d{2}$/.test(end) ? `${date}T${end}:00+08:00` : undefined;
  if (endDate && Date.parse(endDate) <= Date.parse(startDate)) endDate = new Date(Date.parse(endDate) + 86400000).toISOString();
  return { startDate, endDate };
}

export async function discoverToken2049() {
  const events: DiscoveryEvent[] = [];
  const counts: Record<string, number> = {};
  for (const slug of config.calendars) {
    const source = `https://luma.com/${slug}`;
    const response = await fetchPublic(source);
    if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`);
    const data = object(object(nextPageData(await response.text()).initialData).data);
    const calendarId = str(object(data.calendar).api_id);
    if (!calendarId) throw new Error(`${source}: calendar ID missing`);
    const result = await fetchLumaCalendarEntries(calendarId, { fetchImpl: fetchPublic });
    counts[source] = result.entries.length;
    console.log(`${source}: ${result.entries.length} entries across ${result.pages} pages`);
    for (const entryValue of result.entries) {
      const entry = object(entryValue), event = object(entry.event), geo = object(event.geo_address_info);
      const url = lumaEventUrl(str(event.url), str(event.api_id));
      events.push({ source, id: str(event.api_id) || str(entry.api_id), name: str(event.name), url: registrationUrl(url),
        startDate: str(event.start_at), endDate: str(event.end_at), timezone: str(event.timezone),
        city: str(geo.city), country: str(geo.country), coverImage: str(event.cover_url), authoritativeSchedule: false });
    }
  }
  const weekResponse = await fetchPublic(config.officialWeek);
  if (!weekResponse.ok) throw new Error(`Official calendar: HTTP ${weekResponse.status}`);
  const weekData = nextPageData(await weekResponse.text()).events;
  if (!Array.isArray(weekData)) throw new Error('Official calendar has no events');
  const byId = new Map<string, DiscoveryEvent>();
  for (const value of weekData) {
    const row = object(value), venue = object(row.venue);
    const event: DiscoveryEvent = {
      source: config.officialWeek, id: str(row._id), name: str(row.event_name),
      url: registrationUrl(row.registration_link) || (str(row.luma_event_id) ? `https://luma.com/${str(row.luma_event_id)}` : ''),
      lumaId: str(row.luma_event_id), inviteOnly: /invite.only/i.test(str(row.registration_link)),
      ...officialSchedule(row.event_date, row.start_time, row.end_time, row.event_end_date),
      timezone: config.timezone, city: 'Singapore', country: 'Singapore',
      location: str(venue.address) || str(venue.name), venueName: str(venue.name),
      coverImage: str(row.thumbnail).startsWith('/') ? new URL(str(row.thumbnail), config.officialWeek).href : str(row.thumbnail),
      organizer: str(row.organiser_name), description: str(row.description),
      price: row.event_type === 'Free' ? 'Free' : str(row.price) ? `USD ${str(row.price)}` : undefined,
      authoritativeSchedule: true,
    };
    byId.set(event.id, event);
  }
  events.push(...byId.values());
  counts[config.officialWeek] = byId.size;

  const sheetId = config.officialSheet.match(/\/d\/([^/]+)/)![1];
  const sheetResponse = await fetchPublic(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`);
  if (!sheetResponse.ok) throw new Error(`Official sheet: HTTP ${sheetResponse.status}`);
  const workbook = XLSX.read(Buffer.from(await sheetResponse.arrayBuffer()), { type: 'buffer', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
  let sheetCount = 0;
  for (const [index, row] of rows.entries()) {
    const id = str(row[0]);
    if (!/^[a-f0-9]{24}$/.test(id)) continue;
    const linked = byId.get(id);
    const cell = sheet[XLSX.utils.encode_cell({ r: index, c: 7 })];
    const url = registrationUrl(row[8]) || registrationUrl(cell?.l?.Target) || registrationUrl(cell?.f?.match(/HYPERLINK\("([^"]+)"/i)?.[1]) || linked?.url || '';
    events.push({ ...linked, source: config.officialSheet, id, name: str(row[4]), url, authoritativeSchedule: Boolean(linked?.authoritativeSchedule) });
    sheetCount++;
  }
  counts[config.officialSheet] = sheetCount;

  const miraResponse = await fetchPublic(config.communityCollection);
  if (!miraResponse.ok) throw new Error(`MiraGather: HTTP ${miraResponse.status}`);
  const mira = nextPageData(await miraResponse.text());
  let miraCount = 0;
  for (const [key, main] of [['sideEvents', false], ['mainEvents', true]] as const) {
    if (!Array.isArray(mira[key])) throw new Error(`MiraGather has no ${key}`);
    for (const value of mira[key]) {
      const row = object(value);
      events.push({ source: config.communityCollection, id: str(row.id), name: str(main ? row.event : row.name),
        url: registrationUrl(main ? row.link : row.website), startDate: str(row.startDate), endDate: str(row.endDate),
        description: str(row.cached_description) || str(row.description), coverImage: str(row.image) || str(row.banner),
        timezone: config.timezone, authoritativeSchedule: false });
      miraCount++;
    }
  }
  counts[config.communityCollection] = miraCount;
  return { events, counts, checkedAt: new Date().toISOString() };
}
