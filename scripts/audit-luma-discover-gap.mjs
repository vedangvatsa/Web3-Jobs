/**
 * List Luma discover crypto events missing from the site catalog (API layer only).
 * Requires a prior `sync-luma-discover-cities.ts` run to populate `.cache/luma-discover/`.
 */
import fs from 'node:fs';
import path from 'node:path';
import eventTombstones from '../content/event-tombstones.json' with { type: 'json' };
import { canImportEvent } from './lib/event-retention.mjs';
import { NON_WEB3, SPAMMY } from './lib/luma-event-filters.ts';

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
  'content/events-runtime.json',
];

function normUrl(value) {
  const slug = value
    .replace(/^https?:\/\/(www\.)?(lu\.ma|luma\.com)\//i, '')
    .replace(/\/$/, '')
    .split('?')[0];
  return `https://luma.com/${slug.toLowerCase()}`;
}

function normName(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const urls = new Set();
const eventIds = new Set();
const identities = new Set();
for (const file of SOURCE_FILES) {
  if (!fs.existsSync(file)) continue;
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(parsed)) continue;
  for (const event of parsed) {
    if (event.url) urls.add(normUrl(event.url));
    if (event.registrationUrl) urls.add(normUrl(event.registrationUrl));
    if (event.id) eventIds.add(event.id.toLowerCase());
    if (event.sourceVerification?.eventId) eventIds.add(event.sourceVerification.eventId.toLowerCase());
    if (event.name && event.startDate) identities.add(`${normName(event.name)}|${event.startDate.slice(0, 10)}`);
  }
}

const cutoff = Date.now() - 6 * 60 * 60 * 1000;
const cacheDir = '.cache/luma-discover';
if (!fs.existsSync(cacheDir)) {
  console.error('No .cache/luma-discover — run sync-luma-discover-cities.ts first.');
  process.exit(1);
}

const merged = new Map();
for (const file of fs.readdirSync(cacheDir).filter((name) => name.startsWith('events-'))) {
  for (const entry of JSON.parse(fs.readFileSync(path.join(cacheDir, file), 'utf8'))) {
    if (entry?.event?.api_id) merged.set(entry.event.api_id, { entry, city: file.replace(/^events-|\.json$/g, '') });
  }
}

const missing = [];
for (const { entry, city } of merged.values()) {
  const event = entry.event;
  if (new Date(event.start_at).getTime() < cutoff) continue;
  if (SPAMMY.test(event.name || '') || NON_WEB3.test(event.name || '')) continue;
  const url = normUrl(event.url?.startsWith('http') ? event.url : `https://luma.com/${event.url}`);
  const id = `luma-crypto-${event.api_id.replace(/^evt-/, '')}`;
  const identity = `${normName(event.name)}|${event.start_at.slice(0, 10)}`;
  if (
    urls.has(url) ||
    eventIds.has(event.api_id.toLowerCase()) ||
    eventIds.has(id.toLowerCase()) ||
    identities.has(identity)
  ) continue;
  if (!canImportEvent({ id, startDate: event.start_at, endDate: event.end_at }, eventTombstones)) continue;
  missing.push({ city, name: event.name.trim(), start: event.start_at.slice(0, 10), url });
}

missing.sort((a, b) => a.start.localeCompare(b.start) || a.name.localeCompare(b.name));
const reportPath = process.argv[2] || '.cache/luma-discover/missing-listing.json';
fs.writeFileSync(reportPath, `${JSON.stringify({ ranAt: new Date().toISOString(), count: missing.length, missing }, null, 2)}\n`);
console.log(`Luma listing gaps: ${missing.length} (wrote ${reportPath})`);
const byCity = new Map();
for (const row of missing) byCity.set(row.city, (byCity.get(row.city) || 0) + 1);
console.log('By city:', [...byCity.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([c, n]) => `${c}:${n}`).join(', '));
for (const row of missing.slice(0, 50)) console.log(`${row.start}  ${row.city.padEnd(20)}  ${row.name.slice(0, 50)}`);