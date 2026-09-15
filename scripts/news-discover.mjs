/**
 * news-discover.mjs — fetch crypto RSS feeds, keep stories from the last
 * N hours, drop anything overlapping existing article slugs/titles, and
 * print a ranked candidate list as JSON for the news-writing agent.
 *
 * Usage: node scripts/news-discover.mjs [--hours 10] [--max 12]
 * No dependencies. Exits 0 with [] when nothing qualifies (slow-news days
 * must not fail the workflow).
 */

import fs from 'fs';
import path from 'path';

const FEEDS = [
  { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss' },
  { name: 'Crypto Briefing', url: 'https://cryptobriefing.com/feeds/' },
  { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss' },
  { name: 'Decrypt', url: 'https://decrypt.co/feed' },
];

const args = process.argv.slice(2);
const hours = Number((args[args.indexOf('--hours') + 1]) || process.env.NEWS_LOOKBACK_HOURS || 10);
const maxOut = Number((args[args.indexOf('--max') + 1]) || 12);

function stripTags(s) {
  return (s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickTag(block, names) {
  for (const n of names) {
    const m = block.match(new RegExp(`<${n}[^>]*>([\\s\\S]*?)<\\/${n}>`, 'i'));
    if (m) return stripTags(m[1]);
  }
  return '';
}

function parseFeed(xml) {
  const items = [];
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/(item|entry)>/gi) || [];
  for (const b of blocks) {
    const title = pickTag(b, ['title']);
    let link = pickTag(b, ['link']);
    if (!link) {
      const lm = b.match(/<link[^>]*href="([^"]+)"/i);
      if (lm) link = lm[1];
    }
    const pub = pickTag(b, ['pubDate', 'published', 'updated', 'dc:date']);
    if (title && link) items.push({ title, link, pubDate: pub });
  }
  return items;
}

// Tokens from existing slugs/titles so we skip stories we already covered.
function existingTokens() {
  const dir = path.join(process.cwd(), 'content', 'articles');
  const toks = new Set();
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md') || f === 'AGENTS.md') continue;
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = raw.match(/^title:\s*(.+)$/m);
    const words = ((m ? m[1] : '') + ' ' + f.replace(/\.md$/, '').replace(/-/g, ' '))
      .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 4);
    for (const w of words) toks.add(w);
  }
  return toks;
}

function overlapScore(title, toks) {
  const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 4);
  if (!words.length) return 0;
  let hit = 0;
  for (const w of words) if (toks.has(w)) hit++;
  return hit / words.length;
}

// Jaccard similarity of a candidate title against every existing article
// title+slug. Catches same-story-different-words that token overlap misses.
function titleSets() {
  const dir = path.join(process.cwd(), 'content', 'articles');
  const sets = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md') || f === 'AGENTS.md') continue;
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = raw.match(/^title:\s*(.+)$/m);
    const set = new Set((((m ? m[1] : '') + ' ' + f.replace(/\.md$/, '').replace(/-/g, ' '))
      .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3)));
    if (set.size) sets.push({ file: f, set });
  }
  return sets;
}

function maxJaccard(title, sets) {
  const mine = new Set(title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3));
  if (!mine.size) return { score: 0, file: null };
  let best = { score: 0, file: null };
  for (const { file, set } of sets) {
    let inter = 0;
    for (const w of mine) if (set.has(w)) inter++;
    const s = inter / (mine.size + set.size - inter);
    if (s > best.score) best = { score: s, file };
  }
  return best;
}

// Prefer regulation, ETF, majors, launches; demote price-chatter and evergreen guides.
function rankScore(title) {
  const t = title.toLowerCase();
  let s = 0;
  if (/\b(sec|fca|cftc|senate|house|vote|bill|act|lawsuit|court|fine|ban|license|etf|staking|reserve|audit)\b/.test(t)) s += 3;
  if (/\b(launch|mainnet|upgrade|hardfork|raises|funding|invests|partnership|acquires)\b/.test(t)) s += 2;
  if (/\b(bitcoin|ethereum|solana|xrp|blackrock|coinbase|binance|circle|tether)\b/.test(t)) s += 1;
  if (/\b(price prediction|price analysis|will .* (hit|reach)|top .* to buy|explain(ed)?|what is|how to|guide)\b/.test(t)) s -= 4;
  return s;
}

async function main() {
  const cutoff = Date.now() - hours * 3600 * 1000;
  const toks = existingTokens();
  const sets = titleSets();
  const seen = new Set();
  const out = [];
  for (const feed of FEEDS) {
    let xml = '';
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'HashtagWeb3NewsBot/1.0 (+https://hashtagweb3.com)', Accept: 'application/rss+xml, application/xml, text/xml' },
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) continue;
      xml = await res.text();
    } catch {
      continue; // a dead feed must never fail the run
    }
    for (const it of parseFeed(xml)) {
      const ts = it.pubDate ? Date.parse(it.pubDate) : NaN;
      if (Number.isNaN(ts) || ts < cutoff) continue;
      if (seen.has(it.link)) continue;
      seen.add(it.link);
      const overlap = overlapScore(it.title, toks);
      if (overlap >= 0.45) continue; // already covered
      const near = maxJaccard(it.title, sets);
      if (near.score >= 0.5) continue; // same story, different words
      out.push({ source: feed.name, title: it.title, link: it.link, published: new Date(ts).toISOString(), score: rankScore(it.title) });
    }
  }
  out.sort((a, b) => b.score - a.score || (b.published > a.published ? 1 : -1));
  console.log(JSON.stringify(out.slice(0, maxOut), null, 2));
}

main();
