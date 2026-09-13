import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

type EventRecord = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  city: string;
  country: string;
  location: string;
  url: string;
  coverImage: string | null;
  source: string;
};

const userAgent = 'HashtagWeb3 event directory importer/1.0';

function text(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function getEventSchema(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const event = getEventSchema(item);
      if (event) return event;
    }
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const type = item['@type'];
  if (type === 'Event' || (Array.isArray(type) && type.includes('Event'))) return item;
  return getEventSchema(item['@graph']);
}

async function getLumaEvent(url: string, fallback: Omit<EventRecord, 'id' | 'url' | 'source'>): Promise<EventRecord | null> {
  const response = await fetch(url, { headers: { 'User-Agent': userAgent }, redirect: 'follow' });
  if (!response.ok) return null;
  const $ = load(await response.text());
  const scripts = $('script[type="application/ld+json"]');
  let schema: Record<string, unknown> | null = null;
  scripts.each((_, element) => {
    if (schema) return;
    try { schema = getEventSchema(JSON.parse($(element).text())); } catch { /* ignore malformed data */ }
  });
  const startDate = typeof schema?.startDate === 'string' ? schema.startDate : fallback.startDate;
  if (!startDate) return null;
  const location = schema?.location;
  const locationName = typeof location === 'object' && location !== null && typeof (location as Record<string, unknown>).name === 'string'
    ? (location as Record<string, string>).name
    : fallback.location;
  const image = $('meta[property="og:image"]').attr('content') || fallback.coverImage;
  const name = typeof schema?.name === 'string' ? schema.name : fallback.name;
  const description = typeof schema?.description === 'string' ? schema.description : fallback.description;
  const slug = new URL(url).pathname.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  return {
    id: `india-luma-${slug}`,
    name,
    description,
    startDate,
    endDate: typeof schema?.endDate === 'string' ? schema.endDate : startDate,
    city: fallback.city,
    country: 'India',
    location: locationName,
    url,
    coverImage: image || null,
    source: 'luma-india',
  };
}

async function main() {
  const [directoryUrl, outputFile] = process.argv.slice(2);
  if (!directoryUrl || !outputFile) throw new Error('Usage: import-luma-directory <directory-url> <output-file>');
  const $ = load(await (await fetch(directoryUrl, { headers: { 'User-Agent': userAgent } })).text());
  const rows = $('article.event').toArray();
  const events: EventRecord[] = [];
  const urls = new Set<string>();

  for (const row of rows) {
    const article = $(row);
    const source = article.attr('data-source') || '';
    let url: URL;
    try { url = new URL(source); } catch { continue; }
    if (url.hostname !== 'luma.com' || urls.has(url.toString())) continue;
    urls.add(url.toString());
    const section = article.closest('section');
    const dateText = text(section.find('.date-block').first().text());
    const month = dateText.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)?.[1];
    const day = Number(dateText.match(/\d{1,2}/)?.[0]);
    if (!month || !day) continue;
    const monthIndex = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(month.toLowerCase().slice(0, 3)) + 1;
    const fallback = {
      name: text(article.find('.event-name').text()),
      description: article.attr('data-description') || '',
      startDate: `2026-${String(monthIndex).padStart(2, '0')}-${String(day).padStart(2, '0')}T09:00:00+05:30`,
      endDate: `2026-${String(monthIndex).padStart(2, '0')}-${String(day).padStart(2, '0')}T09:00:00+05:30`,
      city: text(article.find('.event-venue').text()) || 'India',
      country: 'India',
      location: text(article.find('.event-venue').text()) || 'India',
      coverImage: article.find('img.event-cover').attr('src') || null,
    };
    const event = await getLumaEvent(url.toString(), fallback);
    if (event) events.push(event);
    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  fs.writeFileSync(path.resolve(outputFile), `${JSON.stringify(events, null, 2)}\n`);
  console.log(`Imported ${events.length} Luma events.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
