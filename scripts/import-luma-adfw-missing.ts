/**
 * Ingest ADFW 2026 Luma side events into events-cache.json (luma-page + lumaSourcePatch pattern).
 * Usage: npx tsx scripts/import-luma-adfw-missing.ts
 */
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import sharp from 'sharp';
import { lumaSourcePatch, object } from './luma-source-record';
import type { Web3Event } from '../src/lib/events';
import { canImportEvent } from './lib/event-retention.mjs';
import tombstones from '../content/event-tombstones.json';

const LUMA_PATHS = [
  'trust-circle-wealth-abu-dhabi',
  'v1z81ldc',
  'barm4w4s',
  'FutureFinanceConnect_ADFW26',
  'adfw-soiree',
  'moonward-ft9s',
  'HSC_Abu_Dhabi',
  'du1wse77',
  'ng6xp9cf',
];

/** Luma URL segment -> published root slug (also set in event-slug-history + events-cache). */
const SLUG_MAP: Record<string, string> = {
  'trust-circle-wealth-abu-dhabi': 'trustcircle',
  v1z81ldc: 'merklescience',
  barm4w4s: 'tokenizead',
  FutureFinanceConnect_ADFW26: 'futurefinance',
  'adfw-soiree': 'soiree',
  'moonward-ft9s': 'moonward',
  HSC_Abu_Dhabi: 'hsc-abu',
  du1wse77: 'cbc-mixer',
  ng6xp9cf: 'padel',
};

const ADFW_W3V_IDS = [
  'w3v-further-network-summit-adfw-26-12-07',
  'w3v-one-dollar-two-rails-capital-efficiency-26-12-08',
  'w3v-gps-lps-cocktail-hour-adfw-abu-26-12-08',
  'w3v-institutional-house-where-rwas-stablecoins-ai-26-12-08',
  'w3v-private-dinner-nsureai-26-12-08',
  'w3v-dawn-26-12-09',
  'w3v-solana-afternoon-soir-e-26-12-09',
  'w3v-majlis-26-12-09',
  'w3v-longitude-abu-dhabi-26-12-10',
];

const ADFW_LUMA_IDS = ['luma-evt-AwC2l989ZaHg7Hi', 'luma-evt-6UA9pASZEyHYzNL'];

const CACHE = 'content/events/sources/events-cache.json';
const hash = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
const write = (file: string, data: unknown) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');

const ADFW_COPY = /\b(?:adfw|abu dhabi finance week)\b|dec(?:ember)?\s*(?:7|8|9|10),?\s*2026/i;

function monthLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Luma API year typo: 2025 timestamp but page copy says ADFW Dec 2026 week. */
function maybeCorrectAdfwDates(
  patch: Partial<Web3Event>,
  html: string,
  event: Record<string, unknown>,
): { startDate: string; endDate?: string; dateNote?: string } {
  const rawStart = String(event.start_at || '');
  const rawEnd = String(event.end_at || '');
  const apiYear = rawStart.slice(0, 4);
  const text = `${patch.name || ''}\n${patch.description || ''}\n${html}`;
  const mentionsAdfw2026 =
    ADFW_COPY.test(text) && /2026/.test(text);

  if (apiYear !== '2025' || !mentionsAdfw2026) {
    return { startDate: patch.startDate!, endDate: patch.endDate };
  }

  const tz = String(event.timezone || 'Asia/Dubai');
  const dayMatch =
    text.match(/december\s*(\d{1,2}),?\s*2026/i) ||
    text.match(/(\d{1,2})\s+december\s*2026/i) ||
    text.match(/dec\.?\s*(\d{1,2}),?\s*2026/i);

  let day = dayMatch ? Number(dayMatch[1]) : NaN;
  if (!Number.isFinite(day) || day < 7 || day > 10) {
    const apiDay = new Date(rawStart).getUTCDate();
    if (apiDay >= 7 && apiDay <= 10) day = apiDay;
    else day = 7;
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const startH = rawStart.includes('T') ? rawStart.slice(11) : '12:00:00.000Z';
  const endH = rawEnd.includes('T') ? rawEnd.slice(11) : startH;
  const startDate = `2026-12-${pad(day)}T${startH}`;
  let endDate = patch.endDate;
  if (rawEnd) {
    const endDay = new Date(rawEnd).getUTCDate();
    const endDayUse = endDay >= 7 && endDay <= 10 ? endDay : day;
    endDate = `2026-12-${pad(endDayUse)}T${endH}`;
  }

  return {
    startDate,
    endDate,
    dateNote: `Luma API listed ${rawStart.slice(0, 10)}; corrected to ADFW 2026-12-${pad(day)} from page copy (timezone ${tz}).`,
  };
}

type ImportResult = { ok: boolean; id?: string; error?: string; record?: Web3Event };

function editorialDescription(patch: Partial<Web3Event>, lumaUrl: string): string {
  const raw = (patch.description || '').trim();
  if (raw.length >= 80) return raw;
  const name = patch.name || 'ADFW side event';
  const when = patch.startDate?.slice(0, 10) || 'December 2026';
  const loc = patch.city === 'Abu Dhabi' ? 'Abu Dhabi' : patch.location || 'Abu Dhabi, UAE';
  return `${name}: ${raw || 'Networking and sessions during Abu Dhabi Finance Week.'} ${loc}, ${when}. Register on Luma (${lumaUrl}).`;
}

async function importOne(lumaPath: string): Promise<ImportResult> {
  const lumaUrl = `https://luma.com/${lumaPath}`;

  let response: Response;
  try {
    response = await fetch(lumaUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(45000),
    });
  } catch (err: unknown) {
    return { ok: false, error: `fetch: ${err instanceof Error ? err.message : String(err)}` };
  }

  if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };

  const html = await response.text();
  const fetchedAt = new Date().toISOString();
  const $ = cheerio.load(html);
  const raw = $('#__NEXT_DATA__').text();
  if (!raw) return { ok: false, error: 'No __NEXT_DATA__' };

  let data: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    data = object(object(object(object(parsed).props).pageProps).initialData).data;
  } catch (e: unknown) {
    return { ok: false, error: `JSON: ${e instanceof Error ? e.message : String(e)}` };
  }

  let patch: Partial<Web3Event>;
  try {
    patch = lumaSourcePatch({ url: lumaUrl, fetchedAt, method: 'luma-page', data });
  } catch (e: unknown) {
    return { ok: false, error: `patch: ${e instanceof Error ? e.message : String(e)}` };
  }

  const eventObj = object(object(data).event);
  const eventId = String(eventObj.api_id || '');
  if (!eventId.startsWith('evt-')) return { ok: false, error: `bad event id ${eventId}` };

  const { startDate, endDate, dateNote } = maybeCorrectAdfwDates(patch, html, eventObj);

  const id = `luma-${eventId}`;
  const fileStem = id.toLowerCase();
  let coverImage: string | null = patch.coverImage ?? null;

  const existingImgs = fs.readdirSync('public/events').filter((f) => f.startsWith(`${fileStem}-`) && f.endsWith('.webp'));
  if (existingImgs.length > 0) {
    coverImage = `/events/${existingImgs[0]}`;
  } else if (patch.coverImage && patch.coverImage.startsWith('http')) {
    try {
      const imgRes = await fetch(patch.coverImage, { signal: AbortSignal.timeout(30000) });
      if (imgRes.ok) {
        const original = Buffer.from(await imgRes.arrayBuffer());
        const optimized = await sharp(original)
          .rotate()
          .resize({ width: 1500, height: 1500, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 88 })
          .toBuffer();
        const filename = `${fileStem}-${hash(optimized).slice(0, 8)}.webp`;
        fs.writeFileSync(`public/events/${filename}`, optimized);
        coverImage = `/events/${filename}`;
      }
    } catch {
      /* keep remote or null */
    }
  }

  const description = editorialDescription({ ...patch, startDate }, lumaUrl);
  const country = patch.country === 'United Arab Emirates' ? 'AE' : patch.country || 'AE';
  const city =
    country === 'AE' && (!patch.city || patch.city.includes('أبو')) ? 'Abu Dhabi' : patch.city || 'Abu Dhabi';

  const slug = SLUG_MAP[path];

  const record: Web3Event = {
    ...(patch as Web3Event),
    id,
    ...(slug ? { slug } : {}),
    name: patch.name!,
    description,
    startDate,
    endDate,
    city,
    country,
    location: patch.location || 'Abu Dhabi, AE',
    url: lumaUrl,
    registrationUrl: lumaUrl,
    coverImage,
    month: monthLabel(startDate),
    source: 'luma-crypto',
    sideEventFor: ['adfw'],
    sourceVerification: {
      url: lumaUrl,
      eventId,
      fetchedAt,
      method: 'luma-page',
      ...(dateNote ? { dateNote } : {}),
    } as Web3Event['sourceVerification'],
  };

  if (!canImportEvent(record, tombstones)) {
    return { ok: false, id, error: 'retention/tombstone blocked' };
  }

  return { ok: true, id, record };
}

async function main() {
  const stored = JSON.parse(fs.readFileSync(CACHE, 'utf8')) as Web3Event[];
  const results: ImportResult[] = [];

  for (const path of LUMA_PATHS) {
    console.log(`\n→ ${path}`);
  // eslint-disable-next-line no-await-in-loop
    const result = await importOne(path);
    results.push(result);
    if (result.ok && result.record) {
      const idx = stored.findIndex((e) => e.id === result.id || e.url === result.record!.url);
      if (idx >= 0) stored[idx] = { ...stored[idx], ...result.record };
      else stored.push(result.record);
      console.log(`  OK ${result.id}`);
    } else {
      console.log(`  FAIL ${result.error}`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  let tagged = 0;
  for (const id of [...ADFW_W3V_IDS, ...ADFW_LUMA_IDS]) {
    const item = stored.find((e) => e.id === id);
    if (!item) {
      console.warn(`Tag skip: missing ${id}`);
      continue;
    }
    const set = new Set(item.sideEventFor || []);
    set.add('adfw');
    item.sideEventFor = [...set];
    if (item.city?.includes('أبو') || item.city === 'أبو ظبي') item.city = 'Abu Dhabi';
    if (item.country === 'United Arab Emirates') item.country = 'AE';
    tagged++;
  }

  write(CACHE, stored);

  const ok = results.filter((r) => r.ok);
  const fail = results.filter((r) => !r.ok);
  console.log('\n---');
  console.log(JSON.stringify({ ingested: ok.length, taggedSideEventFor: tagged, failures: fail }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});