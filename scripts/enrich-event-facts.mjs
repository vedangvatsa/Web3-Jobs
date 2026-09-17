/**
 * enrich-event-facts.mjs — pull verifiable facts (hosts, ticket price,
 * approval requirement, timezone, neighborhood) from Luma source pages
 * into event records. Never invents: only stores what the page states.
 *
 * Idempotent: skips events that already have hosts info.
 * Usage: node scripts/enrich-event-facts.mjs [--dry-run] [--limit N]
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx > -1 ? Number(args[limitIdx + 1]) || Infinity : Infinity;

const CONCURRENCY = Number(process.env.BACKFILL_CONCURRENCY || 2);
const DELAY_MS = Number(process.env.BACKFILL_DELAY_MS || 4000);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const FILES = [
  'content/events-cache.json',
  'content/luma-crypto-events.json',
  'content/curated-events.json',
  'content/kbw-luma-events.json',
  'content/ibw-side-events.json',
  'content/india-luma-events.json',
];

function hostName(h) {
  if (!h || typeof h !== 'object') return '';
  const full = `${h.first_name || ''} ${h.last_name || ''}`.trim();
  if (full && h.name && h.name.toLowerCase() !== full.toLowerCase()) return h.name;
  return h.name || full;
}

function extractFacts(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (!m) return null;
  let data;
  try {
    data = JSON.parse(m[1]);
  } catch {
    return null;
  }
  const root = data?.props?.pageProps?.initialData?.data;
  if (!root) return null;
  const ev = root.event || {};
  const hosts = Array.isArray(root.hosts)
    ? [...new Set(root.hosts.map(hostName).filter(Boolean))].slice(0, 4)
    : [];
  const ti = root.ticket_info || {};
  const cents = ti?.price?.cents;
  const currency = (ti?.price?.currency || 'usd').toUpperCase();
  let price = '';
  if (ti.is_free) price = 'Free';
  else if (typeof cents === 'number' && cents > 0) {
    price = `$${(cents / 100).toLocaleString('en-US')} ${currency}`;
  }
  const geo = ev.geo_address_info || {};
  return {
    hosts,
    price,
    approvalRequired: ti.require_approval === true,
    timezone: typeof ev.timezone === 'string' ? ev.timezone : '',
    neighborhood: typeof geo.sublocality === 'string' ? geo.sublocality : '',
  };
}

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function mapPool(items, size, fn) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(size, queue.length) }, async () => {
    while (queue.length) {
      await fn(queue.shift());
    }
  });
  await Promise.all(workers);
}

async function main() {
  let done = 0;
  let updated = 0;
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
      const url = e.url || '';
      if (!url.includes('luma.com/')) continue;
      if (Array.isArray(e.hosts) && e.hosts.length) continue;
      if (done >= LIMIT) break;
      targets.push(e);
      done++;
    }
    if (!targets.length) continue;
    console.log(`${file}: ${targets.length} events need facts`);
    let sinceSave = 0;
    await mapPool(targets, CONCURRENCY, async (e) => {
      if (consec429 >= 5 && !DRY_RUN) {
        failed++;
        return;
      }
      try {
        const facts = extractFacts(await fetchPage(e.url));
        consec429 = 0;
        if (!facts || (!facts.hosts.length && !facts.price && !facts.timezone)) {
          failed++;
          console.log(`  [no-facts] ${e.id}`);
        } else {
          if (DRY_RUN) {
            console.log(`  [dry] ${e.id}: hosts=${facts.hosts.join('|')} price=${facts.price} approval=${facts.approvalRequired} tz=${facts.timezone} hood=${facts.neighborhood}`);
          } else {
            if (facts.hosts.length) e.hosts = facts.hosts;
            if (facts.price) e.price = facts.price;
            if (facts.approvalRequired) e.approvalRequired = true;
            if (facts.timezone) e.timezone = facts.timezone;
            if (facts.neighborhood) e.neighborhood = facts.neighborhood;
            if (++sinceSave >= 10) {
              fs.writeFileSync(fp, JSON.stringify(arr, null, 2) + '\n');
              sinceSave = 0;
            }
          }
          updated++;
        }
      } catch (err) {
        failed++;
        if (/429/.test(err.message)) consec429++;
        else console.log(`  [fetch-fail] ${e.id}: ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, DELAY_MS));
    });
    if (!DRY_RUN) fs.writeFileSync(fp, JSON.stringify(arr, null, 2) + '\n');
  }
  console.log(`\nDone. considered=${done} enriched=${updated} failed=${failed}${DRY_RUN ? ' (dry run)' : ''}`);
}

main();
