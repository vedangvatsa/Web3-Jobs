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
const STORIES_PER_POST = 3;
const POST_COOLDOWN_HOURS = 7; // Only post every 7 hours
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

// ── Helpers for URL Normalization and Word Stemming ──
function normalizeUrl(urlString) {
  try {
    const url = new URL(urlString);
    let host = url.hostname.toLowerCase();
    if (host.startsWith('www.')) host = host.substring(4);
    let pathname = url.pathname;
    if (pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    return `${host}${pathname}`;
  } catch {
    return urlString.trim().toLowerCase();
  }
}

function stemWord(word) {
  let w = word.toLowerCase().trim();
  if (w.endsWith('ies')) {
    w = w.slice(0, -3) + 'y';
  } else if (w.endsWith('s') && !w.endsWith('us') && !w.endsWith('is') && !w.endsWith('ss')) {
    w = w.slice(0, -1);
  }
  if (w.endsWith('ing')) {
    w = w.slice(0, -3);
  } else if (w.endsWith('ed')) {
    w = w.slice(0, -2);
  }
  if (w.endsWith('e') && w.length > 3) {
    w = w.slice(0, -1);
  }
  return w;
}

function getKeywords(text) {
  const stop = new Set([
    'this','that','with','from','what','where','when','the','and','for',
    'says','could','will','would','about','after','amid','over','under',
    'into','onto','than','then','artificial','intelligence'
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 3 && !stop.has(w))
    .map(stemWord)
    .filter(w => w.length > 2);
}

function isSimilar(a, b, threshold = 0.4) {
  const wa = new Set(getKeywords(a));
  const wb = new Set(getKeywords(b));
  if (!wa.size || !wb.size) return false;
  let overlap = 0;
  for (const w of wa) if (wb.has(w)) overlap++;
  return overlap / Math.min(wa.size, wb.size) > threshold;
}

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

  // Dedup by URL uniqueness and keyword overlap
  const unique = [];
  const seenUrls = new Set();
  for (const item of all) {
    const normUrl = normalizeUrl(item.link);
    if (seenUrls.has(normUrl)) continue;

    if (!unique.some(u => isSimilar(item.title, u.title, 0.4) || normalizeUrl(u.link) === normUrl)) {
      unique.push(item);
      seenUrls.add(normUrl);
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

async function filterAndSummarize(newsItems, recentHeadlines = []) {
  const headlines = newsItems.slice(0, 30).map((n, i) => (
    `${i + 1}. [${n.source}] ${n.title}\n   ${n.snippet}`
  )).join('\n\n');

  // Include recently posted headlines so Gemini avoids the same events
  const recentBlock = recentHeadlines.length > 0
    ? `\n\nALREADY POSTED (do NOT pick stories about the same events, even if worded differently):\n${recentHeadlines.map(h => `- ${h}`).join('\n')}\n`
    : '';

  const prompt = `Pick the ${STORIES_PER_POST} most important AI industry stories from these ${Math.min(newsItems.length, 30)} items.

These should be stories an AI professional MUST know today. Think industry-moving events only.

RELEVANCE FILTER — stories MUST be directly about artificial intelligence, machine learning, LLMs, AI infrastructure, or AI regulation. Reject stories about general tech, crypto, gaming, social media drama, or business news that merely mentions AI in passing. If AI is not the core subject, skip it.

Pick: new model releases, major research breakthroughs, funding rounds ($50M+), regulatory moves on AI, open-source releases, infrastructure changes, industry shifts, notable deployments at scale.

Skip: opinion pieces, listicles, how-to guides, product reviews, company PR or marketing pieces, sponsored content, minor feature updates, one company's internal changes or earnings, crypto/blockchain stories, general tech news that only tangentially mentions AI.

SEMANTIC DEDUPLICATION & CONTEXTUAL FILTERING:
- Group the incoming stories by the real-world event they cover first. If multiple sources cover the same event (even with completely different words or focus), group them and consider only the single most authoritative article.
- Do NOT select two stories about the same event. All selected stories must cover completely distinct real-world events.
- Carefully review the 'ALREADY POSTED' stories below. You MUST NOT select any story that covers the same real-world event or its immediate direct follow-up, even if written differently or containing different details.
${recentBlock}
For each story write:
- headline: factual, max 10 words, no hype. USE the company name (e.g. "OpenAI releases new reasoning model" not "AI company releases new model"). No jargon a non-technical reader wouldn't understand.
- summary: 1 sentence, max 20 words. DO NOT repeat the headline. Add context, numbers, or consequences. Do NOT name-drop third-party products or brands in the summary.
- event_rationale: 1 short sentence explaining exactly what real-world event this covers and how it is semantically distinct from all other selections and recently posted stories.

Write like a wire service. Plain, direct, no filler.

BANNED WORDS: "signifies", "highlights", "underscores", "reshapes", "poised", "bolsters", "notably", "landscape", "paradigm", "innovative", "robust", "leveraging", "cutting-edge", "game-changer", "pivotal", "crucial", "essential", "transformative", "marks a", "reflects".

Return ONLY a JSON array of exactly ${STORIES_PER_POST} objects: {"index", "headline", "summary", "event_rationale"}

${headlines}`;

  const text = await callGemini(prompt);

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`Could not parse Gemini response: ${text.substring(0, 200)}`);

  const selected = JSON.parse(jsonMatch[0]);
  
  return selected.map(s => ({
    ...s,
    link: newsItems[s.index - 1]?.link,
    source: newsItems[s.index - 1]?.source,
    originalTitle: newsItems[s.index - 1]?.title,
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

  return lines.join('\n\n');
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
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Web3 News', url: 'https://t.me/web3newsfeed' }],
        ],
      },
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
  const normalizedPostedLinks = new Set([...postedLinks].map(normalizeUrl));

  const fresh = allNews.filter(n => {
    if (normalizedPostedLinks.has(normalizeUrl(n.link))) return false;
    // Check against both rewritten headlines AND original titles stored from previous runs
    if (postedHeadlines.some(h => isSimilar(n.title, h, 0.4))) return false;
    return true;
  });
  console.log(`  ${fresh.length} not yet posted`);

  if (fresh.length < STORIES_PER_POST) {
    console.log('  Not enough fresh stories, skipping this run');
    return;
  }

  console.log('Asking Gemini to filter & summarize...');
  const recentHeadlines = postedHeadlines.slice(-30);
  const rawStories = await filterAndSummarize(fresh, recentHeadlines);

  // Programmatically validate and deduplicate Gemini's selection
  const stories = [];
  const seenIndices = new Set();
  const seenUrls = new Set();

  for (const story of rawStories) {
    const idx = story.index;
    const originalItem = fresh[idx - 1];
    if (!originalItem) continue; // Out of bounds
    if (seenIndices.has(idx)) continue; // Duplicate index selection

    const normUrl = normalizeUrl(originalItem.link);
    if (seenUrls.has(normUrl)) continue; // Duplicate URL in selection

    // Programmatic check: prevent similarity with past headlines or currently selected ones
    if (postedHeadlines.some(h => isSimilar(story.headline, h, 0.4))) {
      console.log(`⚠️ Pruned Gemini selection due to similarity with past headline: "${story.headline}"`);
      continue;
    }
    if (stories.some(s => isSimilar(story.headline, s.headline, 0.4))) {
      console.log(`⚠️ Pruned Gemini selection due to similarity with another selected headline: "${story.headline}"`);
      continue;
    }

    seenIndices.add(idx);
    seenUrls.add(normUrl);
    stories.push(story);
  }

  // Dynamic Backfill Loop: if Gemini's returned selection is incomplete or had duplicates/errors
  if (stories.length < STORIES_PER_POST) {
    console.log(`⚠️ Gemini selection had duplicates/errors. Got ${stories.length}/${STORIES_PER_POST}. Backfilling...`);
    for (let i = 0; i < fresh.length; i++) {
      if (stories.length >= STORIES_PER_POST) break;
      const idx = i + 1;
      if (seenIndices.has(idx)) continue;

      const item = fresh[i];
      const normUrl = normalizeUrl(item.link);
      if (seenUrls.has(normUrl)) continue;

      console.log(`  Backfilling with story: ${item.title}`);
      try {
        const summaryPrompt = `Rewrite this AI news headline and snippet into a factual plain-English digest.
Headline: ${item.title}
Snippet: ${item.snippet}

Write:
- headline: factual, max 10 words, no hype.
- summary: 1 sentence, max 20 words. Do not repeat the headline.

BANNED WORDS: "signifies", "highlights", "underscores", "reshapes", "poised", "bolsters", "notably", "landscape", "paradigm", "innovative", "robust", "leveraging", "cutting-edge", "game-changer", "pivotal", "crucial", "essential", "transformative", "marks a", "reflects".

Return ONLY JSON: {"headline": "...", "summary": "..."}`;
        const sumText = await callGemini(summaryPrompt);
        const jsonMatch = sumText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);

          // Programmatic check: prevent similarity with past headlines or currently selected ones
          if (postedHeadlines.some(h => isSimilar(parsed.headline, h, 0.4))) {
            console.log(`⚠️ Pruned backfilled story due to similarity with past headline: "${parsed.headline}"`);
            continue;
          }
          if (stories.some(s => isSimilar(parsed.headline, s.headline, 0.4))) {
            console.log(`⚠️ Pruned backfilled story due to similarity with another selected headline: "${parsed.headline}"`);
            continue;
          }

          stories.push({
            index: idx,
            headline: parsed.headline,
            summary: parsed.summary,
            link: item.link,
            source: item.source,
            originalTitle: item.title
          });
          seenIndices.add(idx);
          seenUrls.add(normUrl);
        }
      } catch (e) {
        console.warn(`  Failed to summarize backfill story: ${e.message}`);
      }
    }
  }

  console.log(`  Final validated ${stories.length} stories`);

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

  // Mark as posted (store link, rewritten headline, AND original RSS title for cross-source dedup)
  for (const s of stories) {
    if (s.link) posted.add(s.link);
    if (s.headline) posted.add(s.headline);
    if (s.originalTitle) posted.add(s.originalTitle);
  }
  savePosted(posted);
}

postOnce().catch(e => { console.error(e); process.exit(1); });
