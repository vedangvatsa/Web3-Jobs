#!/usr/bin/env node
/**
 * Telegram AI News Poster
 * Fetches AI/ML news from RSS feeds, uses Gemini to filter for importance
 * and rewrite into plain-English summaries, then posts to Telegram.
 *
 * Usage:
 *   node scripts/telegram-ai-news.mjs              # Post once
 *   node scripts/telegram-ai-news.mjs --dry-run    # Preview without posting
 */

import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import dotenv from 'dotenv';

try { dotenv.config({ path: new URL('../.env.local', import.meta.url).pathname }); } catch {}

const BOT_TOKEN = process.env.TELEGRAM_AI_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_AI_CHANNEL_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const STORIES_PER_POST = 5;
const POST_COOLDOWN_HOURS = 8; // Only post every 8 hours
const POSTED_LOG = path.join(path.dirname(new URL(import.meta.url).pathname), '../.telegram-ai-news-posted.json');
const LAST_POST_FILE = path.join(path.dirname(new URL(import.meta.url).pathname), '../.telegram-ai-news-last.json');

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('Missing TELEGRAM_AI_BOT_TOKEN or TELEGRAM_AI_CHANNEL_ID');
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY');
  process.exit(1);
}

// ── AI/ML RSS Feeds ──
const FEEDS = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', source: 'The Verge' },
  { url: 'https://arstechnica.com/ai/feed/', source: 'Ars Technica' },
  { url: 'https://www.wired.com/feed/tag/ai/latest/rss', source: 'Wired' },
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat' },
  { url: 'https://www.technologyreview.com/feed/', source: 'MIT Tech Review' },
];

const parser = new Parser();

// ── Posted history ──
function loadPosted() {
  try {
    return new Set(JSON.parse(fs.readFileSync(POSTED_LOG, 'utf8')));
  } catch {
    return new Set();
  }
}

function savePosted(posted) {
  fs.writeFileSync(POSTED_LOG, JSON.stringify([...posted]));
}

// ── Fetch all RSS news ──
async function fetchAllNews() {
  const all = [];

  const results = await Promise.all(
    FEEDS.map(async (f) => {
      try {
        const feed = await Promise.race([
          parser.parseURL(f.url),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
        ]);
        const items = [];
        for (const item of (feed.items || []).slice(0, 15)) {
          if (item.title && item.link && item.pubDate) {
            items.push({
              title: item.title.trim(),
              link: item.link.trim(),
              snippet: (item.contentSnippet || '').substring(0, 300).trim(),
              source: f.source,
              date: new Date(item.pubDate),
            });
          }
        }
        return items;
      } catch (e) {
        console.warn(`  Skip ${f.source}: ${e.message}`);
        return [];
      }
    })
  );

  for (const items of results) all.push(...items);
  all.sort((a, b) => b.date - a.date);

  // Dedup by keyword overlap
  function getKeywords(text) {
    const stop = new Set(['this','that','with','from','what','where','when','the','and','for','artificial','intelligence']);
    return text.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !stop.has(w));
  }
  function isSimilar(a, b) {
    const wa = new Set(getKeywords(a));
    const wb = new Set(getKeywords(b));
    if (!wa.size || !wb.size) return false;
    let overlap = 0;
    for (const w of wa) if (wb.has(w)) overlap++;
    return overlap / Math.min(wa.size, wb.size) > 0.5;
  }

  const unique = [];
  for (const item of all) {
    if (!unique.some(u => isSimilar(item.title, u.title))) {
      unique.push(item);
    }
  }

  return unique;
}

// ── Gemini: filter + summarize ──
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

async function callGemini(prompt) {
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
            }),
          }
        );

        if (res.status === 503 || res.status === 429) {
          console.warn(`  ${model} unavailable (${res.status}), retrying...`);
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }

        if (!res.ok) {
          console.warn(`  ${model} error ${res.status}, trying next model...`);
          break;
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log(`  Using model: ${model}`);
        return text;
      } catch (e) {
        console.warn(`  ${model} failed: ${e.message}`);
      }
    }
  }
  throw new Error('All Gemini models failed');
}

