/**
 * backfill-event-descriptions.mjs — enrich thin event descriptions from
 * their Luma source pages (ProseMirror description_mirror in __NEXT_DATA__).
 *
 * Idempotent: skips events whose description is already >= MIN_LEN.
 * Usage: node scripts/backfill-event-descriptions.mjs [--dry-run] [--limit N] [--file <name>]
 * No dependencies.
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx > -1 ? Number(args[limitIdx + 1]) || Infinity : Infinity;
const fileIdx = args.indexOf('--file');
const ONLY_FILE = fileIdx > -1 ? args[fileIdx + 1] : null;
const INCLUDE_OFFICIAL = args.includes('--include-official');

const MIN_LEN = 150;
const MAX_LEN = 1800;
const UA = 'HashtagWeb3NewsBot/1.0 (+https://hashtagweb3.com; editorial enrichment)';
const CONCURRENCY = Number(process.env.BACKFILL_CONCURRENCY || 5);
const DELAY_MS = Number(process.env.BACKFILL_DELAY_MS || 800);

const FILES = [
  'content/events/sources/events-cache.json',
  'content/events/sources/luma-crypto-events.json',
  'content/events/sources/curated-events.json',
  'content/events/sources/kbw-luma-events.json',
  'content/events/sources/ibw-side-events.json',
  'content/events/sources/india-luma-events.json',
].filter((f) => !ONLY_FILE || f.endsWith(ONLY_FILE));

function prosemirrorText(node, out) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const n of node) prosemirrorText(n, out);
    return;
  }
  if (typeof node !== 'object') return;
  if (typeof node.text === 'string') out.push(node.text);
  if (node.content) {
    const before = out.length;
    prosemirrorText(node.content, out);
    // block-level separation between sibling blocks
    if (out.length > before && ['paragraph', 'heading', 'bullet_list', 'ordered_list', 'list_item', 'blockquote'].includes(node.type)) {
      out.push('\n');
    }
  }
}

function extractMetaDescription(html) {
  const m =
    html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]{100,})"/i) ||
    html.match(/<meta[^>]+content="([^"]{100,})"[^>]+property="og:description"/i) ||
    html.match(/<meta[^>]+name="description"[^>]+content="([^"]{100,})"/i) ||
    html.match(/<meta[^>]+content="([^"]{100,})"[^>]+name="description"/i);
  if (!m) return '';
  return m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

function extractLumaDescription(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (!m) return extractMetaDescription(html);
  let data;
  try {
    data = JSON.parse(m[1]);
  } catch {
    return '';
  }
  const mirror = data?.props?.pageProps?.initialData?.data?.description_mirror;
  if (!mirror) return '';
  const parts = [];
  prosemirrorText(mirror.content || mirror, parts);
  return parts
    .join(' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

function truncate(s) {
  if (s.length <= MAX_LEN) return s;
  const cut = s.slice(0, MAX_LEN);
  // Prefer a sentence boundary; else a word boundary; never mid-word and
  // never inside a URL.
  const sent = Math.max(
    cut.lastIndexOf('. '),
    cut.lastIndexOf('.\n'),
    cut.lastIndexOf('! '),
    cut.lastIndexOf('? '),
  );
  if (sent > MAX_LEN * 0.4) return cut.slice(0, sent + 1).trim();
  let end = cut.lastIndexOf(' ');
  const urlStart = cut.lastIndexOf('http');
  if (urlStart > -1 && urlStart < end && !cut.slice(urlStart, end).includes(' ')) {
    end = cut.lastIndexOf(' ', urlStart);
  }
  return (end > MAX_LEN * 0.4 ? cut.slice(0, end) : cut).trim();
}

async function fetchLuma(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36' },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function mapPool(items, size, fn) {
  const results = [];
  const queue = [...items];
  const workers = Array.from({ length: Math.min(size, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      results.push(await fn(item));
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  let done = 0;
  let updated = 0;
  let failed = 0;
  for (const file of FILES) {
    const fp = path.join(process.cwd(), file);
    if (!fs.existsSync(fp)) continue;
    const arr = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (!Array.isArray(arr)) continue;
    const targets = [];
    for (const e of arr) {
      if (!e || typeof e !== 'object') continue;
      const desc = e.description || '';
      const url = e.url || '';
      const isLuma = url.includes('luma.com/') || url.includes('lu.ma/');
      if (desc.length < MIN_LEN && (isLuma || (INCLUDE_OFFICIAL && /^https?:\/\//.test(url))) && done < LIMIT) {
        targets.push(e);
        done++;
      }
    }
    if (!targets.length) continue;
    console.log(`${file}: ${targets.length} thin luma events`);
    let sinceSave = 0;
    const saveNow = () => {
      if (DRY_RUN) return;
      fs.writeFileSync(fp, JSON.stringify(arr, null, 2) + '\n');
      sinceSave = 0;
    };
    let consec429 = 0;
    await mapPool(targets, CONCURRENCY, async (e) => {
      if (consec429 >= 5 && !DRY_RUN) {
        // Stop early on sustained rate limiting; progress already saved.
        failed++;
        return;
      }
      try {
        const html = await fetchLuma(e.url);
        consec429 = 0;
        const text = truncate(extractLumaDescription(html));
        if (text.length >= 200) {
          if (DRY_RUN) {
            console.log(`  [dry] ${e.id}: ${text.length} chars — ${text.slice(0, 120).replace(/\n/g, ' ')}...`);
          } else {
            e.description = text;
            if (++sinceSave >= 10) {
              saveNow();
              console.log(`  checkpoint: ${updated + 1} enriched in ${file}`);
            }
          }
          updated++;
        } else {
          failed++;
          console.log(`  [thin-result] ${e.id} (${text.length} chars)`);
        }
      } catch (err) {
        failed++;
        console.log(`  [fetch-fail] ${e.id}: ${err.message}`);
        if (/429/.test(err.message)) consec429++;
      }
      await new Promise((r) => setTimeout(r, DELAY_MS));
    });
    if (!DRY_RUN) {
      saveNow();
      console.log(`  wrote ${file}`);
    }
  }
  console.log(`\nDone. considered=${done} enriched=${updated} failed=${failed}${DRY_RUN ? ' (dry run)' : ''}`);
}

main();
