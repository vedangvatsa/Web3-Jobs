/**
 * Audit event country fields for duplicates / unmappable values.
 * Usage: npx tsx scripts/audit-event-countries.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { normalizeCountry, COUNTRY_NAMES } from '../src/lib/events';

const ROOT = path.join(process.cwd(), 'content');
const FILES = [
  'events-cache.json',
  'luma-crypto-events.json',
  'curated-events.json',
  'india-luma-events.json',
  'kbw-luma-events.json',
  'ibw-side-events.json',
];

const canonicalSet = new Set(Object.values(COUNTRY_NAMES));

function loadEvents(file: string) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return [] as { country?: string; location?: string; name?: string }[];
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  return Array.isArray(data) ? data : data.events || [];
}

const rawCounts = new Map<string, number>();
const normCounts = new Map<string, number>();
const mismatchEvents: { file: string; name: string; raw: string; norm: string }[] = [];
const unknownNorm = new Map<string, number>();

for (const file of FILES) {
  for (const e of loadEvents(file)) {
    const raw = (e.country || '').trim();
    if (!raw) continue;
    rawCounts.set(raw, (rawCounts.get(raw) || 0) + 1);
    const norm = normalizeCountry(raw);
    normCounts.set(norm, (normCounts.get(norm) || 0) + 1);
    if (norm !== raw) {
      mismatchEvents.push({ file, name: (e.name || '').slice(0, 60), raw, norm });
    }
    if (!canonicalSet.has(norm) && norm === raw) {
      unknownNorm.set(norm, (unknownNorm.get(norm) || 0) + 1);
    }
  }
}

console.log('Raw unique:', rawCounts.size, '| Canonical unique:', normCounts.size);
console.log('\n--- Still mismatched in JSON (raw !== normalizeCountry) ---');
if (mismatchEvents.length === 0) {
  console.log('(none)');
} else {
  const byRaw = new Map<string, { norm: string; n: number }>();
  for (const m of mismatchEvents) {
    const k = m.raw;
    const cur = byRaw.get(k);
    if (cur) cur.n++;
    else byRaw.set(k, { norm: m.norm, n: 1 });
  }
  for (const [raw, { norm, n }] of [...byRaw.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`${n}\t${JSON.stringify(raw)} → ${JSON.stringify(norm)}`);
  }
}

console.log('\n--- Canonical names not in COUNTRY_NAMES values (legit edge cases) ---');
for (const [c, n] of [...unknownNorm.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`${n}\t${JSON.stringify(c)}`);
}

// Location tails that normalize differently from event.country
const tailMismatch = new Map<string, number>();
for (const file of FILES) {
  for (const e of loadEvents(file)) {
    const loc = (e.location || '').trim();
    const country = normalizeCountry(e.country || '');
    if (!loc || !country || /online|virtual|discord|zoom|meet|tba/i.test(loc)) continue;
    const parts = loc.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;
    const tail = parts[parts.length - 1].replace(/\s*\d{5}(-\d{4})?\s*$/, '').trim();
    const tailNorm = normalizeCountry(tail);
    if (tailNorm && tailNorm !== country && tailNorm !== tail) {
      tailMismatch.set(`${JSON.stringify(tail)} → ${tailNorm} (country=${country})`, (tailMismatch.get(`${JSON.stringify(tail)} → ${tailNorm} (country=${country})`) || 0) + 1);
    }
    if (/^(USA|U\.S\.A\.?|US|UAE|UK|SG|KR|JP|DE|FR|ES|IN|AE|GB)$/i.test(tail)) {
      const tn = normalizeCountry(tail);
      if (tn !== country) {
        tailMismatch.set(`code tail ${tail} → ${tn} vs country ${country}`, (tailMismatch.get(`code tail ${tail} → ${tn} vs country ${country}`) || 0) + 1);
      }
    }
  }
}

console.log('\n--- Location tail vs country field mismatches ---');
if (tailMismatch.size === 0) console.log('(none)');
else {
  for (const [k, n] of [...tailMismatch.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)) {
    console.log(`${n}\t${k}`);
  }
}

// Suggest alias groups: multiple raw keys collapsing to same norm (already fixed in data)
console.log('\n--- All canonical countries in corpus ---');
for (const [c, n] of [...normCounts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`${n}\t${c}`);
}

const COMMON_VARIANTS = [
  'USA', 'US', 'U.S.A', 'United States', 'UK', 'GB', 'UAE', 'Dubai', 'SG', 'KR', 'ROK',
  'Republic of Korea', 'JP', 'Türkiye', 'Turkiye', 'Czechia', 'Czech Republic', 'Holland',
  'Chinese Taipei', 'Deutschland', 'Brasil', 'KSA', 'Scotland', 'Emirates', 'Abu Dhabi',
];

console.log('\n--- Common variant normalization (sanity) ---');
let variantOk = true;
for (const v of COMMON_VARIANTS) {
  const n = normalizeCountry(v);
  const unchanged = n === v && !canonicalSet.has(n);
  if (unchanged) {
    console.log(`UNMAPPED variant: ${JSON.stringify(v)}`);
    variantOk = false;
  }
}
if (variantOk) console.log('All common variants map to canonical names.');
