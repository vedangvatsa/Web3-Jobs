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
import {
  alreadyCovered,
  isSimilar,
  normalizeUrl,
  postedTexts,
  recentPostedTexts,
  rememberPostedStory,
  sameEvent,
  trimPostedLog,
} from './news-story-dedup.mjs';

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
  { url: 'https://arstechnica.com/ai/feed/', source: 'Ars Technica' },
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
  fs.writeFileSync(POSTED_LOG, JSON.stringify(trimPostedLog(posted), null, 2));
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

    if (!unique.some(u => sameEvent(item.title + ' ' + item.snippet, u.title + ' ' + u.snippet) || normalizeUrl(u.link) === normUrl)) {
      unique.push(item);
      seenUrls.add(normUrl);
    }
  }

  return unique;
}

// ── Gemini: filter + summarize ──
// 2.0 / 1.5 flash 404 on current API keys. Match cvin.bio parse fallbacks.
const MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-latest',
];

function extractGeminiText(data) {
  const parts = data.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || '').join('').trim();
}

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
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 4096,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (res.status === 503 || res.status === 429) {
          console.warn(`  ${model} unavailable (${res.status}), retrying...`);
          await new Promise(r => setTimeout(r, 3000));
          if (attempt === 1) break;
          continue;
        }

        if (!res.ok) {
          const err = await res.text();
          console.warn(`  ${model} error ${res.status}: ${err.slice(0, 180)}`);
          break;
        }

        const data = await res.json();
        const text = extractGeminiText(data)
          .replace(/^```json\s*/i, '')
          .replace(/\s*```$/, '')
          .trim();
        if (!text) {
          console.warn(`  ${model} empty response, trying next model...`);
          break;
        }
        console.log(`  Using model: ${model}`);
        return text;
      } catch (e) {
        console.warn(`  ${model} failed: ${e.message}`);
      }
    }
  }
  throw new Error('All Gemini models failed');
}

async function filterAndSummarize(newsItems, recentHeadlines = [], pickCount = STORIES_PER_POST) {
  const want = Math.max(1, Math.min(pickCount, STORIES_PER_POST, newsItems.length));
  const headlines = newsItems.slice(0, 30).map((n, i) => (
    `${i + 1}. [${n.source}] ${n.title}\n   ${n.snippet}`
  )).join('\n\n');

  // Include recently posted headlines so Gemini avoids the same events
  const recentBlock = recentHeadlines.length > 0
    ? `\n\nALREADY POSTED (do NOT pick stories about the same events, even if worded differently):\n${recentHeadlines.map(h => `- ${h}`).join('\n')}\n`
    : '';

  const prompt = `Pick the ${want} most important AI industry stories from these ${Math.min(newsItems.length, 30)} items.

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

Return ONLY a JSON array of exactly ${want} objects: {"index", "original_title", "headline", "summary", "event_rationale"}

${headlines}`;

  const text = await callGemini(prompt);

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`Could not parse Gemini response: ${text.substring(0, 200)}`);

  const selected = JSON.parse(jsonMatch[0]);

  return selected.map(s => {
    let actualIndex = newsItems.findIndex(n => n.title === s.original_title);
    
    // Fuzzy fallback if Gemini slightly altered the title
    if (actualIndex === -1 && s.original_title) {
      actualIndex = newsItems.findIndex(n => isSimilar(n.title, s.original_title, 0.4));
    }
    
    // Extreme fallback to the index Gemini provided
    if (actualIndex === -1) {
      actualIndex = s.index - 1;
    }
    
    const item = newsItems[actualIndex] || newsItems[0];
                 
    return {
      ...s,
      index: actualIndex + 1, // Fix the index so downstream code uses the correct one
      link: item.link,
      source: item.source,
      originalTitle: item.title,
    };
  });
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

  // Filter out already posted (by link AND by recent event match on titles)
  const posted = loadPosted();
  const allPostedHeadlines = postedTexts(posted);
  const recentCovered = recentPostedTexts(allPostedHeadlines);
  const postedLinks = [...posted].filter(p => /^https?:\/\//i.test(p));
  const normalizedPostedLinks = new Set([...postedLinks].map(normalizeUrl));

  const fresh = allNews.filter(n => {
    if (normalizedPostedLinks.has(normalizeUrl(n.link))) return false;
    // Title-only: snippets share generic AI wording and caused false blocks.
    if (alreadyCovered(n.title, recentCovered)) return false;
    return true;
  });
  console.log(`  ${fresh.length} not yet posted`);

  const MIN_STORIES = 1;
  if (fresh.length < MIN_STORIES) {
    console.log(`  Only ${fresh.length} fresh stories (need ${MIN_STORIES}), skipping this run`);
    return;
  }

  console.log('Asking Gemini to filter & summarize...');
  const recentHeadlines = recentCovered.filter((h) => !String(h).startsWith('fp:')).slice(-80);
  const pickCount = Math.min(STORIES_PER_POST, fresh.length);
  const rawStories = await filterAndSummarize(fresh, recentHeadlines, pickCount);

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

    const candidate = `${story.headline} ${story.summary || ''} ${originalItem.title}`;
    if (alreadyCovered(candidate, recentCovered) || alreadyCovered(story.headline, recentCovered)) {
      console.log(`⚠️ Pruned Gemini selection due to similarity with past headline: "${story.headline}"`);
      continue;
    }
    if (stories.some(s => alreadyCovered(
      `${story.headline} ${story.summary || ''} ${originalItem.title}`,
      [`${s.headline} ${s.summary || ''} ${s.originalTitle || ''}`]
    ))) {
      console.log(`⚠️ Pruned Gemini selection due to similarity with another selected headline: "${story.headline}"`);
      continue;
    }

    seenIndices.add(idx);
    seenUrls.add(normUrl);
    stories.push(story);
  }

  const targetCount = Math.min(STORIES_PER_POST, fresh.length);
  if (stories.length < targetCount) {
    console.log(`⚠️ Gemini selection had duplicates/errors. Got ${stories.length}/${targetCount}. Backfilling...`);
    for (let i = 0; i < fresh.length; i++) {
      if (stories.length >= targetCount) break;
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

          const candidate = `${parsed.headline} ${parsed.summary || ''} ${item.title}`;
          if (alreadyCovered(candidate, recentCovered) || alreadyCovered(parsed.headline, recentCovered)) {
            console.log(`⚠️ Pruned backfilled story due to similarity with past headline: "${parsed.headline}"`);
            continue;
          }
          if (stories.some(s => alreadyCovered(
            candidate,
            [`${s.headline} ${s.summary || ''} ${s.originalTitle || ''}`]
          ))) {
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

  if (stories.length === 0) {
    console.log('  No valid stories after filtering, skipping this run');
    return;
  }

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
    rememberPostedStory(posted, s);
  }
  savePosted(posted);
}

postOnce()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
