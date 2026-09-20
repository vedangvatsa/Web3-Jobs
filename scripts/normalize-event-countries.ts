/**
 * Rewrite event JSON country fields to canonical names via normalizeCountry.
 * Usage: npx tsx scripts/normalize-event-countries.ts [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { normalizeCountry } from '../src/lib/events';

const ROOT = path.join(process.cwd(), 'content', 'events', 'sources');
const FILES = [
  'events-cache.json',
  'luma-crypto-events.json',
  'curated-events.json',
  'india-luma-events.json',
  'kbw-luma-events.json',
  'ibw-side-events.json',
];

const dryRun = process.argv.includes('--dry-run');
let changedEvents = 0;

for (const file of FILES) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) continue;

  const rawText = fs.readFileSync(p, 'utf8');
  const data = JSON.parse(rawText);
  const isArr = Array.isArray(data);
  const arr = isArr ? data : data.events || [];
  let fileChanged = false;

  for (const e of arr) {
    if (!e.country) continue;
    const before = String(e.country).trim();
    const after = normalizeCountry(before);
    if (after && after !== before) {
      e.country = after;
      fileChanged = true;
      changedEvents++;
    }
  }

  if (fileChanged && !dryRun) {
    const out = JSON.stringify(isArr ? arr : { ...data, events: arr }, null, 2);
    fs.writeFileSync(p, `${out}\n`);
    console.log('updated', file);
  } else if (fileChanged) {
    console.log('would update', file);
  }
}

console.log(dryRun ? `Would rewrite ${changedEvents} events` : `Rewrote ${changedEvents} events`);
