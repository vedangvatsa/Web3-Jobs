import fs from 'node:fs';
import path from 'node:path';
import {
  loadWorkbook,
  parseExcelSerialDate,
  worksheetFormula,
  worksheetPrimitive,
  worksheetUsedRowCount,
} from './lib/excel-workbook';
import { canImportEvent } from './lib/event-retention.mjs';
import eventTombstones from '../content/event-tombstones.json';

type CachedEvent = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  city: string;
  country: string;
  location: string;
  category?: string;
  price?: string;
  token2049SideEvent?: boolean;
  url: string;
  coverImage: null;
  source: string;
  month: string;
};

const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1y3D1zB9IIGJbLeF8aicSYoXxtiZ5kAS25Wj4a5hvovg/export?format=xlsx';
const cachePath = path.join(process.cwd(), 'content', 'events', 'sources', 'events-cache.json');

function getLink(formula?: string): string | null {
  const match = formula?.match(/^HYPERLINK\("([^"]+)"/i);
  if (!match?.[1]) return null;
  const target = match[1].trim();
  if (/^https?:\/\//i.test(target)) return target;
  return /^[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?$/i.test(target) ? `https://${target}` : null;
}

function getTime(value: unknown): string | null {
  if (typeof value !== 'number' || value < 0 || value >= 1) return null;
  const minutes = Math.round(value * 24 * 60);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/$/, '').toLowerCase();
}

async function main() {
  const response = await fetch(spreadsheetUrl);
  if (!response.ok) throw new Error(`Could not download spreadsheet: ${response.status}`);

  const workbook = await loadWorkbook(Buffer.from(await response.arrayBuffer()));
  const sheet = workbook.getWorksheet('TOKEN2049 Week');
  if (!sheet) throw new Error('TOKEN2049 Week sheet not found');

  const existing: CachedEvent[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const existingUrls = new Set(existing.map((event) => normalizeUrl(event.url)));
  const existingById = new Map(existing.map((event) => [event.id, event]));
  const imported: CachedEvent[] = [];

  for (let row = 7; row <= worksheetUsedRowCount(sheet); row++) {
    const id = String(worksheetPrimitive(sheet, `A${row}`) ?? '').trim();
    const dateValue = worksheetPrimitive(sheet, `B${row}`);
    const name = String(worksheetPrimitive(sheet, `E${row}`) ?? '').trim();
    const category = String(worksheetPrimitive(sheet, `F${row}`) ?? 'Web3 event').trim();
    const price = String(worksheetPrimitive(sheet, `G${row}`) ?? '').trim();
    const url = getLink(worksheetFormula(sheet, `H${row}`))?.replace(/\/$/, '');
    const startTime = getTime(worksheetPrimitive(sheet, `C${row}`)) ?? '09:00';
    const endTime = getTime(worksheetPrimitive(sheet, `D${row}`)) ?? startTime;

    if (!id || !name || typeof dateValue !== 'number' || !url) continue;
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(parsedUrl.protocol) || ['localhost', '127.0.0.1'].includes(parsedUrl.hostname)) continue;

    const date = parseExcelSerialDate(dateValue);
    if (!date) continue;
    const datePart = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    const startDate = `${datePart}T${startTime}:00+08:00`;
    let endDate = `${datePart}T${endTime}:00+08:00`;
    if (endDate <= startDate) {
      const nextDay = new Date(`${datePart}T00:00:00+08:00`);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      endDate = `${nextDay.toISOString().slice(0, 10)}T${endTime}:00+08:00`;
    }

    const existingEvent = existingById.get(`token2049-side-${id}`);
    if (existingEvent) {
      existingEvent.startDate = startDate;
      existingEvent.endDate = endDate;
      existingEvent.category = category;
      existingEvent.price = price;
      existingEvent.token2049SideEvent = true;
      continue;
    }
    const matchingEvents = existing.filter((event) => normalizeUrl(event.url) === normalizeUrl(url));
    if (matchingEvents.length > 0) {
      for (const matchingEvent of matchingEvents) {
        matchingEvent.name = name;
        matchingEvent.description = `${name} is listed as a ${category} during TOKEN2049 Week Singapore.`;
        matchingEvent.startDate = startDate;
        matchingEvent.endDate = endDate;
        matchingEvent.category = category;
        matchingEvent.price = price;
        matchingEvent.url = url;
        matchingEvent.source = 'token2049-official';
        matchingEvent.token2049SideEvent = true;
      }
      continue;
    }

    if (!canImportEvent({ id: `token2049-side-${id}`, startDate, endDate }, eventTombstones)) continue;
    imported.push({
      id: `token2049-side-${id}`,
      name,
      description: `${name} is listed as a ${category} during TOKEN2049 Week Singapore.`,
      startDate,
      endDate,
      city: 'Singapore',
      country: 'Singapore',
      location: 'Singapore',
      category,
      price,
      token2049SideEvent: true,
      url,
      coverImage: null,
      source: 'token2049-official',
      month: 'October 2026',
    });
  }

  fs.writeFileSync(cachePath, `${JSON.stringify([...existing, ...imported], null, 2)}\n`);
  console.log(`Imported ${imported.length} TOKEN2049 Week events.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
