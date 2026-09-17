/**
 * refresh-event-covers-fullbleed.mjs — repair center-cropped covers.
 *
 * Old pipeline forced every Luma cover through a 16:9 cover-crop, decapitating
 * square/portrait posters (titles, logos). This re-downloads the ORIGINAL
 * full-bleed artwork for stored covers that are exactly 1600x900 and swaps
 * them only when the original aspect differs materially from 16:9.
 *
 * Idempotent, checkpointed every 10 events, backs off on 429s.
 * Usage: node scripts/refresh-event-covers-fullbleed.mjs [--dry-run] [--limit N]
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx > -1 ? Number(args[limitIdx + 1]) || Infinity : Infinity;

const CONCURRENCY = Number(process.env.COVER_CONCURRENCY || 2);
const DELAY_MS = Number(process.env.COVER_DELAY_MS || 4000);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const BOT_UA = 'HashtagWeb3NewsBot/1.0 (+https://hashtagweb3.com; editorial image use with attribution)';

const FILES = [
  'content/events-cache.json',
  'content/luma-crypto-events.json',
  'content/curated-events.json',
  'content/kbw-luma-events.json',
  'content/ibw-side-events.json',
  'content/india-luma-events.json',
];

async function fetchText(url, ua) {
  const res = await fetch(url, {
    headers: { 'User-Agent': ua },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': BOT_UA, Accept: 'image/avif,image/webp,image/png,image/jpeg,*/*' },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 10_000) throw new Error(`too small (${buf.length}b)`);
  return buf;
}

function lumaCoverUrl(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (!m) return '';
  try {
    const data = JSON.parse(m[1]);
    return data?.props?.pageProps?.initialData?.data?.event?.cover_url || '';
  } catch {
    return '';
  }
}

function dims(buf) {
  return sharp(buf).metadata().then((m) => ({ w: m.width || 0, h: m.height || 0 })).catch(() => null);
}

async function mapPool(items, size, fn) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(size, queue.length) }, async () => {
      while (queue.length) await fn(queue.shift());
    }),
  );
}

async function main() {
  let done = 0;
  let swapped = 0;
  let kept = 0;
  let failed = 0;
  let consec429 = 0;
  for (const file of FILES) {
    const fp = path.join(process.cwd(), file);
    if (!fs.existsSync(fp)) continue;
    const arr = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (!Array.isArray(arr)) continue;
    const targets = [];
    for (const e of arr) {
      if (!e || typeof e !== 'object') continue;
      const local = e.coverImage || '';
      const url = e.url || '';
      if (!local.startsWith('/events/') || !url.includes('luma.com/') || done >= LIMIT) continue;
      let size = null;
      try {
        size = await dims(fs.readFileSync(path.join(process.cwd(), 'public', local)));
      } catch {
        continue;
      }
      if (size && size.w === 1600 && size.h === 900) {
        targets.push(e);
        done++;
      }
    }
    if (!targets.length) continue;
    console.log(`${file}: ${targets.length} cropped candidates`);
    await mapPool(targets, CONCURRENCY, async (e) => {
      if (consec429 >= 5 && !DRY_RUN) {
        failed++;
        return;
      }
      try {
        const coverUrl = lumaCoverUrl(await fetchText(e.url, UA));
        if (!coverUrl) {
          failed++;
          console.log(`  [no-cover-url] ${e.id}`);
          return;
        }
        consec429 = 0;
        const buf = await fetchBuffer(coverUrl);
        const meta = await dims(buf);
        if (!meta || !meta.w || !meta.h) {
          failed++;
          return;
        }
        const aspect = meta.w / meta.h;
        const wide = 16 / 9;
        if (Math.abs(aspect - wide) / wide < 0.03) {
          kept++;
          return; // genuinely 16:9, current file is fine
        }
        if (DRY_RUN) {
          console.log(`  [dry] ${e.id}: original ${meta.w}x${meta.h} (stored 1600x900 cropped)`);
          swapped++;
          return;
        }
        const webp = await sharp(buf, { density: 96 })
          .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80, alphaQuality: 85 })
          .toBuffer();
        const dest = path.join(process.cwd(), 'public', e.coverImage);
        fs.writeFileSync(dest, webp);
        console.log(`  [swapped] ${e.id}: ${meta.w}x${meta.h} -> ${Math.round(webp.length / 1024)}KB`);
        swapped++;
      } catch (err) {
        failed++;
        if (/429/.test(err.message)) consec429++;
        else console.log(`  [fail] ${e.id}: ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, DELAY_MS));
    });
  }
  console.log(`\nDone. considered=${done} swapped=${swapped} kept-16x9=${kept} failed=${failed}${DRY_RUN ? ' (dry run)' : ''}`);
}

main();
