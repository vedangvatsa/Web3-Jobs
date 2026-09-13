import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

type SideEvent = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  city: string;
  country: string;
  location: string;
  category: string;
  sideEventFor: string[];
  url: string;
  coverImage: null;
  source: string;
};

const SHEETS = {
  ibw: 'https://docs.google.com/spreadsheets/d/1NZ09OVlqElsM64oUm-8i1yh_A-U0p39BJECthwHCsLA/htmlview/sheet?headers=true&gid=0',
  kbw: 'https://docs.google.com/spreadsheets/d/1qqVasA4KhTgdwHgfCjM3caTT4PiUw95Ua4uCTyvMJVw/htmlview/sheet?headers=true&gid=0',
};

const MONTHS: Record<string, string> = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };

function text(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function link(href?: string) {
  if (!href) return '';
  try {
    const url = new URL(href);
    const destination = url.hostname === 'www.google.com' && url.pathname === '/url' ? new URL(url.searchParams.get('q') || '') : url;
    for (const key of [...destination.searchParams.keys()]) {
      if (key.startsWith('utm_')) destination.searchParams.delete(key);
    }
    return destination.toString();
  } catch {
    return '';
  }
}

function dateParts(value: string) {
  const matches = [...value.toLowerCase().matchAll(/(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?[\s-]*(\d{1,2})|(\d{1,2})[\s-]*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?)/g)];
  return matches.map((match) => ({ month: MONTHS[match[1] || match[4]], day: Number(match[2] || match[3]) }));
}

function parseTime(value: string) {
  const twentyFourHour = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyFourHour) return `${twentyFourHour[1].padStart(2, '0')}:${twentyFourHour[2]}`;
  const match = value.trim().toLowerCase().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (!match) return '09:00';
  let hour = Number(match[1]);
  if (match[3] === 'pm' && hour !== 12) hour += 12;
  if (match[3] === 'am' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${match[2] || '00'}`;
}

function makeDate(part: { month: string; day: number }, time: string) {
  return `2026-${part.month}-${String(part.day).padStart(2, '0')}T${time}:00`;
}

function eventId(prefix: string, name: string, date: string) {
  return `${prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 72)}-${date.slice(5, 10)}`;
}

async function importIbw() {
  const $ = load(await (await fetch(SHEETS.ibw)).text());
  const events: SideEvent[] = [];
  $('table.waffle tbody tr').each((_, row) => {
    const cells = $(row).children('td');
    const date = text(cells.eq(0).text());
    const eventCell = cells.eq(3).clone();
    eventCell.find('span').remove();
    const name = text(eventCell.text());
    const category = text(cells.eq(4).text()) || 'Side event';
    const url = link(cells.eq(5).find('a').attr('href')) || 'https://indiablockchainweek.com/';
    const parts = dateParts(date);
    if (!name || !parts[0] || /(ibw.*conference.*day|devcon.*day|ethglobal.*day)/i.test(name)) return;
    const startTime = parseTime(text(cells.eq(1).text()));
    const endTime = parseTime(text(cells.eq(2).text()));
    const startDate = makeDate(parts[0], startTime);
    let endDate = makeDate(parts[parts.length - 1] || parts[0], endTime);
    if (endDate < startDate) endDate = `${new Date(`${startDate}+05:30`).toISOString().slice(0, 10)}T${endTime}:00`;
    const parent = startDate < '2026-11-03' ? 'ibw' : startDate < '2026-11-07' ? 'devcon' : '';
    if (!parent) return;
    events.push({ id: eventId('ibw-official', name, startDate), name, description: `${name} is listed in the India Blockchain Week 2026 event calendar.`, startDate: `${startDate}+05:30`, endDate: `${endDate}+05:30`, city: 'Mumbai', country: 'India', location: 'Mumbai, India', category, sideEventFor: [parent], url, coverImage: null, source: 'ibw-official' });
  });
  return events;
}

async function importKbw() {
  const $ = load(await (await fetch(SHEETS.kbw)).text());
  const events: SideEvent[] = [];
  $('table.waffle tbody tr').each((_, row) => {
    const cells = $(row).children('td');
    const date = text(cells.eq(0).text());
    const eventCell = cells.eq(2).clone();
    eventCell.find('span').remove();
    const name = text(eventCell.text());
    const category = text(cells.eq(4).text()) || 'Side event';
    const location = text(cells.eq(5).text()) || 'Seoul, South Korea';
    const url = link(cells.eq(6).find('a').attr('href'));
    const parts = dateParts(date);
    if (!name || !parts[0] || /^(upbit institutional summit|speaker reception|kbw main conference)/i.test(name) || !url || /online/i.test(location)) return;
    const timeParts = text(cells.eq(3).text()).split(/\s+-\s+/);
    const startDate = makeDate(parts[0], parseTime(timeParts[0] || ''));
    const endPart = dateParts(timeParts[1] || '')[0] || parts[parts.length - 1] || parts[0];
    let endDate = makeDate(endPart, parseTime(timeParts[1] || ''));
    if (endDate < startDate) endDate = `${new Date(`${startDate}+09:00`).toISOString().slice(0, 10)}T${parseTime(timeParts[1] || '')}:00`;
    events.push({ id: eventId('kbw-official', name, startDate), name, description: `${name} is listed in the official Korea Blockchain Week 2026 side-event calendar.`, startDate: `${startDate}+09:00`, endDate: `${endDate}+09:00`, city: 'Seoul', country: 'South Korea', location, category, sideEventFor: ['kbw'], url, coverImage: null, source: 'kbw-official' });
  });
  return events;
}

async function main() {
  const [ibw, kbw] = await Promise.all([importIbw(), importKbw()]);
  const write = (fileName: string, events: SideEvent[]) => {
    const filePath = path.join(process.cwd(), 'content', fileName);
    const existing: SideEvent[] = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
    const images = new Map(existing.map((event) => [event.id, event.coverImage]));
    fs.writeFileSync(filePath, `${JSON.stringify(events.map((event) => ({ ...event, coverImage: images.get(event.id) || null })), null, 2)}\n`);
  };
  write('ibw-side-events.json', ibw);
  write('kbw-luma-events.json', kbw);
  console.log(`Imported ${ibw.length} IBW/Devcon and ${kbw.length} KBW side events.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