async function filterAndSummarize(newsItems) {
  const headlines = newsItems.slice(0, 30).map((n, i) => (
    `${i + 1}. [${n.source}] ${n.title}\n   ${n.snippet}`
  )).join('\n\n');

  const prompt = `Pick the ${STORIES_PER_POST} most important AI industry stories from these ${Math.min(newsItems.length, 30)} items.

These should be stories an AI professional MUST know today. Think industry-moving events only.

Pick: new model releases, major research breakthroughs, funding rounds ($50M+), regulatory moves, open-source releases, infrastructure changes, industry shifts, notable deployments at scale.

Skip: opinion pieces, listicles, how-to guides, product reviews, company PR or marketing pieces, sponsored content, minor feature updates, one company's internal changes or earnings.

CRITICAL: All 5 stories must be about DIFFERENT events. Never pick two stories covering the same news from different sources.

For each story write:
- headline: factual, max 10 words, no hype. USE the company name (e.g. "OpenAI releases new reasoning model" not "AI company releases new model"). No jargon a non-technical reader wouldn't understand.
- summary: 1 sentence, max 20 words. DO NOT repeat the headline. Add context, numbers, or consequences. Do NOT name-drop third-party products or brands in the summary.

Write like a wire service. Plain, direct, no filler.

BANNED WORDS: "signifies", "highlights", "underscores", "reshapes", "poised", "bolsters", "notably", "landscape", "paradigm", "innovative", "robust", "leveraging", "cutting-edge", "game-changer", "pivotal", "crucial", "essential", "transformative", "marks a", "reflects".

Return ONLY a JSON array of exactly ${STORIES_PER_POST} objects: {"index", "headline", "summary"}

${headlines}`;

  const text = await callGemini(prompt);

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`Could not parse Gemini response: ${text.substring(0, 200)}`);

  const selected = JSON.parse(jsonMatch[0]);
  
  return selected.map(s => ({
    ...s,
    link: newsItems[s.index - 1]?.link,
    source: newsItems[s.index - 1]?.source,
  }));
}

// ── Format Telegram message ──
function formatMessage(stories) {
  const lines = stories.map(s => {
    const headline = escapeHtml(s.headline);
    const summary = escapeHtml(s.summary);
    const sep = s.link.includes('?') ? '&' : '?';
    const trackedLink = `${s.link}${sep}utm_source=hashtag_ai&utm_medium=telegram&utm_campaign=ai_digest`;
    return `<a href="${trackedLink}"><b>${headline}</b></a>. ${summary}`;
  });

  return lines.join('\n\n') + '\n\n_\nAI Discussion Group: t.me/hashtag_ai';
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Send to Telegram ──
async function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
  return data;
}

// ── Main ──
async function postOnce() {
  // ── 8-hour cooldown ──
  try {
    const last = JSON.parse(fs.readFileSync(LAST_POST_FILE, 'utf8'));
    const hoursSince = (Date.now() - new Date(last.postedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSince < POST_COOLDOWN_HOURS && !process.argv.includes('--force')) {
      console.log(`⏳ Last posted ${hoursSince.toFixed(1)}h ago. Cooldown is ${POST_COOLDOWN_HOURS}h. Skipping.`);
      return;
    }
  } catch {}

  console.log('Fetching AI news feeds...');
  const allNews = await fetchAllNews();
  console.log(`  Found ${allNews.length} unique stories`);

  // Filter out already posted (by link AND by headline similarity)
  const posted = loadPosted();
  const postedHeadlines = [...posted].filter(p => !p.startsWith('http'));
  const postedLinks = [...posted].filter(p => p.startsWith('http'));

  function getKeywordsForDedup(text) {
    const stop = new Set(['this','that','with','from','what','where','when','the','and','for','artificial','intelligence','says','could','will','would','about']);
    return text.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !stop.has(w));
  }
  function isHeadlineSimilar(a, b) {
    const wa = new Set(getKeywordsForDedup(a));
    const wb = new Set(getKeywordsForDedup(b));
    if (!wa.size || !wb.size) return false;
    let overlap = 0;
    for (const w of wa) if (wb.has(w)) overlap++;
    return overlap / Math.min(wa.size, wb.size) > 0.5;
  }

  const fresh = allNews.filter(n => {
    if (postedLinks.includes(n.link)) return false;
    if (postedHeadlines.some(h => isHeadlineSimilar(n.title, h))) return false;
    return true;
  });
  console.log(`  ${fresh.length} not yet posted`);

  if (fresh.length < STORIES_PER_POST) {
    console.log('  Not enough fresh stories, skipping this run');
    return;
  }

  console.log('Asking Gemini to filter & summarize...');
  const stories = await filterAndSummarize(fresh);
  console.log(`  Selected ${stories.length} stories`);

  const message = formatMessage(stories);

  if (process.argv.includes('--dry-run')) {
    console.log('\n=== DRY RUN ===\n');
    console.log(message.replace(/<[^>]+>/g, ''));
    console.log(`\n${stories.length} stories selected`);
    return;
  }

  const result = await sendToTelegram(message);
  const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' });
  console.log(`Posted ${stories.length} stories at ${now} | Message ID: ${result.result.message_id}`);

  // Save cooldown timestamp
  fs.writeFileSync(LAST_POST_FILE, JSON.stringify({ postedAt: new Date().toISOString() }));

  // Mark as posted (store both link and headline for cross-source dedup)
  for (const s of stories) {
    if (s.link) posted.add(s.link);
    if (s.headline) posted.add(s.headline);
  }
  savePosted(posted);
}

postOnce().catch(e => { console.error(e); process.exit(1); });
