/**
 * telegram-native-articles.mjs — post newly published NATIVE News articles
 * (content/articles/*.md, category News) to the Telegram news channel.
 * Each slug is posted AT MOST ONCE (persistent state file committed back).
 *
 * Usage: node scripts/telegram-native-articles.mjs [--dry-run] [--force] [--max 5]
 * Env: TELEGRAM_BOT_TOKEN, TELEGRAM_NEWS_CHANNEL_ID
 *
 * Message carries the article link with preview ENABLED so Telegram unfurls
 * the OG card. Never reposts: slugs already in state are skipped always.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_NEWS_CHANNEL_ID;
const DRY = process.argv.includes('--dry-run');
const argMax = process.argv.indexOf('--max');
const MAX_POSTS = argMax > -1 ? Math.max(1, Number(process.argv[argMax + 1]) || 5) : 5;

const dir = path.dirname(new URL(import.meta.url).pathname);
const ARTICLES = path.join(dir, '../content/articles');
const STATE_FILE = path.join(dir, '../.telegram-native-posted.json');
const SITE = 'https://hashtagweb3.com';

function loadPosted() {
  try {
    const arr = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function savePosted(set) {
  fs.writeFileSync(STATE_FILE, JSON.stringify([...set].slice(-500)));
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function listNativeNews() {
  const out = [];
  for (const f of fs.readdirSync(ARTICLES)) {
    if (!f.endsWith('.md') || f === 'AGENTS.md') continue;
    const full = path.join(ARTICLES, f);
    let data;
    try {
      data = matter(fs.readFileSync(full, 'utf8')).data;
    } catch {
      continue;
    }
    if (data.category !== 'News') continue;
    if (!data.title || !data.description) continue;
    const stat = fs.statSync(full);
    out.push({ slug: f.replace(/\.md$/, ''), title: String(data.title), description: String(data.description), mtime: stat.mtimeMs });
  }
  out.sort((a, b) => a.mtime - b.mtime); // oldest unpublished first
  return out;
}

async function send(text) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(`Telegram send failed: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data?.result?.message_id;
}

function formatMessage(a) {
  const title = escapeHtml(a.title);
  const desc = escapeHtml(a.description.length > 220 ? a.description.slice(0, 217) + '...' : a.description);
  return `📰 <b>${title}</b>\n\n${desc}\n\n<a href="${SITE}/${a.slug}">Read full story</a>`;
}

async function main() {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_NEWS_CHANNEL_ID');
    process.exit(1);
  }
  const posted = loadPosted();
  // No force-resend path by design: a native article is posted at most once.
  const queue = listNativeNews().filter((a) => !posted.has(a.slug)).slice(0, MAX_POSTS);
  console.log(`Native news articles: ${listNativeNews().length}, already posted: ${posted.size}, queueing: ${queue.length}`);
  let sent = 0;
  for (const a of queue) {
    const text = formatMessage(a);
    if (DRY) {
      console.log(`[dry-run] would post: ${a.slug}`);
      continue;
    }
    try {
      const id = await send(text);
      posted.add(a.slug);
      savePosted(posted);
      sent++;
      console.log(`Posted ${a.slug} (message ${id})`);
    } catch (e) {
      console.error(`Failed ${a.slug}: ${e.message}`);
      break; // stop on first failure; state already saved for successes
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log(DRY ? 'Dry run complete. Nothing sent.' : `Done. Sent ${sent}/${queue.length}.`);
}

main();
