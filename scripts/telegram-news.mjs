#!/usr/bin/env node
/**
 * Telegram News Poster
 * Fetches Web3 news from RSS feeds, uses Gemini to filter for importance
 * and rewrite into plain-English summaries, then posts to Telegram.
 *
 * Usage:
 *   node scripts/telegram-news.mjs              # Post once
 *   node scripts/telegram-news.mjs --dry-run    # Preview without posting
 */

import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import dotenv from 'dotenv';

try { dotenv.config({ path: new URL('../.env.local', import.meta.url).pathname }); } catch {}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_NEWS_CHANNEL_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const STORIES_PER_POST = 5;
const CTA_URL = 'https://hashtagweb3.com/news?utm_source=telegram&utm_medium=social&utm_campaign=news_digest';
const POSTED_LOG = path.join(path.dirname(new URL(import.meta.url).pathname), '../.telegram-news-posted.json');

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_NEWS_CHANNEL_ID');
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY');
  process.exit(1);
}

// ── RSS Feeds ──
const FEEDS = [
  { url: 'https://decrypt.co/feed', source: 'Decrypt' },
  { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph' },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' },
  { url: 'https://www.theblock.co/rss.xml', source: 'The Block' },
  { url: 'https://blockchain.news/RSS/', source: 'Blockchain.News' },
  { url: 'https://dailyhodl.com/feed/', source: 'Daily Hodl' },
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
  const arr = [...posted].slice(-300);
  fs.writeFileSync(POSTED_LOG, JSON.stringify(arr));
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
        console.warn(`  ⚠️ Skip ${f.source}: ${e.message}`);
        return [];
      }
    })
  );

  for (const items of results) all.push(...items);

  // Sort newest first
  all.sort((a, b) => b.date - a.date);

  // Dedup by keyword overlap (same approach as website news.ts)
  function getKeywords(text) {
    const stop = new Set(['this','that','with','from','what','where','when','crypto','web3','bitcoin','ethereum','the','and','for']);
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
          console.warn(`  ⚠️ ${model} unavailable (${res.status}), retrying...`);
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }

        if (!res.ok) {
          const err = await res.text();
          console.warn(`  ⚠️ ${model} error ${res.status}, trying next model...`);
          break; // try next model
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log(`  Using model: ${model}`);
        return text;
      } catch (e) {
        console.warn(`  ⚠️ ${model} failed: ${e.message}`);
      }
    }
  }
  throw new Error('All Gemini models failed');
}

async function filterAndSummarize(newsItems) {
  const headlines = newsItems.slice(0, 30).map((n, i) => (
    `${i + 1}. [${n.source}] ${n.title}\n   ${n.snippet}`
  )).join('\n\n');

  const prompt = `Pick the ${STORIES_PER_POST} most important Web3 industry stories from these ${Math.min(newsItems.length, 30)} items.

Pick stories about: funding rounds, protocol launches/upgrades, regulatory moves, major partnerships, market structure changes.

Skip: memecoins, celebrity drama, price predictions, whale movements, clickbait, lawsuits that don't set precedent, company product announcements or PR pieces (e.g. "X company launches Y product" or "X offers solution"), sponsored content.

CRITICAL: All 5 stories must be about DIFFERENT events. Never pick two stories covering the same news from different sources.

Do NOT name-drop specific products or brand names in summaries. Describe what happened without promoting any company's product.

For each story write:
- headline: factual, max 10 words, no hype. Spell out all acronyms (write "US commodities regulator" not "CFTC", write "Chicago Mercantile Exchange" not "CME"). No jargon a non-crypto reader wouldn't understand.
- summary: 1 sentence, max 20 words. DO NOT repeat the headline. Add context, numbers, or consequences that the headline doesn't already state.

Write like a wire service. Plain, direct, no filler.

BANNED WORDS: "signifies", "highlights", "underscores", "reshapes", "poised", "bolsters", "notably", "landscape", "paradigm", "innovative", "robust", "leveraging", "cutting-edge", "game-changer", "pivotal", "crucial", "essential", "transformative", "marks a", "reflects".

Return ONLY a JSON array of exactly ${STORIES_PER_POST} objects: {"index", "headline", "summary"}

${headlines}`;

  const text = await callGemini(prompt);

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`Could not parse Gemini response: ${text.substring(0, 200)}`);

  const selected = JSON.parse(jsonMatch[0]);
  
  // Map back to original items
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
    const trackedLink = `${s.link}${sep}utm_source=hashtagweb3&utm_medium=telegram&utm_campaign=news_digest`;
    return `<a href="${trackedLink}"><b>${headline}</b></a>. ${summary}`;
  });

  return lines.join('\n\n') + '\n\n_\nWeb3 News Feed: t.me/web3newsfeed';
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
  console.log('📰 Fetching news feeds...');
  const allNews = await fetchAllNews();
  console.log(`  Found ${allNews.length} unique stories`);

  // Filter out already posted
  const posted = loadPosted();
  const fresh = allNews.filter(n => !posted.has(n.link));
  console.log(`  ${fresh.length} not yet posted`);

  if (fresh.length < STORIES_PER_POST) {
    console.log('  Not enough fresh stories, resetting history');
    posted.clear();
    savePosted(posted);
    return postOnce();
  }

  console.log('🤖 Asking Gemini to filter & summarize...');
  const stories = await filterAndSummarize(fresh);
  console.log(`  Selected ${stories.length} stories`);

  const message = formatMessage(stories);

  if (process.argv.includes('--dry-run')) {
    console.log('\n=== DRY RUN ===\n');
    console.log(message.replace(/<[^>]+>/g, '')); // strip HTML for terminal
    console.log(`\n${stories.length} stories selected`);
    return;
  }

  const result = await sendToTelegram(message);
  const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' });
  console.log(`✅ Posted ${stories.length} stories at ${now} | Message ID: ${result.result.message_id}`);

  // Mark as posted
  for (const s of stories) if (s.link) posted.add(s.link);
  savePosted(posted);
}

postOnce().catch(e => { console.error('❌', e); process.exit(1); });
